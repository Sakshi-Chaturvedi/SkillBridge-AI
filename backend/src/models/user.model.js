import mongoose from "mongoose";
import { USER_ROLES } from "../constants/userRoles.js";
import { ACCOUNT_STATUS } from "../constants/userStatus.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AUTH_PROVIDER } from "../constants/authProvider.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User Name is Required."],
      trim: true,
      minlength: [2, "UserName must have atleast 2 characters."],
      maxlength: [50, "UserName can't exceed 50 character limit. "],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
    },
    avatar: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpire: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    authProvider: {
      type: String,
      enum: Object.values(AUTH_PROVIDER),
      default: AUTH_PROVIDER.LOCAL,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// ! Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// ! Compare Password
userSchema.methods.comparePass = async function (enteredpassword) {
  return await bcrypt.compare(enteredpassword, this.password);
};

// ! Reset password token
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(30).toString("hex");

  // ? hashed token DB me save karo
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // ? 10 minutes expiry
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // raw token return karo, ye URL/Postman me use hoga
  return resetToken;
};

// ! Generate AccessToken
userSchema.methods.accessToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "15m",
  });
};

// ! Generate Refresh Token
userSchema.methods.refreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_KEY, {
    expiresIn: "7d",
  });
};

export default mongoose.model("User", userSchema);
