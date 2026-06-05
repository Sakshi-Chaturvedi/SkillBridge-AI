import express from "express";
import {
  authLimiter,
  verificationLimiter,
} from "../middlewares/authLimiter.js";
import validate from "../middlewares/validate.js";
import { registerSchema } from "../validations/auth.validation.js";
import {
  registerUserController,
  verifyUserController,
} from "../controllers/auth.contoller.js";

const router = express.Router();

// ! Registration - Route
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  registerUserController,
);

// ! Verification - Route
router.get("/verify-user/:token", verificationLimiter, verifyUserController);




export default router;
