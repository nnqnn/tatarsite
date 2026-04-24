import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { decodeCursor, encodeCursor } from "../../utils/cursor.js";
import { HttpError } from "../../utils/http-error.js";
import { mapLanguageToClient } from "../../utils/category.js";

const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const createCommentSchema = z.object({
  body: z.string().min(1, "Комментарий не может быть пустым").max(2000),
  parentCommentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  body: z.string().min(1).max(2000),
});

function serializeComment(comment: {
  id: string;
  placeId: string;
  parentCommentId: string | null;
  body: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    language: Parameters<typeof mapLanguageToClient>[0];
  };
}) {
  return {
    id: comment.id,
    placeId: comment.placeId,
    parentCommentId: comment.parentCommentId,
    body: comment.isDeleted ? "Комментарий удалён" : comment.body,
    isDeleted: comment.isDeleted,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: {
      id: comment.author.id,
      name: comment.author.displayName,
      avatarUrl: comment.author.avatarUrl,
      language: mapLanguageToClient(comment.author.language),
    },
  };
}

export const commentsRouter = Router();

commentsRouter.get(
  "/places/:id/comments",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    const cursorStart = decodeCursor(query.cursor);

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

    const topLevelComments = await prisma.comment.findMany({
      where: {
        placeId: req.params.id,
        parentCommentId: null,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            language: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: cursorStart,
      take: query.limit,
    });

    const allTopLevelCount = await prisma.comment.count({
      where: {
        placeId: req.params.id,
        parentCommentId: null,
      },
    });

    const replyRows = topLevelComments.length
      ? await prisma.comment.findMany({
          where: {
            parentCommentId: {
              in: topLevelComments.map((comment) => comment.id),
            },
          },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                language: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        })
      : [];

    const repliesByParent = new Map<string, typeof replyRows>();
    for (const reply of replyRows) {
      const key = reply.parentCommentId!;
      const current = repliesByParent.get(key) ?? [];
      current.push(reply);
      repliesByParent.set(key, current);
    }

    const nextIndex = cursorStart + topLevelComments.length;

    res.json({
      items: topLevelComments.map((comment) => ({
        ...serializeComment(comment),
        replies: (repliesByParent.get(comment.id) ?? []).map((reply) => serializeComment(reply)),
      })),
      pagination: {
        cursor: query.cursor ?? null,
        nextCursor: nextIndex < allTopLevelCount ? encodeCursor(nextIndex) : null,
        hasMore: nextIndex < allTopLevelCount,
      },
    });
  }),
);

commentsRouter.post(
  "/places/:id/comments",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = createCommentSchema.parse(req.body);

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

    if (payload.parentCommentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: payload.parentCommentId },
      });

      if (!parent || parent.placeId !== req.params.id) {
        throw new HttpError(400, "Некорректный родительский комментарий");
      }
    }

    const created = await prisma.comment.create({
      data: {
        placeId: req.params.id,
        authorId: req.user!.id,
        parentCommentId: payload.parentCommentId,
        body: payload.body,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            language: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Комментарий добавлен",
      comment: serializeComment(created),
    });
  }),
);

commentsRouter.patch(
  "/comments/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = updateCommentSchema.parse(req.body);

    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) {
      throw new HttpError(404, "Комментарий не найден");
    }

    if (comment.authorId !== req.user!.id) {
      throw new HttpError(403, "Можно редактировать только свои комментарии");
    }

    const updated = await prisma.comment.update({
      where: { id: req.params.id },
      data: { body: payload.body },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            language: true,
          },
        },
      },
    });

    res.json({
      message: "Комментарий обновлён",
      comment: serializeComment(updated),
    });
  }),
);

commentsRouter.delete(
  "/comments/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) {
      throw new HttpError(404, "Комментарий не найден");
    }

    if (comment.authorId !== req.user!.id) {
      throw new HttpError(403, "Можно удалять только свои комментарии");
    }

    await prisma.comment.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        body: "",
      },
    });

    res.json({ message: "Комментарий удалён" });
  }),
);
