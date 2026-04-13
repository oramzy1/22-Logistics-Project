import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
  // ✅ Explicit timeouts — fail fast instead of hanging for 60s
  connectionTimeout: 10000,   // 10s to establish TCP connection
  greetingTimeout: 10000,     // 10s for SMTP greeting
  socketTimeout: 15000,       // 15s for each socket operation
});

export const sendVerificationEmail = async (email: string, code: string) => {
  console.log(`\n📧 VERIFICATION CODE for ${email}: ${code}\n`);
  // Fire-and-forget — do NOT await so the HTTP response is not blocked
  transporter
    .sendMail({
      from: `"22Logistics" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: 'Your 22Logistics Verification Code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
          <h2 style="color:#0B1B2B">Verify your email</h2>
          <p style="color:#374151">Use the code below to verify your account. It expires in <strong>15 minutes</strong>.</p>
          <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#E4C77B;text-align:center;padding:24px 0">
            ${code}
          </div>
          <p style="color:#9CA3AF;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })
    .then(() => console.log(`✅ Verification email sent to ${email}`))
    .catch((err) => console.error(`❌ Email send failed for ${email}:`, err.message));
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
  console.log(`\n📧 RESET CODE for ${email}: ${code}\n`);
  transporter
    .sendMail({
      from: `"22Logistics" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: 'Reset your 22Logistics password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
          <h2 style="color:#0B1B2B">Password Reset</h2>
          <p style="color:#374151">Use the code below to reset your password. It expires in <strong>15 minutes</strong>.</p>
          <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#E4C77B;text-align:center;padding:24px 0">
            ${code}
          </div>
          <p style="color:#9CA3AF;font-size:13px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    })
    .then(() => console.log(`✅ Password reset email sent to ${email}`))
    .catch((err) => console.error(`❌ Reset email failed for ${email}:`, err.message));
};

// Add to `.env`:
// ```
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your@email.com
// SMTP_PASS=your_app_password