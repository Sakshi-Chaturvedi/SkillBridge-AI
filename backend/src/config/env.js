import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = ["NODE_ENV", "PORT", "MONGODB_URL"];

requiredEnvVariables.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: Missing environment variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URL,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};