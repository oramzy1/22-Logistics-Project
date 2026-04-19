// // Backend/src/lib/email.service.ts
// // Uses Brevo REST API (HTTPS port 443) instead of SMTP (port 587 — blocked on Render free tier)
// import axios from 'axios';

// const API_KEY = process.env.BREVO_API_KEY;
// const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
// const SENDER_NAME = '22Logistics';

// async function sendEmail(to: string, subject: string, htmlContent: string) {
//   // Fire-and-forget — response is never blocked
//   axios
//     .post(
//       'https://api.brevo.com/v3/smtp/email',
//       {
//         sender: { name: SENDER_NAME, email: SENDER_EMAIL },
//         to: [{ email: to }],
//         subject,
//         htmlContent,
//       },
//       {
//         headers: {
//           'api-key': API_KEY,
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         timeout: 15000,
//       }
//     )
//     .then(() => console.log(`✅ Email sent to ${to}`))
//     .catch((err) =>
//       console.error(`❌ Email failed for ${to}:`, err.response?.data ?? err.message)
//     );
// }

// export const sendVerificationEmail = async (email: string, code: string) => {
//   console.log(`\n📧 VERIFICATION CODE for ${email}: ${code}\n`);
//   sendEmail(
//     email,
//     'Your 22Logistics Verification Code',
//     `
//     <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
//       <h2 style="color:#0B1B2B">Verify your email</h2>
//       <p style="color:#374151">Use the code below to verify your account. It expires in <strong>15 minutes</strong>.</p>
//       <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#E4C77B;text-align:center;padding:24px 0">
//         ${code}
//       </div>
//       <p style="color:#9CA3AF;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
//     </div>
//     `
//   );
// };

// export const sendPasswordResetEmail = async (email: string, code: string) => {
//   console.log(`\n📧 RESET CODE for ${email}: ${code}\n`);
//   sendEmail(
//     email,
//     'Reset your 22Logistics password',
//     `
//     <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
//       <h2 style="color:#0B1B2B">Password Reset</h2>
//       <p style="color:#374151">Use the code below to reset your password. It expires in <strong>15 minutes</strong>.</p>
//       <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#E4C77B;text-align:center;padding:24px 0">
//         ${code}
//       </div>
//       <p style="color:#9CA3AF;font-size:13px">If you didn't request this, ignore this email.</p>
//     </div>
//     `
//   );
// };



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


export const sendWelcomeEmail = async (email: string, name: string, role: string) => {
  const isDriver = role === 'DRIVER';
  const isBusiness = role === 'BUSINESS';
 
  const roleMsg = isDriver
    ? "Complete your profile and upload your driver's license to start receiving ride requests."
    : isBusiness
    ? 'Set up your business profile and start booking rides for your team.'
    : 'Book your first ride and experience seamless logistics.';
 
  sendEmail(
    email,
    `Welcome to 22Logistics, ${name}!`,
    `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="background:#0B1B2B;display:inline-block;padding:12px 28px;border-radius:12px">
          <span style="color:#E4C77B;font-size:22px;font-weight:800;letter-spacing:2px">22Logistics</span>
        </div>
      </div>
      <h2 style="color:#0B1B2B;margin-bottom:8px">Welcome aboard, ${name}! 🎉</h2>
      <p style="color:#374151;line-height:1.6">
        Your account has been created successfully. ${roleMsg}
      </p>
      <div style="background:#F9F6F0;border-radius:12px;padding:20px;margin:24px 0;border-left:4px solid #E4C77B">
        <p style="color:#0B1B2B;font-weight:600;margin:0 0 4px">Need help getting started?</p>
        <p style="color:#6B7280;font-size:13px;margin:0">📞 +1238095832217 &nbsp;|&nbsp; ✉️ hello@22logistics.com</p>
      </div>
      <p style="color:#9CA3AF;font-size:12px;text-align:center;margin-top:24px">
        © 22Logistics — Moving you forward.
      </p>
    </div>
    `
  );
};
 
