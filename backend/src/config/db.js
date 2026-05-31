import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL;

    if (!mongoUri) {
      throw new Error("MONGODB_URL is not defined in environment variables.");
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || "skillbridge-ai",
    });

    console.log(`MongoDB connected successfully: ${conn.connection.host} ✅`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("error", (error) => {
  console.error("MongoDB runtime error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination.");
  process.exit(0);
});

export default connectToDB;
