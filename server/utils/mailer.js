import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender(process.env.MAILERSEND_FROM_EMAIL, process.env.MAILERSEND_FROM_NAME);
const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; 

export async function sendSignupEmail(toEmail, toName, username) {
  const recipients = [new Recipient(toEmail, toName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(`Welcome to ${process.env.MAILERSEND_FROM_NAME || 'Our App'}, ${username}!`)
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
    console.log('MailerSend Signup Response:', response);
    console.log(`Signup email successfully sent to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending signup email to ${toEmail}:`, error?.response?.data?.errors || error.message);
  }
}

/**
 * Sends a password reset email to the user.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} toName - The recipient's name.
 * @param {string} resetToken - The raw password reset token (do NOT hash this before sending).
 * @param {number} userId - The user's ID to include in the reset link.
 */
export async function sendPasswordResetEmail(toEmail, toName, resetToken, userId) {
  const recipients = [new Recipient(toEmail, toName)];


  const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}&userId=${userId}`;

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject('Password Reset Request')
    .setHtml(`
      <h1>Password Reset Request</h1>
      <p>Hello ${toName || 'User'},</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetLink}" target="_blank">Reset Your Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <br>
      <p>Link: ${resetLink}</p> 
    `)
    .setText(`Hello ${toName || 'User'},\n\nYou requested a password reset. Please go to the following link to set a new password (link expires in 1 hour):\n${resetLink}\n\nIf you did not request this, please ignore this email.`);

  try {
    console.log(`Attempting to send password reset email to ${toEmail}...`);
    const response = await mailerSend.email.send(emailParams);
    console.log('MailerSend Password Reset Response:', response);
    console.log(`Password reset email successfully sent to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending password reset email to ${toEmail}:`, error?.response?.data?.errors || error.message);
    // throw error; // Could uncomment if I want to propagate the error
  }
}

/**
 * Sends an email confirming a password change.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} toName - The recipient's name.
 */
export async function sendPasswordChangeConfirmationEmail(toEmail, toName) {
  const recipients = [new Recipient(toEmail, toName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject('Your Password Has Been Changed')
    .setHtml(`
      <h1>Password Changed Successfully</h1>
      <p>Hello ${toName || 'User'},</p>
      <p>This email confirms that the password for your account has been successfully changed.</p>
      <p>If you did not make this change, please contact support immediately.</p>
    `)
    .setText(`Hello ${toName || 'User'},\n\nThis email confirms that the password for your account has been successfully changed.\n\nIf you did not make this change, please contact support immediately.`);

  try {
    console.log(`Attempting to send password change confirmation to ${toEmail}...`);
    const response = await mailerSend.email.send(emailParams);
    console.log('MailerSend Password Change Confirmation Response:', response);
    console.log(`Password change confirmation email successfully sent to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending password change confirmation to ${toEmail}:`, error?.response?.data?.errors || error.message);
  }
}
