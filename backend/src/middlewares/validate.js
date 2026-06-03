import { ErrorHandler } from "./error.middleware.js";

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details
        .map((detail) => detail.message.replace(/"/g, ""))
        .join(", ");

      return next(new ErrorHandler(message, 400));
    }

    req.body = value;
    next();
  };
};

export default validate;
