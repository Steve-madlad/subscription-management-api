import type { WorkflowContext } from "@upstash/workflow";
import { createRequire } from "module";
const requiree = createRequire(import.meta.url);
const { serve } = requiree("@upstash/workflow/express");

import Subscription, {
  SubscriptionDocument,
} from "../models/subscription.model.js";
import dayjs, { type Dayjs } from "dayjs";

const reminders = [10, 7, 5, 2, 1];

export const sendReminders = serve(
  async (context: WorkflowContext<unknown>) => {
    const { subscriptionId } = context.requestPayload as Record<string, string>;

    const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== "active") return;

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
      console.log(
        `RenewalDate has expired for user ${subscription.user} with subscription id ${subscriptionId}. Exiting Workflow...`
      );
      return;
    }

    for (const daysBefore of reminders) {
      const reminderDate = renewalDate.subtract(daysBefore, "day");

      if (reminderDate.isAfter(dayjs())) {
        await sleepUntilReminder(
          context,
          `reminder ${daysBefore} days before`,
          reminderDate
        );
      }

      await triggerReminder(context, `reminder ${daysBefore} days before`);
    }
  }
);

const fetchSubscription = async (
  context: WorkflowContext,
  subscriptionId: string
): Promise<SubscriptionDocument | null> => {
  return await context.run("get subscription", async () => {
    return await Subscription.findById(subscriptionId).populate(
      "user",
      "name email"
    );
  });
};

const sleepUntilReminder = async (
  context: WorkflowContext,
  label: string,
  date: Dayjs
) => {
  console.log(`Sleeping until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context: WorkflowContext, label: string) => {
  return await context.run(label, () => {
    console.log(`Triggering ${label} subscription end`);
  });
};
