import { Resend } from "resend";

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export function getFrom() {
  return `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`;
}
