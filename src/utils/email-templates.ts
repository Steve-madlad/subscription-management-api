import dayjs from "dayjs";

export const generateEmailTemplate = ({
  name,
  subscriptionName,
  renewalDt,
  subscriptionType,
  subscriptionPrice,
}: {
  name: string;
  subscriptionName: string;
  renewalDt: Date;
  subscriptionType: "daily" | "weekly" | "monthly" | "yearly";
  subscriptionPrice: number;
}) => {
  const dayReminders = [10, 7, 5, 2, 1];
  const hourReminders = [4, 3];

  const now = dayjs();
  const renewalDate = dayjs(renewalDt);

  const daysLeft = renewalDate.diff(now, "day");
  const hoursLeft = renewalDate.diff(now, "hour");

  const isDayReminder = dayReminders.includes(daysLeft);
  const isHourReminder = hourReminders.includes(hoursLeft);

  if (!isDayReminder && !isHourReminder) {
    throw new Error(
      `Invalid reminder time. Must be one of: ${[...dayReminders, ...hourReminders].join(", ")}`,
    );
  }

  // Logic for dynamic time strings
  const timeRemainingStr = isHourReminder 
    ? `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}` 
    : `${daysLeft} day${daysLeft > 1 ? "s" : ""}`;

  // Subject line logic
  let subject = "";
  if (isHourReminder) {
    subject = `⚡ Final Call: ${subscriptionName} expires in ${hoursLeft} hours!`;
  } else if (daysLeft === 1) {
    subject = `⏳ Tomorrow: Your ${subscriptionName} subscription expires`;
  } else {
    subject = `Reminder: ${daysLeft} days until your ${subscriptionName} renewal`;
  }

  const body = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f4f7f9;
          margin: 0;
          padding: 40px 20px;
        }
        .email-container {
          max-width: 550px;
          margin: auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border: 1px solid #eef2f5;
        }
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          padding: 10px 20px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 40px 35px;
          color: #1e293b;
          line-height: 1.6;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .sub-details {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          border: 1px border #e2e8f0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .detail-row:last-child { margin-bottom: 0; }
        .label { color: #64748b; }
        .value { font-weight: 600; color: #0f172a; }

        .cta-wrapper {
          text-align: center;
          margin-top: 30px;
        }
        .cta-button {
          display: inline-block;
          padding: 14px 32px;
          background-color: #2563eb;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        .footer {
          text-align: center;
          padding: 25px;
          font-size: 13px;
          color: #94a3b8;
          background-color: #ffffff;
        }
        .urgency-badge {
          display: inline-block;
          padding: 4px 12px;
          background-color: #fee2e2;
          color: #dc2626;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 15px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Renewal Reminder</h1>
        </div>
        <div class="content">
          <div class="urgency-badge">${timeRemainingStr} remaining</div>
          <p class="greeting">Hi ${name},</p>
          <p>Time flies! Your subscription to <strong>${subscriptionName}</strong> is coming to an end soon. Don't lose access to your premium features.</p>
          
          <div class="sub-details">
            <div class="detail-row">
              <span class="label">Plan</span>
              <span class="value">${subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Renewal Price</span>
              <span class="value">$${subscriptionPrice.toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Expires In</span>
              <span class="value">${timeRemainingStr}</span>
            </div>
          </div>

          <p>Click the button below to renew securely and keep things running smoothly.</p>

          <div class="cta-wrapper">
            <a href="#" class="cta-button">Renew Subscription</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Teffsauce. All rights reserved.<br/>
          If you have any questions, just reply to this email.
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, body };
};