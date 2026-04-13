// Backend/src/lib/email.service.ts
// Uses Brevo REST API (HTTPS port 443) instead of SMTP (port 587 — blocked on Render free tier)
import axios from 'axios';

const API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = '22Logistics';

async function sendEmail(to: string, subject: string, htmlContent: string) {
  // Fire-and-forget — response is never blocked
  axios
    .post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15000,
      }
    )
    .then(() => console.log(`✅ Email sent to ${to}`))
    .catch((err) =>
      console.error(`❌ Email failed for ${to}:`, err.response?.data ?? err.message)
    );
}

export const sendVerificationEmail = async (email: string, code: string) => {
  console.log(`\n📧 VERIFICATION CODE for ${email}: ${code}\n`);
  sendEmail(
    email,
    'Your 22Logistics Verification Code',
    `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
      <h2 style="color:#0B1B2B">Verify your email</h2>
      <p style="color:#374151">Use the code below to verify your account. It expires in <strong>15 minutes</strong>.</p>
      <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#E4C77B;text-align:center;padding:24px 0">
        ${code}
      </div>
      <p style="color:#9CA3AF;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    </div>
    `
  );
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
  console.log(`\n📧 RESET CODE for ${email}: ${code}\n`);
  sendEmail(
    email,
    'Reset your 22Logistics password',
    `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
      <h2 style="color:#0B1B2B">Password Reset</h2>
      <p style="color:#374151">Use the code below to reset your password. It expires in <strong>15 minutes</strong>.</p>
      <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#E4C77B;text-align:center;padding:24px 0">
        ${code}
      </div>
      <p style="color:#9CA3AF;font-size:13px">If you didn't request this, ignore this email.</p>
    </div>
    `
  );
};
