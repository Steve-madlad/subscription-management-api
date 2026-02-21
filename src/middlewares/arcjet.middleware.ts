import aj from "../config/arcjet.js";
import express from "express";

const arcjetMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const decision = await aj.protect(req, { requested: 2 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          message: "Too many requests",
        });
      }

      if (decision.reason.isBot()) {
        return res.status(403).json({
          message: "Unallowed bot detected",
        });
      }
    }

    next();
  } catch (error: any) {
    console.log(`Arcjet error`);
    next(error);
  }
};

export default arcjetMiddleware;
