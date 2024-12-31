import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const router = Router();

router.get("/signup", authController.signup);

router.get("/signin", authController.signin);

router.get("/signout", authController.signout);

export default router;