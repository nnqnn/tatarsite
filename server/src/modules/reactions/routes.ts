import { ReactionType } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";

const reactionSchema = z.object({
  reactionType: z.enum(["LIKE", "DISLIKE", "NONE"]),
});

export const reactionsRouter = Router();

reactionsRouter.put(
  "/:id/reaction",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { reactionType } = reactionSchema.parse(req.body);

    const place = await prisma.place.findFirst({
      where: {
        id: req.params.id,
        deletedAt: null,
        isPublished: true,
      },
    });

    if (!place) {
      throw new HttpError(404, "Место не найдено");
    }

    if (reactionType === "NONE") {
      await prisma.placeReaction.deleteMany({
        where: {
          placeId: req.params.id,
          userId: req.user!.id,
        },
      });

      res.json({
        message: "Реакция удалена",
        reactionType: null,
      });
      return;
    }

    const reaction = await prisma.placeReaction.upsert({
      where: {
        userId_placeId: {
          userId: req.user!.id,
          placeId: req.params.id,
        },
      },
      create: {
        userId: req.user!.id,
        placeId: req.params.id,
        reactionType: reactionType as ReactionType,
      },
      update: {
        reactionType: reactionType as ReactionType,
      },
    });

    res.json({
      message: "Реакция сохранена",
      reactionType: reaction.reactionType,
    });
  }),
);

reactionsRouter.get(
  "/:id/reactions/summary",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const place = await prisma.place.findFirst({
      where: {
        id: req.params.id,
        deletedAt: null,
        isPublished: true,
      },
    });

    if (!place) {
      throw new HttpError(404, "Место не найдено");
    }

    const grouped = await prisma.placeReaction.groupBy({
      by: ["reactionType"],
      where: {
        placeId: req.params.id,
      },
      _count: {
        _all: true,
      },
    });

    const summary = {
      likes: grouped.find((item) => item.reactionType === "LIKE")?._count._all ?? 0,
      dislikes: grouped.find((item) => item.reactionType === "DISLIKE")?._count._all ?? 0,
    };

    let viewerReaction: ReactionType | null = null;
    if (req.user) {
      const row = await prisma.placeReaction.findUnique({
        where: {
          userId_placeId: {
            userId: req.user.id,
            placeId: req.params.id,
          },
        },
      });
      viewerReaction = row?.reactionType ?? null;
    }

    res.json({
      placeId: req.params.id,
      ...summary,
      viewerReaction,
    });
  }),
);
