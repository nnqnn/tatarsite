import { Place, PlaceCategory, ReactionType, User } from "@prisma/client";
import { mapCategoryToClient, mapLanguageToClient } from "../../utils/category.js";

interface PlaceWithRelations extends Place {
  images: { id: string; url: string; sortOrder: number }[];
  author: Pick<User, "id" | "displayName" | "avatarUrl" | "language">;
  _count?: {
    reactions: number;
    comments: number;
  };
  reactions?: { reactionType: ReactionType }[];
}

export function serializePlace(place: PlaceWithRelations) {
  const firstImage = [...place.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return {
    id: place.id,
    title: place.title,
    description: place.description,
    category: mapCategoryToClient(place.category as PlaceCategory),
    isEvent: place.isEvent,
    eventStartAt: place.eventStartAt,
    eventEndAt: place.eventEndAt,
    location: {
      latitude: place.latitude,
      longitude: place.longitude,
      address: place.address,
      city: place.city,
    },
    images: place.images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({ id: image.id, url: image.url })),
    thumbnailUrl: firstImage?.url ?? null,
    author: {
      id: place.author.id,
      name: place.author.displayName,
      avatarUrl: place.author.avatarUrl,
      language: mapLanguageToClient(place.author.language),
    },
    counts: {
      reactions: place._count?.reactions ?? 0,
      comments: place._count?.comments ?? 0,
    },
    viewerReaction: place.reactions?.[0]?.reactionType ?? null,
    createdAt: place.createdAt,
    updatedAt: place.updatedAt,
  };
}
