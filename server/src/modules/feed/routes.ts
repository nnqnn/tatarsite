import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { decodeCursor, encodeCursor } from "../../utils/cursor.js";
import { haversineDistanceKm } from "../../utils/geo.js";
import { mapCategoryToClient } from "../../utils/category.js";
import { DEMO_USER_EMAILS } from "../../utils/demo-content.js";
import { serializePlace } from "../places/serializePlace.js";

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(10),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

function normalize(value: number, max = 1): number {
  if (value <= 0) return 0;
  return Math.min(value / max, 1);
}

function calculateFreshnessScore(createdAt: Date): number {
  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return Math.max(0, 1 - ageHours / (24 * 14));
}

function calculateProximityScore(
  latitude: number | undefined,
  longitude: number | undefined,
  place: { latitude: number; longitude: number },
): number {
  if (latitude === undefined || longitude === undefined) {
    return 0.5;
  }

  const distance = haversineDistanceKm(latitude, longitude, place.latitude, place.longitude);
  return 1 / (1 + distance / 10);
}

export const feedRouter = Router();

feedRouter.get(
  "/recommended",
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = querySchema.parse(req.query);
    const cursorStart = decodeCursor(query.cursor);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { preferences: true },
    });

    const preferredCategories = new Set(user?.preferences.map((pref) => pref.interestKey) ?? []);

    const places = await prisma.place.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        isEvent: false,
        author: {
          email: {
            notIn: [...DEMO_USER_EMAILS],
          },
        },
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
        reactions: {
          where: {
            userId: req.user!.id,
          },
          select: {
            reactionType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 300,
    });

    const scored = places.map((place) => {
      const prefMatch = preferredCategories.has(place.category) ? 1 : 0;
      const proximity = calculateProximityScore(query.latitude, query.longitude, place);
      const engagement = normalize(place._count.reactions * 1 + place._count.comments * 0.5, 25);
      const freshness = calculateFreshnessScore(place.createdAt);

      const score = 0.45 * prefMatch + 0.2 * proximity + 0.2 * engagement + 0.15 * freshness;

      return {
        place,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score || b.place.createdAt.getTime() - a.place.createdAt.getTime());

    const sliced = scored.slice(cursorStart, cursorStart + query.limit);
    const nextIndex = cursorStart + query.limit;
    const hasMore = nextIndex < scored.length;

    res.json({
      items: sliced.map((item) => ({
        ...serializePlace(item.place),
        recommendationScore: Number(item.score.toFixed(4)),
      })),
      pagination: {
        cursor: query.cursor ?? null,
        nextCursor: hasMore ? encodeCursor(nextIndex) : null,
        hasMore,
      },
      metadata: {
        preferredCategories: Array.from(preferredCategories).map((item) => mapCategoryToClient(item)),
      },
    });
  }),
);

feedRouter.get(
  "/trending",
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = querySchema.parse(req.query);
    const cursorStart = decodeCursor(query.cursor);

    const places = await prisma.place.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        isEvent: false,
        author: {
          email: {
            notIn: [...DEMO_USER_EMAILS],
          },
        },
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
        reactions: {
          where: {
            userId: req.user!.id,
          },
          select: {
            reactionType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 300,
    });

    const scored = places.map((place) => {
      const engagement = place._count.reactions * 1 + place._count.comments * 0.5;
      const freshness = calculateFreshnessScore(place.createdAt);
      return {
        place,
        score: engagement + freshness,
      };
    });

    scored.sort((a, b) => b.score - a.score || b.place.createdAt.getTime() - a.place.createdAt.getTime());

    const sliced = scored.slice(cursorStart, cursorStart + query.limit);
    const nextIndex = cursorStart + query.limit;
    const hasMore = nextIndex < scored.length;

    res.json({
      items: sliced.map((item) => serializePlace(item.place)),
      pagination: {
        cursor: query.cursor ?? null,
        nextCursor: hasMore ? encodeCursor(nextIndex) : null,
        hasMore,
      },
    });
  }),
);

feedRouter.get(
  "/following",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({
      items: [],
      pagination: {
        cursor: null,
        nextCursor: null,
        hasMore: false,
      },
      message: "Лента подписок будет добавлена в следующих версиях",
    });
  }),
);
