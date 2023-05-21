import { Request, Response } from "express";
import { ApiError } from "../exeptions/api-error";
import { validateAccesseToken } from "../service/generateToken";

export function authMiddle(req: Request, res: Response, next: Function) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(new ApiError(401, "Пользователь не авторизован"));
    }
    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(new ApiError(401, "Пользователь не авторизован"));
    }
    const userData = validateAccesseToken(accessToken);
    if (!userData) {
      return next(new ApiError(401, "Пользователь не авторизован"));
    }
    next();
  } catch (e) {
    return next(new ApiError(401, "Пользователь не авторизован"));
  }
}
