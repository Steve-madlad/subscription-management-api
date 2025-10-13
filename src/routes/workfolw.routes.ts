import { Router } from "express";
// import { sendReminders } from "../controllers/workflow.controllers.js";
import handler from "../api/subscription/reminder.js";

const workflowRouter = Router();
workflowRouter.post("/subscription/reminder", handler);

export default workflowRouter;
