import express from "express";
import { authLimiter } from "../middlewares/authLimiter.js";
import validate from "../middlewares/validate.js";
import { registerSchema } from "../validations/auth.validation.js";
import { registerUserController } from "../controllers/auth.contoller.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  registerUserController,
);

export default router;
