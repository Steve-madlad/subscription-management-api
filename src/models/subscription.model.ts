import mongoose, { InferSchemaType } from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "ETB"],
      default: "ETB",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: [true, "Subscription type (frequency) is required"],
    },
    category: {
      type: String,
      enum: [
        "sports",
        "news",
        "politics",
        "entertainment",
        "lifestyle",
        "technology",
        "finance",
        "other",
      ],
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "debit"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value: Date) => value <= new Date(),
        message: "Start Date must be in the past",
      },
      default: new Date(),
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (this: { startDate: Date }, value: Date): boolean {
          return value > this.startDate;
        },
        message: "Renewal Date must be after start date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    if (this.frequency) {
      this.renewalDate = new Date(this.startDate);
      this.renewalDate.setDate(
        this.renewalDate.getDate() + renewalPeriods[this.frequency],
      );
    }
  } else if (this.renewalDate < new Date()) {
    this.status = "expired";
  }

  next();
});

type SubscriptionType = InferSchemaType<typeof subscriptionSchema>;
export type SubscriptionDocument = mongoose.Document & SubscriptionType;

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
