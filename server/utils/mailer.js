import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender(process.env.MAILERSEND_FROM_EMAIL, process.env.MAILERSEND_FROM_NAME);

export async function sendSignupEmail(toEmail, toName, username) {
  const recipients = [new Recipient(toEmail, toName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(`Welcome to ${process.env.MAILERSEND_FROM_NAME}, ${username}!`)
    .setHtml(`
      <h1>Welcome aboard, ${username}!</h1>
      <p>Thank you for signing up.</p>
      <p>You can now log in to your account.</p>
      <strong>We're excited to have you!</strong>
    `)
    .setText(`Welcome aboard, ${username}! Thank you for signing up. You can now log in to your account. We're excited to have you!`);

  try {
    console.log(`Attempting to send signup email to ${toEmail}...`);
    const response = await mailerSend.email.send(emailParams);
    console.log('MailerSend Response:', response);
    console.log(`Signup email successfully sent to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending signup email to ${toEmail}:`, error?.response?.data?.errors || error.message);
  }
}
