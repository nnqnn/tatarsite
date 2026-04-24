import { PlaceCategory } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { haversineDistanceKm } from "../../utils/geo.js";
import { mapCategoryToClient } from "../../utils/category.js";
import { DEMO_USER_EMAILS } from "../../utils/demo-content.js";

const generateSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  maxPlaces: z.coerce.number().int().min(2).max(10).default(5),
});

const stopMinutesByCategory: Record<PlaceCategory, number> = {
  [PlaceCategory.CULTURE]: 80,
  [PlaceCategory.FOOD]: 60,
  [PlaceCategory.NATURE]: 70,
  [PlaceCategory.EVENTS]: 100,
  [PlaceCategory.CRAFTS]: 75,
  [PlaceCategory.HISTORY]: 80,
  [PlaceCategory.HIDDEN]: 65,
  [PlaceCategory.FESTIVALS]: 110,
  [PlaceCategory.MARKET]: 55,
};

export const routeGeneratorRouter = Router();

routeGeneratorRouter.post(
  "/generate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = generateSchema.parse(req.body ?? {});

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { preferences: true },
    });

    const preferred = new Set(user?.preferences.map((item) => item.interestKey) ?? []);

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
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      take: 200,
    });

    if (!places.length) {
      res.json({
        totalPoints: 0,
        estimatedTotalDurationMinutes: 0,
        points: [],
      });
      return;
    }

    const scored = places.map((place) => {
      const prefScore = preferred.has(place.category) ? 1 : 0;
      const proximityScore =
        payload.latitude !== undefined && payload.longitude !== undefined
          ? 1 / (1 + haversineDistanceKm(payload.latitude, payload.longitude, place.latitude, place.longitude) / 8)
          : 0.55;
      const freshnessScore = Math.max(0, 1 - (Date.now() - place.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30));

      const score = 0.55 * prefScore + 0.3 * proximityScore + 0.15 * freshnessScore;
      return { place, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const candidatePool = scored.slice(0, Math.max(payload.maxPlaces * 4, 20));
    const remaining = [...candidatePool];
    const selected: typeof remaining = [];

    let currentLat = payload.latitude ?? remaining[0].place.latitude;
    let currentLng = payload.longitude ?? remaining[0].place.longitude;

    while (selected.length < payload.maxPlaces && remaining.length > 0) {
      let bestIndex = 0;
      let bestScore = -Infinity;

      for (let index = 0; index < remaining.length; index += 1) {
        const candidate = remaining[index];
        const distance = haversineDistanceKm(currentLat, currentLng, candidate.place.latitude, candidate.place.longitude);
        const proximity = 1 / (1 + distance / 6);
        const routeScore = 0.7 * candidate.score + 0.3 * proximity;

        if (routeScore > bestScore) {
          bestScore = routeScore;
          bestIndex = index;
        }
      }

      const [nextPoint] = remaining.splice(bestIndex, 1);
      selected.push(nextPoint);
      currentLat = nextPoint.place.latitude;
      currentLng = nextPoint.place.longitude;
    }

    let prevLat = payload.latitude;
    let prevLng = payload.longitude;
    let totalMinutes = 0;

    const points = selected.map((item, index) => {
      const place = item.place;
      const distanceFromPreviousKm =
        prevLat !== undefined && prevLng !== undefined
          ? haversineDistanceKm(prevLat, prevLng, place.latitude, place.longitude)
          : index === 0
            ? 0
            : haversineDistanceKm(
                selected[index - 1].place.latitude,
                selected[index - 1].place.longitude,
                place.latitude,
                place.longitude,
              );

      const estimatedTravelMinutes = Math.max(0, Math.round((distanceFromPreviousKm / 25) * 60));
      const estimatedStopMinutes = stopMinutesByCategory[place.category] ?? 60;
      const estimatedDurationMinutes = estimatedTravelMinutes + estimatedStopMinutes;
      totalMinutes += estimatedDurationMinutes;

      prevLat = place.latitude;
      prevLng = place.longitude;

      return {
        order: index + 1,
        placeId: place.id,
        title: place.title,
        description: place.description,
        category: mapCategoryToClient(place.category),
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
        city: place.city,
        estimatedDurationMinutes,
        estimatedTravelMinutes,
        estimatedStopMinutes,
        distanceFromPreviousKm: Number(distanceFromPreviousKm.toFixed(2)),
        imageUrl: place.images[0]?.url ?? null,
      };
    });

    res.json({
      totalPoints: points.length,
      estimatedTotalDurationMinutes: totalMinutes,
      points,
    });
  }),
);