// ── NEW: Trip Completion Email ───────────────────────────────────
export const sendTripCompletionEmail = async (
  email: string,
  name: string,
  packageType: string,
  driverName: string,
  bookingId: string,
  totalAmount: number,
  appBaseUrl: string = process.env.APP_BASE_URL ?? 'https://22logistics.com'
) => {
  // Deep link / web link that opens the rating flow
  const rateUrl = `${appBaseUrl}/rate?bookingId=${bookingId}`;
 
  sendEmail(
    email,
    'Your 22Logistics trip is complete!',
    `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="background:#0B1B2B;display:inline-block;padding:12px 28px;border-radius:12px">
          <span style="color:#E4C77B;font-size:22px;font-weight:800;letter-spacing:2px">22Logistics</span>
        </div>
      </div>
      <h2 style="color:#0B1B2B">Trip Completed ✅</h2>
      <p style="color:#374151">Hi <strong>${name}</strong>, thank you for riding with us!</p>
 
      <div style="background:#F9F6F0;border-radius:12px;padding:20px;margin:20px 0">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:6px 0">Package</td>
            <td style="color:#0B1B2B;font-weight:600;font-size:13px;text-align:right">${packageType}</td>
          </tr>
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:6px 0">Driver</td>
            <td style="color:#0B1B2B;font-weight:600;font-size:13px;text-align:right">${driverName}</td>
          </tr>
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:6px 0">Amount Paid</td>
            <td style="color:#0B1B2B;font-weight:700;font-size:15px;text-align:right">₦${totalAmount.toLocaleString()}</td>
          </tr>
        </table>
      </div>
 
      <p style="color:#374151;font-size:14px;margin-bottom:12px">How was your experience? Rate your driver:</p>
      <div style="text-align:center;margin:16px 0 24px">
        ${[1,2,3,4,5].map(n => `
          <a href="${rateUrl}&rating=${n}" style="display:inline-block;margin:0 4px;text-decoration:none;font-size:28px">⭐</a>
        `).join('')}
      </div>
      <div style="text-align:center">
        <a href="${rateUrl}" style="background:#E4C77B;color:#3E2723;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">
          Leave a Full Review
        </a>
      </div>
      <p style="color:#9CA3AF;font-size:12px;text-align:center;margin-top:28px">
        © 22Logistics — Moving you forward.
      </p>
    </div>
    `
  );
};
 
// ── NEW: Support Request Email (sent to support team) ───────────
export const sendSupportRequestEmail = async (
  userEmail: string,
  userName: string,
  subject: string,
  description: string,
  screenshotUrl?: string
) => {
  const supportInbox = process.env.SUPPORT_EMAIL ?? 'hello@22logistics.com';

  // These can run in parallel
  await Promise.all([
    sendEmail(
      supportInbox,
      `[Support] ${subject} — from ${userName}`,
      `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
        <h2 style="color:#0B1B2B">New Support Request</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="color:#6B7280;padding:6px 0;font-size:13px;width:100px">From</td><td style="color:#111;font-weight:600">${userName} &lt;${userEmail}&gt;</td></tr>
          <tr><td style="color:#6B7280;padding:6px 0;font-size:13px">Subject</td><td style="color:#111;font-weight:600">${subject}</td></tr>
        </table>
        <div style="background:#F9F6F0;border-radius:10px;padding:16px;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap">${description}</div>
        ${screenshotUrl ? `<p style="margin-top:16px"><a href="${screenshotUrl}" style="color:#3B82F6">View Attached Screenshot</a></p>` : ''}
      </div>
      `
    ),
    sendEmail(
      userEmail,
      'We received your message — 22Logistics Support',
      `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
        <h2 style="color:#0B1B2B">We got your message, ${userName}!</h2>
        <p style="color:#374151">Our team will review your request and get back to you within 24 hours.</p>
        <div style="background:#F9F6F0;border-radius:12px;padding:16px;margin:16px 0;border-left:4px solid #E4C77B">
          <p style="color:#6B7280;font-size:13px;margin:0"><strong>Subject:</strong> ${subject}</p>
        </div>
        <p style="color:#9CA3AF;font-size:12px">📞 +1238095832217 &nbsp;|&nbsp; ✉️ hello@22logistics.com</p>
      </div>
      `
    ),
  ]);
};