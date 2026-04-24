# ТатарСайт Full-Stack Transformation Plan

## 1. Current Project Assessment

### 1.1 What exists now
- Frontend-only React + Vite app.
- Single in-memory app state in `src/App.tsx` using local `useState` and screen switching.
- No backend, no persistent database, no authentication.
- Hardcoded mock data in all major screens:
  - `Onboarding.tsx` (preferences + language + geolocation prompt)
  - `MainScreen.tsx` (video/recommendation feed)
  - `RouteBuilder.tsx` (AI route mock)
  - `EventsCalendar.tsx` (events list)
  - `MarketPlace.tsx` (masters/products mock)
  - `UserProfile.tsx` (stats/achievements/history/settings mock)
- Mobile-only layout pattern enforced by `.mobile-container { max-width: 375px; }`.
- Existing Figma-imported visual components and style tokens should be preserved.

### 1.2 Product direction inferred from UI
- Social travel app for Tatarstan discovery.
- Core interaction loop:
  1. Register/login
  2. Select preferences once
  3. Browse personalized place feed
  4. Like/dislike/comment on places
  5. Build route from recommendations
  6. Manage personal profile and own uploaded places

## 2. Target Architecture

### 2.1 Repository structure
- Keep current frontend in-place.
- Add backend folder:
  - `server/` (Node.js + TypeScript + Express)
  - `server/prisma/` (schema + migrations + seeds)
  - `server/src/modules/*` (auth, users, places, feed, comments, reactions, uploads)
- Add shared API types contract:
  - `src/lib/api/types.ts`
  - optional `shared/` package if needed later.

### 2.2 Technology stack
- Frontend: React + Vite + existing shadcn/radix components.
- Backend: Express + TypeScript + Prisma ORM.
- Database: PostgreSQL.
- Auth: JWT access token + refresh token (httpOnly cookie or secure token pair).
- Image storage: S3-compatible object storage (local MinIO for dev, S3 in prod).
- Validation: Zod on API boundaries.
- Password hashing: Argon2 (or bcrypt if environment constraints require).

## 3. Functional Scope (Must Deliver)

1. User authentication + profile.
2. One-time post-registration preferences (persisted per user).
3. Place submission by users (images, description, location).
4. Place recommendation feed for other users.
5. Like/dislike interactions.
6. Threaded comments.
7. Functional feed UI with backend data.
8. Responsive UX for mobile + tablet + desktop.
9. Complete API layer for all interactive features.
10. Database schema + migrations.
11. Deployment guide in separate file (`DEPLOYMENT.md`).

## 4. Database Design

### 4.1 Core entities (required)
- `users`
  - `id`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `language`, `created_at`, `updated_at`
  - `onboarding_completed_at` (null until preferences saved)
- `user_preferences`
  - `id`, `user_id`, `interest_key`, `created_at`
  - unique (`user_id`, `interest_key`)
- `places`
  - `id`, `author_id`, `title`, `description`, `category`, `latitude`, `longitude`, `address`, `city`, `is_published`, `created_at`, `updated_at`
- `place_images`
  - `id`, `place_id`, `storage_key`, `url`, `sort_order`, `created_at`
- `place_reactions` (like/dislike)
  - `id`, `user_id`, `place_id`, `reaction_type` (`LIKE`/`DISLIKE`), `created_at`
  - unique (`user_id`, `place_id`)
- `comments`
  - `id`, `place_id`, `author_id`, `parent_comment_id` (nullable), `body`, `created_at`, `updated_at`, `is_deleted`

### 4.2 Supporting entities
- `refresh_tokens`
  - `id`, `user_id`, `token_hash`, `expires_at`, `created_at`, `revoked_at`
- `place_views` (optional analytics/recommendation signal)
  - `id`, `user_id`, `place_id`, `viewed_at`, `watch_seconds`
- `saved_places` (optional future bookmark feature)

### 4.3 Indexes and constraints
- Indexes:
  - `places(category)`, `places(created_at)`, `places(author_id)`
  - geospatial index strategy (PostGIS preferred, fallback lat/lng B-tree pair)
  - `place_reactions(place_id)`, `comments(place_id, created_at)`
