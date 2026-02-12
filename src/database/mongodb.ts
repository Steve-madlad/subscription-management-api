// import mongoose from "mongoose";
// import { NODE_ENV, DATABASE_URL } from "../config/env.js";

// if (!DATABASE_URL) {
//   throw new Error("Database URL is not defined in env");
// }

// let isConnected = false;

// // Extra logging helpers
// mongoose.connection.on("connected", () => {
//   console.log("Mongoose connection event: connected ✅");
//   console.log("DB name:", mongoose.connection.name);
//   console.log("DB host:", mongoose.connection.host);
// });

// mongoose.connection.on("error", (err) => {
//   console.error("Mongoose connection event: error ❌", err);
// });

// mongoose.connection.on("disconnected", () => {
//   console.log("Mongoose connection event: disconnected ⚠️");
// });

// const connectToDatabase = async () => {
//   if (isConnected) {
//     console.log("MongoDB connection already established ✅");
//     return;
//   }

//   try {
//     await mongoose.connect(DATABASE_URL);
//     isConnected = true;

//     console.log(`Connected to MongoDB in ${NODE_ENV} mode ✅`);
//     console.log("Mongoose readyState:", mongoose.connection.readyState); // 1 = connected
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//     // On Vercel, you may want to remove process.exit(1) to see the full error
//     // process.exit(1);
//   }
// };

// process.on("SIGINT", async () => {
//   await mongoose.disconnect();
//   console.log("MongoDB disconnected ❌");
//   process.exit(0);
// });

// export default connectToDatabase;

import mongoose from "mongoose";
import { DATABASE_URL, NODE_ENV } from "../config/env.js";

if (!DATABASE_URL) {
  throw new Error("Database URL is not defined");
}

type MongooseCache = {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = {
    conn: null,
    promise: null,
  };
}

/**
 * Attach connection event listeners once
 */
function attachConnectionListeners() {
  if ((mongoose.connection as any)._hasListeners) return;

  mongoose.connection.on("connected", () => {
    console.log("🟢 MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("🔴 MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("🟡 MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔵 MongoDB reconnected");
  });

  // Mark listeners as attached to avoid duplicates
  (mongoose.connection as any)._hasListeners = true;
}

export async function connectToDatabase(): Promise<mongoose.Mongoose> {
  if (cached!.conn) {
    console.log("♻️  Reusing existing MongoDB connection");
    return cached!.conn;
  }

  if (!cached!.promise) {
    console.log("🚀 Creating new MongoDB connection...");

    attachConnectionListeners();

    cached!.promise = mongoose.connect(DATABASE_URL, {
      bufferCommands: false, // important for serverless
    });
  }

  try {
    cached!.conn = await cached!.promise;
    console.log(
      `✅ MongoDB connected successfully (${NODE_ENV}) | readyState: ${mongoose.connection.readyState}`
    );
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    cached!.promise = null;
    throw error;
  }

  return cached!.conn;
}