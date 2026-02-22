import { Response } from "express";
import { ZodSafeParseResult } from "zod";

export default function handleValidationError<T>(
  parsed: ZodSafeParseResult<T>,
  res: Response,
): asserts parsed is { success: true; data: T } {
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

    res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errors,
    });
  }
}