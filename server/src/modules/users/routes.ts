import { PlaceCategory } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { mapCategoryToClient, mapLanguageToClient, parseCategoryFromClient, parseLanguageFromClient } from "../../utils/category.js";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(60).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  language: z.enum(["ru", "tt", "en"]).optional(),
});

const preferencesSchema = z.object({
  interests: z.array(z.enum(["culture", "food", "nature", "events", "crafts", "history", "hidden", "festivals", "market"]))
    .min(1, "Выберите хотя бы один интерес")
    .max(9),
  language: z.enum(["ru", "tt", "en"]),
});

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        preferences: true,
        _count: {
          select: {
            places: true,
            reactions: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpError(404, "Пользователь не найден");
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        language: mapLanguageToClient(user.language),
        onboardingCompleted: Boolean(user.onboardingCompletedAt),
        interests: user.preferences.map((item) => mapCategoryToClient(item.interestKey)),
        stats: {
          placesCount: user._count.places,
          reactionsCount: user._count.reactions,
          commentsCount: user._count.comments,
        },
      },
    });
  }),
);

usersRouter.patch(
  "/me",
  asyncHandler(async (req, res) => {
    const payload = updateProfileSchema.parse(req.body ?? {});

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        displayName: payload.displayName,
        bio: payload.bio,
        avatarUrl: payload.avatarUrl,
        language: payload.language ? parseLanguageFromClient(payload.language) : undefined,
      },
    });

    res.json({
      message: "Профиль обновлён",
      user: {
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio,
        language: mapLanguageToClient(updated.language),
        onboardingCompleted: Boolean(updated.onboardingCompletedAt),
      },
    });
  }),
);

usersRouter.get(
  "/me/preferences",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { preferences: true },
    });

    if (!user) {
      throw new HttpError(404, "Пользователь не найден");
    }

    res.json({
      language: mapLanguageToClient(user.language),
      interests: user.preferences.map((pref) => mapCategoryToClient(pref.interestKey)),
      onboardingCompleted: Boolean(user.onboardingCompletedAt),
    });
  }),
);

usersRouter.post(
  "/me/preferences",
  asyncHandler(async (req, res) => {
    const payload = preferencesSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      throw new HttpError(404, "Пользователь не найден");
    }

    if (user.onboardingCompletedAt) {
      throw new HttpError(409, "Предпочтения уже сохранены");
    }

    const interests = payload.interests.map((item) => parseCategoryFromClient(item));

    await prisma.$transaction(async (tx) => {
      await tx.userPreference.deleteMany({ where: { userId: req.user!.id } });
      await tx.userPreference.createMany({
        data: interests.map((interestKey: PlaceCategory) => ({
          userId: req.user!.id,
          interestKey,
        })),
      });

      await tx.user.update({
        where: { id: req.user!.id },
        data: {
          language: parseLanguageFromClient(payload.language),
          onboardingCompletedAt: new Date(),
        },
      });
    });

    res.status(201).json({
      message: "Предпочтения сохранены",
      interests: payload.interests,
      language: payload.language,
    });
  }),
);

usersRouter.get(
  "/:id/places",
  asyncHandler(async (req, res) => {
    const targetUserId = req.params.id;
    const isOwner = req.user?.id === targetUserId;

    const places = await prisma.place.findMany({
      where: {
        authorId: targetUserId,
        deletedAt: null,
        ...(isOwner
          ? {}
          : {
              isPublished: true,
            }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            language: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
        reactions: {
          where: { userId: req.user!.id },
          select: { reactionType: true },
        },
      },
    });

    res.json({
      items: places.map((place) => ({
        id: place.id,
        title: place.title,
        description: place.description,
        category: mapCategoryToClient(place.category),
        isEvent: place.isEvent,
        eventStartAt: place.eventStartAt,
        eventEndAt: place.eventEndAt,
        location: {
          latitude: place.latitude,
          longitude: place.longitude,
          address: place.address,
          city: place.city,
        },
        images: place.images.map((image) => ({ id: image.id, url: image.url })),
        thumbnailUrl: place.images[0]?.url ?? null,
        author: {
          id: place.author.id,
          name: place.author.displayName,
          avatarUrl: place.author.avatarUrl,
          language: mapLanguageToClient(place.author.language),
        },
        counts: {
          reactions: place._count.reactions,
          comments: place._count.comments,
        },
        viewerReaction: place.reactions[0]?.reactionType ?? null,
        createdAt: place.createdAt,
        updatedAt: place.updatedAt,
      })),
    });
  }),
);
