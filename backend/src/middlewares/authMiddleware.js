import { ACCOUNT_STATUS } from "../constants/userStatus.js";
import userModel from "../models/user.model.js";
import catchAsyncError from "./catchAsyncError.js";
import { ErrorHandler } from "./error.middleware.js";
import jwt from "jsonwebtoken";

export const authMiddleware = catchAsyncError(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) return next(new ErrorHandler("Please Login First.", 400));

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    return next(
      new ErrorHandler("Invalid or expired token. Please login again.", 401),
    );
  }

  const user = await userModel.findById(decoded.id);

  if (!user) return next(new ErrorHandler("User not found. Please login again.", 400));

  const AccountStatus = user.accountStatus || ACCOUNT_STATUS.ACTIVE;

  if (AccountStatus === ACCOUNT_STATUS.BLOCKED) {
    return next(
      new ErrorHandler(
        "Your account has been blocked. Please contact support.",
        403,
      ),
    );
  }

  if (AccountStatus === ACCOUNT_STATUS.DELETED) {
    return next(
      new ErrorHandler(
        "Your account has been Deleted. Please contact support.",
        403,
      ),
    );
  }

  req.user = user;

  next();
});
