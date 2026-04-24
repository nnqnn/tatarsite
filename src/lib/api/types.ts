export type Language = "ru" | "tt" | "en";

export type InterestCategory =
  | "culture"
  | "food"
  | "nature"
  | "events"
  | "crafts"
  | "history"
  | "hidden"
  | "festivals"
  | "market";

export type ReactionType = "LIKE" | "DISLIKE" | null;

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio?: string | null;
  language: Language;
  onboardingCompleted: boolean;
}

export interface MeUser extends User {
  interests: InterestCategory[];
  stats: {
    placesCount: number;
    reactionsCount: number;
    commentsCount: number;
  };
}

export interface Place {
  id: string;
  title: string;
  description: string;
  category: InterestCategory;
  isEvent: boolean;
  eventStartAt: string | null;
  eventEndAt: string | null;
  location: {
    latitude: number;
    longitude: number;
    address: string | null;
    city: string | null;
  };
  images: Array<{ id: string; url: string }>;
  thumbnailUrl: string | null;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    language: Language;
  };
  counts: {
    reactions: number;
    comments: number;
  };
  viewerReaction: ReactionType;
  createdAt: string;
  updatedAt: string;
  recommendationScore?: number;
}

export interface Comment {
  id: string;
  placeId: string;
  parentCommentId: string | null;
  body: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    language: Language;
  };
}

export interface ThreadedComment extends Comment {
  replies: Comment[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RoutePlanPoint {
  order: number;
  placeId: string;
  title: string;
  description: string;
  category: InterestCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  estimatedDurationMinutes: number;
  estimatedTravelMinutes: number;
  estimatedStopMinutes: number;
  distanceFromPreviousKm: number;
  imageUrl: string | null;
}
