import express from "express";
import mongoose from "mongoose";
import * as z from "zod";
import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";
import { PORT } from "../config/env.js";
import Subscription from "../models/subscription.model.js";
import { AppError } from "../types/types.js";

const updateSubscriptionSchema = z.object({
  name: z.string("Name must be a string").optional(),
  price: z
    .number("Price must be a number")
    .min(1, "Price must be greater than 0"),
  currency: z.enum(["USD", "ETB"], "Invalid currency option").optional(),
  frequency: z.enum(
    ["daily", "weekly", "monthly", "yearly"],
    "Invalid frequency option"
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
    "Invalid category option"
  ),
});

const cancelSubscriptionSchema = z.object({
  status: z.enum(["active", "cancelled", "expired"], "Invalid status option"),
});

export const createSubscription = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!req.body) {
      const error = new AppError("Subscription details are required", 400);
      throw error;
    }

    const subscription = await Subscription.create({
      ...req.body,
      user: (req as any).user._id,
    });
    
    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
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
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
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
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
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
      { new: true, runValidators: true }
    );

    if (!updatedSubscription) {
      const error = new AppError(
        "Subscription not found or is ineligible for update",
        400
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
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!req.body) {
      const error = new AppError("Subscription details are required", 400);
      throw error;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      const error = new AppError("Subscription id is required", 400);
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription ID" });
    }

    const parsed = cancelSubscriptionSchema.safeParse(req.body);

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

    const updatedSubscription = await Subscription.findOneAndUpdate(
      {
        _id: id,
        user: (req as any).user,
        status: { $ne: "cancelled" },
      },
      {
        $set: {
          status,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedSubscription) {
      const error = new AppError(
        "Subscription not found or is ineligible for update",
        400
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
