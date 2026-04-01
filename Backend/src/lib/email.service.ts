import nodemailer from 'nodemailer';
const IS_DEV = process.env.NODE_ENV === 'development';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,  // your Brevo login email
    pass: process.env.BREVO_SMTP_KEY, // SMTP key, NOT your account password
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
    
console.log(`\n📧 VERIFICATION CODE for ${email}: ${code}\n`);
  await transporter.sendMail({
    from: `"22Logistics" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: 'Verify your email',
    html: `<p>Your verification code is: <strong>${code}</strong>. It expires in 15 minutes.</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
        console.log(`\n📧 VERIFICATION CODE for ${email}: ${code}\n`);
  await transporter.sendMail({
    from: `"22Logistics" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: 'Reset your password',
    html: `<p>Your password reset code is: <strong>${code}</strong>. It expires in 15 minutes.</p>`,
  });
};



// Add to `.env`:
// ```
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your@email.com
// SMTP_PASS=your_app_password