import express from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import User from "../models/users.model.js";
// import "../types/express.js";

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

const authorize = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { authorization } = req.headers;

    let token = authorization;
    if (authorization && authorization.startsWith("Bearer"))
      token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    } else {
      const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      } else {
        (req as any).user = user;
        next();
      }
    }
  } catch (error: any) {
    res.status(401).json({
      message: "Unauthorized",
      error: error?.message,
    });
  }
};

export default authorize;
