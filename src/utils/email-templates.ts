export const generateEmailTemplate = ({
  name,
  subscriptionName,
  daysLeft,
  subscriptionType,
  subscriptionPrice,
}: {
  name: string;
  subscriptionName: string;
  daysLeft: number;
  subscriptionType: "daily" | "weekly" | "monthly" | "yearly";
  subscriptionPrice: number;
}) => {
  const reminders = [10, 7, 5, 2, 1, 0];

  console.log("left days", daysLeft);

  if (!reminders.includes(daysLeft)) {
    throw new Error(
      `Invalid daysLeft value: ${daysLeft}. Must be one of: ${reminders.join(
        ", "
      )}`
    );
  }

  let subject = "";

  if (daysLeft === 0) {
    subject = `⚠️ Your ${subscriptionName} subscription will expire in 24 hours. Don't forget to renew!`;
  } else if (daysLeft === 1) {
    subject = `⚠️ Your ${subscriptionName} subscription ends tomorrow – Renew now`;
  } else if (daysLeft <= 3) {
    subject = `⏳ Only ${daysLeft} days left to renew your ${subscriptionName} subscription`;
  } else {
    subject = `Reminder: ${subscriptionName} subscription ends in ${daysLeft} days`;
  }

  const body = `
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
      }

      .email-container {
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
      }

      .header {
        background-color: #2c3e50;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }

      .content {
        padding: 30px 20px;
        color: #333;
      }

      .content p {
        line-height: 1.6;
        margin-bottom: 15px;
      }

      .highlight {
        font-weight: bold;
        color: #2c3e50;
      }

      .cta-button {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 20px;
        background-color: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
      }

      .footer {
        background-color: #2c3e50;
        color: #ffffff;
        text-align: center;
        padding: 15px;
        font-size: 14px;
      }
    </style>

    <div class="email-container">
      <div class="header">
        <h2>Upcoming Expiration Notice</h2>
      </div>
      <div class="content">
        <p>Hi ${name},</p>

        <p>
          We wanted to remind you that your <span class="highlight">${subscriptionType}</span> subscription to <span class="highlight">${subscriptionName}</span> will expire in <span class="highlight">${
    daysLeft == 0 ? "24 hours" : daysLeft
  } day${daysLeft !== 1 ? "s" : ""}</span>.
        </p>

        <p>
          The renewal cost is <span class="highlight">$${subscriptionPrice.toFixed(
            2
          )}</span>.
        </p>

        <p>
          To continue enjoying uninterrupted service, please make sure to renew your subscription before it expires.
        </p>

        <a href="#" class="cta-button">Renew Now</a>

        <p>If you have any questions or need assistance, feel free to reply to this email.</p>

        <p>Best regards,<br/>The Teffsauce Team</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Teffsauce, All rights reserved.
      </div>
    </div>
  `;

  return { subject, body };
};
