import { Router } from "express";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { mapLanguageToClient } from "../../utils/category.js";
import { isRefreshTokenValid, revokeAllUserRefreshTokens, revokeRefreshToken, saveRefreshToken } from "./token-store.js";

const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен быть не менее 8 символов"),
  displayName: z.string().min(2, "Имя должно быть не короче 2 символов").max(60),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
  logoutAll: z.boolean().optional(),
});

function serializeUser(user: {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  language: Parameters<typeof mapLanguageToClient>[0];
  onboardingCompletedAt: Date | null;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    language: mapLanguageToClient(user.language),
    onboardingCompleted: Boolean(user.onboardingCompletedAt),
  };
}

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    if (existingUser) {
      throw new HttpError(409, "Пользователь с таким email уже существует");
    }

    const passwordHash = await argon2.hash(payload.password);

    const user = await prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        passwordHash,
        displayName: payload.displayName,
      },
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await saveRefreshToken(user.id, refreshToken);

    res.status(201).json({
      message: "Регистрация успешна",
      user: serializeUser(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email.toLowerCase(),
      },
    });

    if (!user) {
      throw new HttpError(401, "Неверный email или пароль");
    }

    const validPassword = await argon2.verify(user.passwordHash, payload.password);
    if (!validPassword) {
      throw new HttpError(401, "Неверный email или пароль");
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await saveRefreshToken(user.id, refreshToken);

    res.json({
      message: "Вход выполнен",
      user: serializeUser(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);

    if (!(await isRefreshTokenValid(refreshToken))) {
      throw new HttpError(401, "Refresh токен недействителен");
    }

    let payload: { userId: string; email: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      await revokeRefreshToken(refreshToken);
      throw new HttpError(401, "Refresh токен просрочен");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      await revokeRefreshToken(refreshToken);
      throw new HttpError(401, "Пользователь не найден");
    }

    await revokeRefreshToken(refreshToken);

    const newAccessToken = signAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await saveRefreshToken(user.id, newRefreshToken);

    res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  }),
);

authRouter.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = logoutSchema.parse(req.body ?? {});

    if (payload.logoutAll) {
      await revokeAllUserRefreshTokens(req.user!.id);
      res.json({ message: "Выход выполнен на всех устройствах" });
      return;
    }

    if (payload.refreshToken) {
      await revokeRefreshToken(payload.refreshToken);
    }

    res.json({ message: "Выход выполнен" });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      throw new HttpError(404, "Пользователь не найден");
    }

    res.json({ user: serializeUser(user) });
  }),
);
