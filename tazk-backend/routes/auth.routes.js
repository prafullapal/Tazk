import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { authorize } from "../middlewares/authorization.js";

const router = Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/refresh-token", authController.refreshToken);
router.get("/signout", authorize, authController.signout);

export default router;
