import transporter, { accountInfo } from "../config/nodemailer.js";
import { SubscriptionWithPartialUser } from "../controllers/workflow.controllers.js";
import { generateEmailTemplate } from "./email-templates.js";

export const sendReminderEmail = async ({
  to,
  subscription,
}: {
  to: string;
  subscription: SubscriptionWithPartialUser;
}) => {
  if (!to) throw new Error("Missing required parametres for email");

  const mailInfo = {
    name: subscription.user.name,
    subscriptionName: subscription.name,
    subscriptionType: subscription.frequency,
    subscriptionPrice: subscription.price,
    renewalDt: subscription.renewalDate as Date,
  };

  const template = generateEmailTemplate(mailInfo);

  const mailOptions = {
    from: accountInfo,
    to,
    subject: template.subject,
    html: template.body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error, "Error sending email");
    console.log("Email Sent" + info.response);
  });
};

export default sendReminderEmail;
