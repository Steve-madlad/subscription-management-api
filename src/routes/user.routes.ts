import { Router } from "express";
import { signUp } from "../controllers/auth.controllers.js";
import { getUser, getUsers } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.get('/', getUsers)
userRouter.get('/:id', getUser)
userRouter.post('/sign-out', (req, res) => res.send("sign out"))

export default userRouter;