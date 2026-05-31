import "dotenv/config";
import app from "./app.js";
import connectToDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToDB();

    app.listen(PORT, () => {
      console.log("Server is running on port : ", PORT);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
