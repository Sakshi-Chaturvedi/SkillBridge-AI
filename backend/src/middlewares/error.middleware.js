class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Wrong MongoDB ObjectId
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ErrorHandler(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");

    error = new ErrorHandler(message, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue?.[field];

    const message = `${field} '${value}' already exists.`;
    error = new ErrorHandler(message, 400);
  }

  // JWT invalid
  if (err.name === "JsonWebTokenError") {
    error = new ErrorHandler("Invalid token, please login again.", 401);
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    error = new ErrorHandler("Token expired, please login again.", 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export { ErrorHandler, errorMiddleware };
