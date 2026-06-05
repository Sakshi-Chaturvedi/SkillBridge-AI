import express from "express";
import {
  authLimiter,
  otpLimiter,
  verificationLimiter,
} from "../middlewares/authLimiter.js";
import validate from "../middlewares/validate.js";
import { registerSchema } from "../validations/auth.validation.js";
import {
  registerUserController,
  resendVTokenController,
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

// ! Resend Verification Token - Route
router.post("/resend-verify-token", otpLimiter, resendVTokenController);

export default router;