- FK cascading:
  - deleting user should not hard-delete places by default; use soft-delete strategy.

## 5. API Design (v1)

### 5.1 Auth/Profile
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`

### 5.2 Preferences (one-time onboarding)
- `POST /api/v1/users/me/preferences`
  - Allowed once when `onboarding_completed_at IS NULL`.
  - Stores selected interests + language.
  - Sets `onboarding_completed_at`.
- `GET /api/v1/users/me/preferences`

### 5.3 Places
- `POST /api/v1/places` (create place draft/published)
- `POST /api/v1/places/:id/images` (upload one or more)
- `GET /api/v1/places/:id`
- `PATCH /api/v1/places/:id`
- `DELETE /api/v1/places/:id` (soft delete)
- `GET /api/v1/users/:id/places`

### 5.4 Feed & recommendations
- `GET /api/v1/feed/recommended?cursor=...&limit=...`
- `GET /api/v1/feed/trending?cursor=...&limit=...`
- `GET /api/v1/feed/following` (optional placeholder for future)

### 5.5 Reactions
- `PUT /api/v1/places/:id/reaction` body: `{ reactionType: "LIKE" | "DISLIKE" | "NONE" }`
- `GET /api/v1/places/:id/reactions/summary`

### 5.6 Comments (threaded)
- `GET /api/v1/places/:id/comments?cursor=...`
- `POST /api/v1/places/:id/comments` body: `{ body, parentCommentId? }`
- `PATCH /api/v1/comments/:id`
- `DELETE /api/v1/comments/:id` (soft delete)

### 5.7 Route builder support
- `POST /api/v1/routes/generate`
  - Input: user location + time budget + preferences.
  - Output: ordered list of place IDs + ETA/durations.

## 6. Recommendation Algorithm (v1)

### 6.1 Signals
- Preference match (highest weight).
- Distance from user location (if available).
- Global engagement score (likes/comments/views).
- Freshness (newer content gets time-decay boost).
- Diversity penalty (avoid too many consecutive same-category items).

### 6.2 Scoring formula (first implementation)
- `score = 0.45*prefMatch + 0.20*proximity + 0.20*engagement + 0.15*freshness`
- Apply hard filters:
  - Exclude user’s own posts from top recommendation block (can appear in profile only).
  - Exclude blocked/deleted/unpublished content.

### 6.3 Iterative improvement
- Track feed impressions + interactions.
- Add A/B toggles for weight tuning via env config.

## 7. Frontend Refactor and Screen-by-Screen Integration

### 7.1 Global frontend infrastructure
- Add routing (`react-router-dom`) while preserving current visual layout.
- Add auth state and API client layer:
  - `src/lib/api/client.ts`
  - `src/lib/auth/session.ts`
  - `src/hooks/*` for feed, places, reactions, comments.
- Add loading, optimistic update, and error states.
- Keep current UI components; replace mock arrays with server data.

### 7.2 Screen requirements

#### Onboarding
- Shown only after successful registration and only if preferences not set.
- Submit selected interests/language to backend once.
- If already completed: bypass to main feed.

#### MainScreen
- Replace hardcoded `videos` with recommended places feed.
- Keep vertical immersive card experience.
- Implement real like/dislike buttons and comment entry point.
- Share button can remain basic (native Web Share fallback link copy).

#### RouteBuilder
- Replace sample route generation timeout with API-driven route generation.
- Build route using recommended/nearby places.
- Save generated route to user history (optional v1.1).

#### EventsCalendar
- Bind to backend content category/event filter (or place records tagged as events).
- Keep existing tabs and category chips interactive with API filters.

#### MarketPlace
- Make data API-driven (market participants/items endpoint or place subtype strategy).
- Preserve current card/list layout, make favorite/contact actions functional.

#### UserProfile
- Show authenticated user info and real statistics:
  - uploaded places count
  - received likes/comments
  - routes completed (if route history implemented)
- Settings tab should show persisted language/preferences.
- Implement logout action.

#### New submission UI (to satisfy user-uploaded places)
- Add “Create Place” action (button in profile and/or main feed).
- Form fields: title, description, category, geolocation (map pin or lat/lng), image upload.
- Publish flow with validation and preview.

#### Comments UI
- Add bottom-sheet/modal on place cards.
- Render thread tree (parent + replies) with pagination.
- Add reply action and optimistic posting.

## 8. Responsive Design Strategy

### 8.1 Mobile-first baseline
- Keep current mobile visual identity.

### 8.2 Desktop/tablet adaptation
- Replace strict `max-width: 375px` behavior with responsive containers:
  - Mobile: full width
  - Tablet: centered column + side panels where suitable
  - Desktop: multi-column layouts for feed/profile/market
- Maintain all existing colors/typography/components, only adjust layout wrappers.
- Validate at breakpoints: `360`, `768`, `1024`, `1280` widths.

### 8.3 Accessibility baseline
- Keyboard focus states.
- ARIA labels for icon-only actions.
- Color contrast checks for primary actions.

## 9. Security and Validation

- Input validation via Zod on every write endpoint.
- Auth middleware on protected routes.
- Rate limit login and comment endpoints.
- File upload validation (type, size, count).
- Sanitize comment/place text output.
- CORS and secure cookies/token handling per environment.

## 10. Testing Plan

### 10.1 Backend
- Unit tests for services (auth, feed scoring, comments).
- Integration tests for API endpoints (Supertest).
- Migration test on clean DB.

### 10.2 Frontend
- Component tests for onboarding, feed card interactions, comment thread.
- Smoke E2E flows (Playwright):
  1. Register -> onboarding -> feed
  2. Upload place -> appears in another user feed
  3. Like/dislike toggle
  4. Threaded comment + reply

### 10.3 Manual QA matrix
- Mobile Safari/Chrome + desktop Chrome/Firefox.
- Network failure and empty-state behavior.

## 11. Delivery Phases

### Phase 0: Project setup and contracts
- Add backend scaffold, Prisma, DB migration pipeline.
- Define API DTOs and shared frontend client.
- Seed initial demo data.

### Phase 1: Auth + onboarding persistence
- Implement register/login/logout/me.
- Implement one-time preference submission logic.
- Gate frontend routes by auth/onboarding status.

### Phase 2: Place CRUD + media upload
- Create place submission API + UI.
- Add image upload pipeline and storage abstraction.
- Implement profile “my places” section.

### Phase 3: Feed + recommendation engine
- Build recommended feed endpoint and pagination.
- Integrate main feed screen with live data.
- Add interaction counters in feed cards.

### Phase 4: Likes/dislikes + threaded comments
- Build reaction APIs with optimistic frontend updates.
- Implement comment threads and reply UI.
- Add moderation-ready soft-delete behavior.

### Phase 5: Secondary screens and responsive overhaul
- Connect RouteBuilder/Events/Market/Profile screens to backend data.
- Implement desktop/tablet responsive layouts.
- Final UX and accessibility polish.

### Phase 6: QA + deployment package
- End-to-end testing pass.
- Production env templates.
- Write full deployment instructions in separate file (`DEPLOYMENT.md`).

## 12. Definition of Done

- All previously static screens are backed by real APIs and persistent data.
- Preferences are collected once after registration and stored per user.
- Users can create places with images and location.
- New user-generated places appear in recommendation feeds for other users.
- Like/dislike and threaded comments are fully functional.
- App works across mobile and desktop layouts.
- Database migrations and seeds are reproducible.
- Deployment guide exists and is executable by another developer.

## 13. Risks and Mitigations

- Risk: Scope creep from mock-heavy UI to full product.
  - Mitigation: strict phased delivery + v1 feature cut lines.
- Risk: Image upload complexity across environments.
  - Mitigation: storage abstraction + local MinIO parity with S3.
- Risk: Recommendation quality initially basic.
  - Mitigation: configurable scoring weights + interaction logging.
- Risk: Responsive redesign might break Figma fidelity.
  - Mitigation: preserve components/styles, change only layout wrappers and spacing system.

## 14. Immediate Next Step (after approval)
- Start Phase 0 implementation:
  - scaffold backend
  - set up Prisma/PostgreSQL schema
  - add auth + onboarding API contracts
  - wire frontend app shell to real session state
