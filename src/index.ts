import cookieParser from "cookie-parser";
import express from "express";
import { PORT, SERVER_URL } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import authorize from "./middlewares/auth.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import userRouter from "./routes/user.routes.js";
import workflowRouter from "./routes/workfolw.routes.js";
import User from "./models/users.model.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the subscription management API! Run along now.");
});

app.get("/testget", async (req, res) => {
  res.send("get works")
})
app.get("/test", async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log({error})
    res.status(500).json({
      success: true,
      data: error,
    });
  }
})

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use(authorize);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`Server is running on ${SERVER_URL} with port ${PORT}`);

  await connectToDatabase();
});
