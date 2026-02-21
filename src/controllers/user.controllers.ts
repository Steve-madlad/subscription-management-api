import express from "express";
import User from "../models/users.model.js";
import { AppError } from "../types/types.js";

export const getUsers = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const users = await User.find().select("-password");

    if (!users) {
      const error = new AppError("No users found", 404);
      throw error;
    }

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      const error = new AppError("User not found", 404);
      throw error;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
