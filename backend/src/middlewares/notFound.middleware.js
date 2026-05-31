import { ErrorHandler } from "./error.middleware.js";

export const notFoundMiddleware = (req, res, next) => {
  next(new ErrorHandler(`Route not found: ${req.originalUrl}`, 404));
};
