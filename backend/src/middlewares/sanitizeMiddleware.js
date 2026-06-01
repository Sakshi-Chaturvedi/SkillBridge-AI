const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  for (const key in obj) {
    if (key.includes("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }

    if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  }

  return obj;
};

export const sanitizeRequest = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);

  // req.query ko reassign nahi karna, sirf andar ke keys sanitize karne hain
  if (req.query) sanitizeObject(req.query);

  next();
};