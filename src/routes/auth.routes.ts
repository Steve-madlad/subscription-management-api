import { Router } from "express";
import { signIn, signUp } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", (req, res) => res.send({ message: "sign out" }));

export default authRouter;
