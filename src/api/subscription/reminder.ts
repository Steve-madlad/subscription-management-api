// api/subscription/reminder.js (or .ts if your build supports it)
// This file acts as the Vercel serverless function entry point
import { Router } from "express";
import { sendReminders } from "../../controllers/workflow.controllers.js";
import express from "express";
// Assuming your build outputs to 'dist'

export default async function handler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<Router> {
  // The nextjs handler expects a standard Request object, not express (req, res).
  // The Vercel adapter should automatically convert to the web standard Request/Response.

  // This is the cleanest way: export the handler directly.
  return sendReminders(req, res, next) as Router;
}
// Note: Vercel documentation suggests simply exporting the handler function.
// For Vercel, you might not even need the wrapper function above if you
// configure your entry point correctly.

// The simplest Vercel entry point is often:
// export default sendReminders;\
