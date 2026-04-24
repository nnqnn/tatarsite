import path from "node:path";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/routes.js";
import { usersRouter } from "./modules/users/routes.js";
import { placesRouter } from "./modules/places/routes.js";
import { feedRouter } from "./modules/feed/routes.js";
import { reactionsRouter } from "./modules/reactions/routes.js";
import { commentsRouter } from "./modules/comments/routes.js";
import { routeGeneratorRouter } from "./modules/routes/routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "tatarsite-server",
    time: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/places", placesRouter);
app.use("/api/v1/feed", feedRouter);
app.use("/api/v1/places", reactionsRouter);
app.use("/api/v1", commentsRouter);
app.use("/api/v1/routes", routeGeneratorRouter);

app.use(notFoundHandler);
app.use(errorHandler);
