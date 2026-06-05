import catchAsyncError from "../middlewares/catchAsyncError.js";
import {
  registerUserService,
  resendVTokenService,
  userVerificationService,
} from "../services/auth.service.js";
import { sendResponse } from "../utils/sendResponse.js";

// ! User Registration Controller  ----------------->>>>>>>>>>>>>>>>>..........................
export const registerUserController = catchAsyncError(
  async (req, res, next) => {
    const user = await registerUserService(req.body);

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: `Verification link sent to ${user.email} successfully.`,
      data: user,
    });
  },
);

// ! User Verification Controller  ----------------->>>>>>>>>>>>>>>>>..........................
export const verifyUserController = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const response = await userVerificationService(token);

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: "User Verified Successfully.",
    data: response,
  });
});

// ! Resend Verification Token Controller --------------->>>>>>>>>>>>>>>>>>>>.....................
export const resendVTokenController = catchAsyncError(
  async (req, res, next) => {
    const { email } = req.body;

    const response = await resendVTokenService(email);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: `Verification link resent to ${response.email} successfully.`,
      data: response,
    });
  },
);
