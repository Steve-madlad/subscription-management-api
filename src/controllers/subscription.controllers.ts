import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import * as z from "zod";
import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { AppError } from "../types/types.js";
import handleValidationError from "../utils/validation-guard.js";

const updateSubscriptionSchema = z.object({
  name: z.string("Name must be a string").optional(),
  price: z
    .number("Price must be a number")
    .min(1, "Price must be greater than 0"),
  currency: z.enum(["USD", "ETB"], "Invalid currency option").optional(),
  frequency: z.enum(
    ["daily", "weekly", "monthly", "yearly"],
    "Invalid frequency option",
  ),
  category: z.enum(
    [
      "sports",
      "news",
      "politics",
      "entertainment",
      "lifestyle",
      "technology",
      "finance",
      "other",
    ],
    "Invalid category option",
  ),
});

const createSubscriptionSchema = z
  .object({
    name: z.string("Name must be a string"),
    price: z
      .number("Price must be a number")
      .min(1, "Price must be greater than 0"),
    currency: z.enum(["USD", "ETB"], "Invalid currency option").optional(),
    frequency: z.enum(
      ["daily", "weekly", "monthly", "yearly"],
      "Invalid frequency option",
    ),
    category: z.enum(
      [
        "sports",
        "news",
        "politics",
        "entertainment",
        "lifestyle",
        "technology",
        "finance",
        "other",
      ],
      "Invalid category option",
    ),
    paymentMethod: z.enum(["card", "debit"]),
  })
  .strip();

const cancelSubscriptionSchema = z.object({
  status: z.enum(["active", "cancelled", "expired"], "Invalid status option"),
});

export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body) {
      const error = new AppError("Subscription details are required", 400);
      throw error;
    }

    const parsed = createSubscriptionSchema.safeParse(req.body);
    handleValidationError<z.infer<typeof createSubscriptionSchema>>(
      parsed,
      res,
    );

    const subscription = await Subscription.create({
      ...parsed.data,
      user: (req as any).user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription._id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res.status(201).json({
      success: true,
      message: "subscription created successfully",
      data: subscription,
      workflowRunId: workflowRunId,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userSubscription = await Subscription.find({
      user: (req as any).user._id,
    });

    if (!userSubscription) {
      const error = new AppError("Subscription not found", 404);
      throw error;
    }

    res.status(200).json({
      success: true,
      data: userSubscription,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body) {
      const error = new AppError("Subscription details are required", 400);
      throw error;
    }

    const { id } = req.params;
    const { name, price, currency, frequency, category } = req.body;

    if (!id) {
      const error = new AppError("Subscription id is required", 400);
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription ID" });
    }

    const parsed = updateSubscriptionSchema.safeParse(req.body);
    handleValidationError<z.infer<typeof updateSubscriptionSchema>>(
      parsed,
      res,
    );

    const updatedData = {
      name,
      price,
      currency,
      frequency,
      category,
    };

    const updatedSubscription = await Subscription.findOneAndUpdate(
      {
        _id: id,
        user: (req as any).user,
        status: { $ne: "cancelled" },
      },
      { $set: updatedData },
      { new: true, runValidators: true },
    );

    if (!updatedSubscription) {
      const error = new AppError(
        "Subscription not found or is ineligible for update",
        400,
      );
      throw error;
    }

    res.status(200).json({
      success: true,
      data: updatedSubscription,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      const error = new AppError("Subscription id is required", 400);
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription ID" });
    }

    const updatedSubscription = await Subscription.findOneAndUpdate(
      {
        _id: id,
        user: (req as any).user,
        status: { $ne: "cancelled" },
      },
      {
        $set: {
          status: "cancelled",
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedSubscription) {
      const error = new AppError(
        "Subscription not found or is ineligible for update",
        400,
      );
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    next(error);
  }
};
