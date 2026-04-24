import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, "Маршрут не найден"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    const field = firstIssue?.path?.join(".") || "payload";
    const message = firstIssue?.message || "Некорректные входные данные";

    res.status(400).json({
      message: `${field}: ${message}`,
      issues: error.issues,
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    message: "Внутренняя ошибка сервера",
  });
}
