import catchAsyncError from "../middlewares/catchAsyncError.js";
import { registerUserService } from "../services/auth.service.js";
import { sendResponse } from "../utils/sendResponse.js";

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
