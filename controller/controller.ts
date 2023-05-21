import { Request, Response } from "express";
import { Service } from "../service/service";
import { ApiError } from "../exeptions/api-error";
import { validationResult } from "express-validator";

export class Controller {
  async register(req: Request, res: Response, next: Function) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ApiError(404, "Не верный ввод данных"));
      }
      const { name, email, password } = req.body;
      const reg = await new Service().register(name, email, password);
      res.cookie("refreshToken", reg.token.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      res.send(reg);
    } catch (e) {
      next(e);
    }
  }

  async login(req: Request, res: Response, next: Function) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ApiError(404, "Не верный ввод данных"));
      }
      const { email, password } = req.body;
      const login = await new Service().login(email, password);
      res.cookie("refreshToken", login.token.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      res.send(login);
    } catch (e) {
      next(e);
    }
  }

  async loguot(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies;
      const token = await new Service().logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.send(token);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.body;
      const userData = await new Service().refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.send(userData);
    } catch (e) {
      next(e);
    }
  }

  async addPost(req: Request, res: Response, next: Function) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ApiError(404, "Не верный ввод данных"));
      }
      const { text, userId } = req.body;
      const post = await new Service().addPost(text, userId);
      res.send(post);
    } catch (e) {
      next(e);
    }
  }

  async updatePost(req: Request, res: Response, next: Function) {
    try {
      const { text, id } = req.body;
      const post = await new Service().updatePost(text, id);
      res.send(post);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  async deletePost(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.body;
      const post = await new Service().deletePost(id);
      res.send(post);
    } catch (e) {
      next(e);
    }
  }

  async allPosts(req: Request, res: Response, next: Function) {
    try {
      const { take, page } = req.query;
      if (!Number(take) || !Number(page) || !take || !page) {
        throw new ApiError(404, "Не верный ввод данных");
      }
      const post = await new Service().allPosts(+take, +page);
      res.send(post);
    } catch (e) {
      next(e);
    }
  }
}
