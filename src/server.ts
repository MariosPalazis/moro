import mongoose from "mongoose";
import app from "./app";
import dotenv from "dotenv";
dotenv.config();



const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
};

startServer();
