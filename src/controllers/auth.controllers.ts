import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import User from "../models/users.model.js";
import { AppError } from "../types/types.js";
import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string("Valid name is required").min(1, "Name is required"),
  email: z.email("Valid email is required"),
  password: z
    .string("Valid password is required")
    .min(6, "Password is too short"),
});

export const signInSchema = z.object({
  email: z.email("Valid email is required"),
  password: z
    .string("Valid password is required")
    .min(6, "Password is too short"),
});

export const signUp = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.body) {
      const error = new AppError("credentials are required", 400);
      throw error;
    }

    const { name, email, password } = req.body;

    const parsed = signUpSchema.safeParse(req.body);

    if (!parsed.success) {
      const issues = parsed.error.issues;

      const errors: Record<string, string> = {};
      for (const issue of issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field]) {
          errors[field] = issue.message;
        }
      }

      const firstErrorMessage = issues[0]?.message || "Invalid input";

      return res.status(400).json({
        success: false,
        message: firstErrorMessage,
        errors,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new AppError("User already exists", 409);
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create(
      [
        {
          name,
          email,
          password: hashedPassword,
        },
      ],
      { session }
    );

    const token = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    await session.commitTransaction();
    session.endSession();

    // res.cookie("AUTH", token, {
    //   domain: "localhost",
    //   path: "/",
    // });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: newUser[0],
        token,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {    
    if (!req.body) {
      const error = new AppError("credentials are required", 400);
      throw error;
    }

    const { email, password } = req.body;

    const parsed = signInSchema.safeParse(req.body);

    if (!parsed.success) {
      const issues = parsed.error.issues;

      const errors: Record<string, string> = {};
      for (const issue of issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field]) {
          errors[field] = issue.message;
        }
      }

      const firstErrorMessage = issues[0]?.message || "Invalid input";

      return res.status(400).json({
        success: false,
        message: firstErrorMessage,
        errors,
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const error = new AppError("Invalid credentials", 401);
      throw error;
    }

    const match = await bcrypt.compare(password, existingUser.password);

    if (!match) {
      const error = new AppError("Invalid credentials", 401);
      throw error;
    }

    const token = jwt.sign({ userId: existingUser._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    // res.cookie("AUTH", token, {
    //   domain: "localhost",
    //   path: "/",
    // });

    res.status(201).json({
      success: true,
      message: "Login successful",
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
