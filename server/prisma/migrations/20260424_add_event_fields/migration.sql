ALTER TABLE "Place"
ADD COLUMN "isEvent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "eventStartAt" TIMESTAMP(3),
ADD COLUMN "eventEndAt" TIMESTAMP(3);

CREATE INDEX "Place_isEvent_eventStartAt_idx" ON "Place"("isEvent", "eventStartAt");
