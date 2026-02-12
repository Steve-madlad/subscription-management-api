import mongoose from "mongoose";
import { NODE_ENV, DATABASE_URL } from "../config/env.js";

if (!DATABASE_URL) {
  throw new Error("Database URL is not defined in env");
}

let isConnected = false;

// Extra logging helpers
mongoose.connection.on("connected", () => {
  console.log("Mongoose connection event: connected ✅");
  console.log("DB name:", mongoose.connection.name);
  console.log("DB host:", mongoose.connection.host);
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection event: error ❌", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection event: disconnected ⚠️");
});

const connectToDatabase = async () => {
  if (isConnected) {
    console.log("MongoDB connection already established ✅");
    return;
  }

  try {
    await mongoose.connect(DATABASE_URL);
    isConnected = true;

    console.log(`Connected to MongoDB in ${NODE_ENV} mode ✅`);
    console.log("Mongoose readyState:", mongoose.connection.readyState); // 1 = connected
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // On Vercel, you may want to remove process.exit(1) to see the full error
    // process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected ❌");
  process.exit(0);
});

export default connectToDatabase;