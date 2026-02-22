import { Router } from "express";
import { getCurrentUser, getUser, getUsers } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/me", getCurrentUser);
userRouter.get("/:id", getUser);
userRouter.post("/sign-out", (req, res) => res.send("sign out"));

export default userRouter;
