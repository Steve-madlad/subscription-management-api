import { Router } from "express";
import {
  cancelSubscription,
  createSubscription,
  getUserSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controllers.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", getUserSubscriptions);
subscriptionRouter.get("/:id", (req, res) =>
  res.send("Get subscription details"),
);
subscriptionRouter.post("/", createSubscription);
subscriptionRouter.put("/:id", updateSubscription);
subscriptionRouter.delete("/:id", (req, res) =>
  res.send("Delete subscription"),
);
subscriptionRouter.get("/user/:id", (req, res) =>
  res.send("Get all user subscriptions"),
);
subscriptionRouter.put("/:id/cancel", cancelSubscription);
subscriptionRouter.get("/upcomming-renewals", (req, res) =>
  res.send("Get upcomming renewals"),
);

export default subscriptionRouter;
