import type { WorkflowContext } from "@upstash/workflow";
import { createRequire } from "module";
const requiree = createRequire(import.meta.url);
const { serve } = requiree("@upstash/workflow/express");

import dayjs, { type Dayjs } from "dayjs";
import Subscription, {
  SubscriptionDocument,
} from "../models/subscription.model.js";
import sendReminderEmail from "../utils/send-reminder-email.js";

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

      await triggerReminder(
        context,
        `reminder ${daysBefore} days before`,
        subscription
      );
    }
  }
);

type PartialUser = { name: string; email: string };

export type SubscriptionWithPartialUser = Omit<SubscriptionDocument, "user"> & {
  user: PartialUser;
};

const fetchSubscription = async (
  context: WorkflowContext,
  subscriptionId: string
): Promise<SubscriptionWithPartialUser | null> => {
  return await context.run("get subscription", async () => {
    return (await Subscription.findById(subscriptionId).populate(
      "user",
      "name email"
    )) as SubscriptionWithPartialUser | null;
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

const triggerReminder = async (
  context: WorkflowContext,
  label: string,
  subscription: SubscriptionWithPartialUser
) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} subscription end`);
    await sendReminderEmail({
      to: subscription.user.email,
      subscription: subscription,
    });
  });
};
