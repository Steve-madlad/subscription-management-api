import type { WorkflowContext } from "@upstash/workflow";
import { serve } from "@upstash/workflow/express";

import dayjs, { type Dayjs } from "dayjs";
import Subscription, {
  SubscriptionDocument,
} from "../models/subscription.model.js";
import sendReminderEmail from "../utils/send-reminder-email.js";

const reminders: Record<string, Array<number>> = {
  monthly: [10, 7, 5, 2, 1],
  weekly: [2, 1],
  daily: [4]
};

export const sendReminders = serve(
  async (context: WorkflowContext<unknown>) => {
    const { subscriptionId } = context.requestPayload as Record<string, string>;

    const subscription = await fetchSubscription(context, subscriptionId);
    console.log("the subscription", subscription)

    if (!subscription || subscription.status !== "active") return;

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
      console.log(
        `RenewalDate has expired for user ${subscription.user} with subscription id ${subscriptionId}. Exiting Workflow...`
      );
      return;
    }
    // console.log("length:", reminders[subscription.frequency].length)
    for (const timeBefore of reminders[subscription.frequency]) {
      console.log({timeBefore})
      const isDaily = subscription.frequency === "daily"
      let reminderDate 
      if (isDaily)
        reminderDate = renewalDate.subtract(timeBefore, "hour")
      else reminderDate = renewalDate.subtract(timeBefore, "day");
      const now = dayjs();
      const logtext = isDaily ? `reminder ${timeBefore} hours before expiration` :          
       `reminder ${timeBefore} days before expiration`

      console.log({reminderDate})
      console.log("is after now", reminderDate.isAfter(now));
      
      if (reminderDate.isAfter(now)) {
        await sleepUntilReminder(
          context,
          logtext,
          reminderDate
        );

        await triggerReminder(
          context,
          logtext,
          subscription
        );
      }
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
