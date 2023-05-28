import express from "express";
import { Controller } from "../controller/controller";
import { authMiddle } from "../middlewares/auth";
import { body } from "express-validator";
import { upload } from "../service/fileSettings";

export const router = express.Router();

const controller = new Controller();

router.post("/registration", body("email").isEmail(), controller.register);
router.post("/login", body("email").isEmail(), controller.login);
router.post("/add-post", authMiddle, upload.single("file"), controller.addPost);
router.post("/update-post", authMiddle, controller.updatePost);
router.post("/delete-post", authMiddle, controller.deletePost);
router.get("/all-posts", authMiddle, controller.allPosts);
router.post("/logout", authMiddle, controller.loguot);
router.post("/refresh", controller.refresh);
