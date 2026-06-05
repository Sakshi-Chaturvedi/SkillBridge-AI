import crypto from "crypto";
import userModel from "../models/user.model.js";
import { ErrorHandler } from "../middlewares/error.middleware.js";
import { sendEmail } from "../utils/sendVerificationEmail.js";

// ! User Registration Service ----------------->>>>>>>>>>>>>>>>>>>>.......................
export const registerUserService = async (data) => {
  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();
  const password = data.password;

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    throw new ErrorHandler("Email already exists", 400);
  }

  let user;

  try {
    // ? 1. Create user
    user = await userModel.create({
      name,
      email,
      password,
    });

    // ? 2. Generate raw verification token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // ? 3. Hash token before saving in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // ? 4. Save hashed token + expiry
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // ? 5. Create frontend verification URL
    const frontendURL =
      process.env.FRONTEND_URL && process.env.FRONTEND_URL !== "undefined"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173";

    const verificationUrl = `${frontendURL}/verify-email/${rawToken}`;

    // ? 6. Send verification email
    await sendEmail({
      to: user.email,
      subject: "Verify your SkillBridge AI account",
      html: `
        <h2>Welcome to SkillBridge AI</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 15 minutes.</p>
      `,
      text: `Verify your email: ${verificationUrl}`,
    });

    // ? 7. Return safe user only
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isProfileCompleted: user.isProfileCompleted,
    };
  } catch (error) {
    // Duplicate email backup
    if (error.code === 11000) {
      throw new ErrorHandler("Email already exists", 400);
    }

    // ? If email sending or token save fails, delete created user
    if (user?._id) {
      await userModel.findByIdAndDelete(user._id);
    }

    throw new ErrorHandler(
      error.message || "Registration failed. Please try again.",
      500,
    );
  }
};

// ! Verify User Service ------------------->>>>>>>>>>>>>>>>>>>>>>>>>>..............................
export const userVerificationService = async (token) => {
  if (!token) {
    throw new ErrorHandler("Verification token is required.", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userModel
    .findOne({
      emailVerificationToken: hashedToken,
      isEmailVerified: false,
      emailVerificationExpire: { $gt: Date.now() },
    })
    .select("+emailVerificationToken +emailVerificationExpire");

  if (!user) {
    throw new ErrorHandler("Invalid or expired verification token.", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save({ validateBeforeSave: false });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    isProfileCompleted: user.isProfileCompleted,
  };
};

// ! Resend Verification Token Service ---------------->>>>>>>>>>>>>>>>>>>>........................
export const resendVTokenService = async (email) => {
  if (!email) {
    throw new ErrorHandler("Email is required.", 400);
  }

  email = email.toLowerCase().trim();

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new ErrorHandler("User not found.", 404);
  }

  if (user.isEmailVerified) {
    throw new ErrorHandler("User is already verified.", 400);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpire = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const frontendURL =
    process.env.FRONTEND_URL && process.env.FRONTEND_URL !== "undefined"
      ? process.env.FRONTEND_URL
      : "http://localhost:5173";

  const verificationUrl = `${frontendURL}/verify-email/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your SkillBridge AI account",
      html: `
        <h2>Welcome to SkillBridge AI</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 15 minutes.</p>
      `,
      text: `Verify your email: ${verificationUrl}`,
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isProfileCompleted: user.isProfileCompleted,
    };
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ErrorHandler(
      "Verification email could not be sent. Please try again.",
      500,
    );
  }
};
