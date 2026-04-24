import { clearStoredTokens, getStoredTokens, setStoredTokens } from "../auth/session";
import type {
  AuthTokens,
  InterestCategory,
  Language,
  MeUser,
  Place,
  ReactionType,
  RoutePlanPoint,
  ThreadedComment,
  User,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    const tokens = getStoredTokens();
    if (tokens) {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
    }
  }

  get hasSession(): boolean {
    return Boolean(this.accessToken && this.refreshToken);
  }

  private setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    setStoredTokens(tokens);
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    clearStoredTokens();
  }

  private async refreshTokens(): Promise<void> {
    if (!this.refreshToken) {
      throw new ApiError(401, "Сессия истекла");
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        throw new ApiError(401, "Сессия истекла, выполните вход снова");
      }

      const data = (await response.json()) as { tokens: AuthTokens };
      this.setTokens(data.tokens);
    })()
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private async request<T>(
    path: string,
    options: RequestInit & { auth?: boolean } = {},
    retry = true,
  ): Promise<T> {
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (options.auth !== false && this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
      if (response.status === 401 && retry && options.auth !== false && this.refreshToken) {
        await this.refreshTokens();
        return this.request<T>(path, options, false);
      }

      const message = payload?.message || "Ошибка запроса";
      throw new ApiError(response.status, message);
    }

    return payload as T;
  }

  async register(input: { email: string; password: string; displayName: string }): Promise<User> {
    const data = await this.request<{ user: User; tokens: AuthTokens }>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(input),
    });
    this.setTokens(data.tokens);
    return data.user;
  }

  async login(input: { email: string; password: string }): Promise<User> {
    const data = await this.request<{ user: User; tokens: AuthTokens }>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(input),
    });
    this.setTokens(data.tokens);
    return data.user;
  }

  async logout(): Promise<void> {
    try {
      await this.request<{ message: string }>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    } finally {
      this.clearTokens();
    }
  }

  async getAuthMe(): Promise<User> {
    const data = await this.request<{ user: User }>("/auth/me");
    return data.user;
  }

  async getMe(): Promise<MeUser> {
    const data = await this.request<{ user: MeUser }>("/users/me");
    return data.user;
  }

  async savePreferences(input: { interests: InterestCategory[]; language: Language }): Promise<void> {
    await this.request<{ message: string }>("/users/me/preferences", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async getRecommendedFeed(input: {
    cursor?: string | null;
    limit?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<{ items: Place[]; nextCursor: string | null; hasMore: boolean }> {
    const query = new URLSearchParams();
    if (input.cursor) query.set("cursor", input.cursor);
    if (input.limit) query.set("limit", String(input.limit));
    if (input.latitude !== undefined) query.set("latitude", String(input.latitude));
    if (input.longitude !== undefined) query.set("longitude", String(input.longitude));

    const data = await this.request<{
      items: Place[];
      pagination: { nextCursor: string | null; hasMore: boolean };
    }>(`/feed/recommended?${query.toString()}`);

    return {
      items: data.items.map((place) => this.normalizePlace(place)),
      nextCursor: data.pagination.nextCursor,
      hasMore: data.pagination.hasMore,
    };
  }

  async getPlaces(filters: {
    category?: InterestCategory;
    isEvent?: boolean;
    city?: string;
    search?: string;
    authorId?: string;
    limit?: number;
  } = {}): Promise<Place[]> {
    const query = new URLSearchParams();
    if (filters.category) query.set("category", filters.category);
    if (filters.isEvent !== undefined) query.set("isEvent", String(filters.isEvent));
    if (filters.city) query.set("city", filters.city);
    if (filters.search) query.set("search", filters.search);
    if (filters.authorId) query.set("authorId", filters.authorId);
    if (filters.limit) query.set("limit", String(filters.limit));

    const suffix = query.toString();
    const data = await this.request<{ items: Place[] }>(`/places${suffix ? `?${suffix}` : ""}`);

    return data.items.map((place) => this.normalizePlace(place));
  }

  async getUserPlaces(userId: string): Promise<Place[]> {
    const data = await this.request<{ places: Place[] }>(`/places/user/${userId}/list`);
    return data.places.map((place) => this.normalizePlace(place));
  }

  async createPlace(input: {
    title: string;
    description: string;
    category: InterestCategory;
    isEvent?: boolean;
    eventStartAt?: string;
    eventEndAt?: string;
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    imageUrls?: string[];
  }): Promise<Place> {
    const data = await this.request<{ place: Place }>("/places", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return this.normalizePlace(data.place);
  }

  async uploadPlaceImages(placeId: string, files: File[]): Promise<void> {
    if (!files.length) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append("images", file);
    }

    await this.request(`/places/${placeId}/images`, {
      method: "POST",
      body: formData,
    });
  }

  async reactToPlace(placeId: string, reactionType: "LIKE" | "DISLIKE" | "NONE"): Promise<ReactionType> {
    const data = await this.request<{ reactionType: ReactionType }>(`/places/${placeId}/reaction`, {
      method: "PUT",
      body: JSON.stringify({ reactionType }),
    });

    return data.reactionType;
  }

  async getComments(placeId: string): Promise<ThreadedComment[]> {
    const data = await this.request<{ items: ThreadedComment[] }>(`/places/${placeId}/comments`);
    return data.items;
  }

  async addComment(placeId: string, body: string, parentCommentId?: string): Promise<void> {
    await this.request(`/places/${placeId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body, parentCommentId }),
    });
  }

  async generateRoute(input: {
    latitude?: number;
    longitude?: number;
    maxPlaces?: number;
  }): Promise<{
    totalPoints: number;
    estimatedTotalDurationMinutes: number;
    points: RoutePlanPoint[];
  }> {
    const data = await this.request<{
      totalPoints: number;
      estimatedTotalDurationMinutes: number;
      points: RoutePlanPoint[];
    }>("/routes/generate", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return {
      ...data,
      points: data.points.map((point) => ({
        ...point,
        imageUrl: this.normalizeImageUrl(point.imageUrl),
      })),
    };
  }

  private normalizeImageUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
    return `${API_ORIGIN}/${url}`;
  }

  private normalizePlace(place: Place): Place {
    return {
      ...place,
      thumbnailUrl: this.normalizeImageUrl(place.thumbnailUrl),
      images: place.images.map((image) => ({
        ...image,
        url: this.normalizeImageUrl(image.url) ?? image.url,
      })),
    };
  }
}

export const apiClient = new ApiClient();
export { ApiError };
