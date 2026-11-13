// const to = process.argv[2];

// if (!to) {
//   console.error(
//     "Usage: node --env-file=.env.local scripts/test-email.mjs you@gmail.com",
//   );
//   process.exit(1);
// }

// const response = await fetch("https://api.brevo.com/v3/smtp/email", {
//   method: "POST",
//   headers: {
//     "api-key": process.env.BREVO_API_KEY ?? "",
//     "content-type": "application/json",
//     accept: "application/json",
//   },
//   body: JSON.stringify({
//     sender: {
//       name: process.env.BREVO_SENDER_NAME || "BNB Investment Trade",
//       email: process.env.BREVO_SENDER_EMAIL,
//     },
//     to: [{ email: to }],
//     subject: "BNB test email",
//     textContent: "If you can read this, Brevo delivery works.",
//   }),
// });

// console.log("Status:", response.status);
// console.log(await response.text());

import { Resend } from "resend";

const to = process.argv[2];

if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
  console.error(
    "Usage: node --env-file=.env.local scripts/test-email.mjs you@gmail.com",
  );
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

const senderEmail = process.env.RESEND_SENDER_EMAIL;
const senderName = process.env.RESEND_SENDER_NAME || "BNB Investment Trade";

if (!senderEmail) {
  console.error("RESEND_SENDER_EMAIL is missing.");
  process.exit(1);
}

const { data, error } = await resend.emails.send({
  from: `${senderName} <${senderEmail}>`,
  to,
  subject: "BNB Investment Trade - Test Email",
  html: `
    <h2>Resend integration successful!</h2>
    <p>Your BNB Investment Trade email service is working.</p>
  `,
  text: "Your BNB Investment Trade email service is working.",
});

if (error) {
  console.error("Email failed:", error);
  process.exit(1);
}

console.log("Email accepted by Resend!");
console.log("Message ID:", data.id);
