import express from "express";
import {
  authLimiter,
  loginLimiter,
  otpLimiter,
  verificationLimiter,
} from "../middlewares/authLimiter.js";
import validate from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import {
  loginController,
  logoutAllDevicesController,
  logoutController,
  registerUserController,
  resendVTokenController,
  verifyUserController,
} from "../controllers/auth.contoller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

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

// ! Login - Route
router.post("/login", loginLimiter, validate(loginSchema), loginController);

// ! Single Device Logout - Route
router.get("/logout", authMiddleware, logoutController);

// ! Multi - Device Logout - Route
router.get("/logout-all", authMiddleware, logoutAllDevicesController);

export default router;
