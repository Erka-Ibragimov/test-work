import { Request, Response } from "express";
import { ApiError } from "../exeptions/api-error";

export function middleError(error: unknown, req: Request, res: Response, next: Function) {
  if (error instanceof ApiError) {
    return res.status(error.status).send({ message: error.message });
  }
  return res.status(500).json({ message: "Непредвидинная ошибка" });
}
