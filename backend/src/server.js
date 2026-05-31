import app from "./app.js";
import connectToDB from "./config/db.js";
import { env } from "./config/env.js";

let server;

const startServer = async () => {
  try {
    await connectToDB();

    server = app.listen(env.port, () => {
      console.log(
        `SkillBridge AI backend running in ${env.nodeEnv} mode on port ${env.port}`
      );
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully.");

  if (server) {
    server.close(() => {
      console.log("Process terminated.");
      process.exit(0);
    });
  }
});