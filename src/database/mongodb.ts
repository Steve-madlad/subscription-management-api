import mongoose from "mongoose";
import { NODE_ENV, DATABASE_URL } from "../config/env.js";

if (!DATABASE_URL) {
  throw new Error("Database URL is not defined in env");
}

let isConnected = false; 

const connectToDatabase = async () => {
  if (isConnected) {
    console.log("MongoDB connection already established ✅");
    return;
  }

  try {
    await mongoose.connect(DATABASE_URL);
    isConnected = true;

    console.log(`Connected to MongoDB in ${NODE_ENV} mode ✅`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected ❌");
  process.exit(0);
});

export default connectToDatabase;
