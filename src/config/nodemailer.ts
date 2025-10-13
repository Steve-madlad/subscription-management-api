import nodemailer from "nodemailer";
import { EMAIL_PASSWORD } from "./env.js";

export const accountInfo = "teffsauce@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: accountInfo,
    pass: EMAIL_PASSWORD,
  },
});

export default transporter