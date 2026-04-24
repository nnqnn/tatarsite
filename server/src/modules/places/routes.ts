import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { parseCategoryFromClient } from "../../utils/category.js";
import { DEMO_USER_EMAILS } from "../../utils/demo-content.js";
import { HttpError } from "../../utils/http-error.js";
import { serializePlace } from "./serializePlace.js";

const createPlaceSchema = z.object({
  title: z.string().min(3, "Название должно быть не короче 3 символов").max(120),
  description: z.string().min(10, "Описание должно быть не короче 10 символов").max(2000),
  category: z.enum(["culture", "food", "nature", "events", "crafts", "history", "hidden", "festivals", "market"]),
  isEvent: z.boolean().optional(),
  eventStartAt: z.coerce.date().optional(),
  eventEndAt: z.coerce.date().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
  isPublished: z.boolean().optional(),
}).superRefine((value, ctx) => {
  if (value.isEvent && !value.eventStartAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Для события нужно указать дату и время начала",
      path: ["eventStartAt"],
    });
  }

  if (value.eventStartAt && value.eventEndAt && value.eventEndAt < value.eventStartAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Время окончания не может быть раньше начала",
      path: ["eventEndAt"],
    });
  }
});

const updatePlaceSchema = z.object({
  title: z.string().min(3, "Название должно быть не короче 3 символов").max(120).optional(),
  description: z.string().min(10, "Описание должно быть не короче 10 символов").max(2000).optional(),
  category: z.enum(["culture", "food", "nature", "events", "crafts", "history", "hidden", "festivals", "market"]).optional(),
  isEvent: z.boolean().optional(),
  eventStartAt: z.coerce.date().optional(),
  eventEndAt: z.coerce.date().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
  isPublished: z.boolean().optional(),
}).superRefine((value, ctx) => {
  if (value.eventStartAt && value.eventEndAt && value.eventEndAt < value.eventStartAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Время окончания не может быть раньше начала",
      path: ["eventEndAt"],
    });
  }
});
const listPlacesQuerySchema = z.object({
  category: z
    .enum(["culture", "food", "nature", "events", "crafts", "history", "hidden", "festivals", "market"])
    .optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  authorId: z.string().optional(),
  isEvent: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 10,
  },
});

export const placesRouter = Router();

placesRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const query = listPlacesQuerySchema.parse(req.query);

    const where = {
      deletedAt: null,
      isPublished: true,
      author: {
        email: {
          notIn: [...DEMO_USER_EMAILS],
        },
      },
      category: query.category ? parseCategoryFromClient(query.category) : undefined,
      isEvent: query.isEvent,
      city: query.city ? { contains: query.city, mode: "insensitive" as const } : undefined,
      authorId: query.authorId,
      OR: query.search
        ? [
            {
              title: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
            {
              address: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
          ]
        : undefined,
    };

    const places = await prisma.place.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit,
      include: {
        images: true,
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
        reactions: req.user
          ? {
              where: { userId: req.user.id },
              select: { reactionType: true },
            }
          : false,
      },
    });

    res.json({
      items: places.map((place) => serializePlace(place)),
    });
  }),
);

placesRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = createPlaceSchema.parse(req.body);

    const created = await prisma.place.create({
      data: {
        authorId: req.user!.id,
        title: payload.title,
        description: payload.description,
        category: parseCategoryFromClient(payload.category),
        isEvent: payload.isEvent ?? false,
        eventStartAt: payload.eventStartAt,
        eventEndAt: payload.eventEndAt,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        city: payload.city,
        isPublished: payload.isPublished ?? true,
        images: payload.imageUrls?.length
          ? {
              create: payload.imageUrls.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
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
      },
    });

    res.status(201).json({
      message: "Место создано",
      place: serializePlace(created),
    });
  }),
);

placesRouter.post(
  "/:id/images",
  requireAuth,
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    const place = await prisma.place.findUnique({ where: { id: req.params.id } });
    if (!place || place.deletedAt || !place.isPublished) {
      throw new HttpError(404, "Место не найдено");
    }

    if (place.authorId !== req.user!.id) {
      throw new HttpError(403, "Можно загружать изображения только в свои места");
    }

    const files = (req.files as Express.Multer.File[]) ?? [];
    if (!files.length) {
      throw new HttpError(400, "Файлы не переданы");
    }

    const existingCount = await prisma.placeImage.count({ where: { placeId: place.id } });

    const createdImages = await prisma.$transaction(
      files.map((file, index) =>
        prisma.placeImage.create({
          data: {
            placeId: place.id,
            storageKey: file.filename,
            url: `/uploads/${file.filename}`,
            sortOrder: existingCount + index,
          },
        }),
      ),
    );

    res.status(201).json({
      message: "Изображения загружены",
      images: createdImages.map((item) => ({ id: item.id, url: item.url })),
    });
  }),
);

placesRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const place = await prisma.place.findFirst({
      where: {
        id: req.params.id,
        deletedAt: null,
        isPublished: true,
      },
      include: {
        images: true,
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
        reactions: req.user
          ? {
              where: { userId: req.user.id },
              select: { reactionType: true },
            }
          : false,
      },
    });

    if (!place) {
      throw new HttpError(404, "Место не найдено");
    }

    res.json({
      place: serializePlace(place),
    });
  }),
);

placesRouter.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = updatePlaceSchema.parse(req.body ?? {});
    const place = await prisma.place.findUnique({ where: { id: req.params.id } });

    if (!place || place.deletedAt) {
      throw new HttpError(404, "Место не найдено");
    }

    if (place.authorId !== req.user!.id) {
      throw new HttpError(403, "Можно редактировать только свои места");
    }

    const updated = await prisma.place.update({
      where: { id: place.id },
      data: {
        title: payload.title,
        description: payload.description,
        category: payload.category ? parseCategoryFromClient(payload.category) : undefined,
        isEvent: payload.isEvent,
        eventStartAt: payload.eventStartAt,
        eventEndAt: payload.eventEndAt,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        city: payload.city,
        isPublished: payload.isPublished,
        images: payload.imageUrls
          ? {
              deleteMany: {},
              create: payload.imageUrls.map((url, index) => ({ url, sortOrder: index })),
            }
          : undefined,
      },
      include: {
        images: true,
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
      },
    });

    res.json({
      message: "Место обновлено",
      place: serializePlace(updated),
    });
  }),
);

placesRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const place = await prisma.place.findUnique({ where: { id: req.params.id } });
    if (!place || place.deletedAt) {
      throw new HttpError(404, "Место не найдено");
    }

    if (place.authorId !== req.user!.id) {
      throw new HttpError(403, "Можно удалять только свои места");
    }

    await prisma.place.update({
      where: { id: place.id },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
    });

    res.json({ message: "Место удалено" });
  }),
);

placesRouter.get(
  "/user/:userId/list",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const isOwner = req.user?.id === userId;

    const places = await prisma.place.findMany({
      where: {
        authorId: userId,
        deletedAt: null,
        ...(isOwner
          ? {}
          : {
              isPublished: true,
            }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
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
        reactions: req.user
          ? {
              where: { userId: req.user.id },
              select: { reactionType: true },
            }
          : false,
      },
    });

    res.json({
      places: places.map((place) => serializePlace(place)),
    });
  }),
);
