import { Resend } from "resend";

type Recipient = { email: string; name?: string };

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]!,
  );

async function sendEmail({
  to,
  subject,
  html,
  text,
  tags,
}: {
  to: Recipient;
  subject: string;
  html: string;
  text: string;
  tags?: string[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_SENDER_EMAIL;
  const senderName = process.env.RESEND_SENDER_NAME || "BNB Investment Trade";

  if (!apiKey || !senderEmail) {
    throw new Error(
      "Email service is not configured (RESEND_API_KEY or RESEND_SENDER_EMAIL is missing).",
    );
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send(
    {
      from: `${senderName} <${senderEmail}>`,
      to: to.email,
      subject,
      html,
      text,
      tags: tags?.map((tag, index) => ({
        name: `tag_${index + 1}`,
        value: tag,
      })),
    },
    // {
    //   signal: AbortSignal.timeout(10_000),
    // },
  );

  if (error) {
    throw new Error(
      `Resend responded ${error.statusCode ?? "unknown"}: ${error.message}`,
    );
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email ID.");
  }

  // Keep the same return shape as the previous Brevo utility.
  return { messageId: data.id };
}

function layout(title: string, content: string) {
  return `<!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#ffffff;">
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #111111;">

        <div style="background:#000000;padding:14px 18px;border-radius:6px;display:inline-block;margin-bottom:20px;">
          <span style="color:#e9ce39;font-size:20px;font-weight:700;">BNB</span>
          <span style="color:#ffffff;font-size:20px;font-weight:600;"> Investment Trade</span>
        </div>

        <h2 style="font-size:20px;margin:0 0 8px 0;">${title}</h2>

        ${content}

        <hr style="border:none;border-top:1px solid #eeeeee;margin:30px 0 20px;" />

        <p style="font-size:11px;color:#999999;line-height:1.5;">Secure · Reliable · Trusted</p>
      </div>
    </body>
  </html>`;
}

const paragraph = (text: string) =>
  `<p style="font-size:14px;color:#444444;line-height:1.6;">${text}</p>`;

// FIRST LOGIN OTP EMAIL
export async function sendFirstLoginOtpEmail({
  firstname,
  email,
  otp,
}: {
  email: string;
  otp: string;
  firstname: string;
}) {
  const name = escapeHtml(firstname || "Investor");

  const html = layout(
    "Login Verification",
    `${paragraph(`Hello ${name},`)}
     ${paragraph(
       "We detected your first login to your BNB Investment Trade account. Use the verification code below to complete your secure login.",
     )}
     <div style="background:#fafafa;border:1px solid #eeeeee;border-left:4px solid #dabc17;padding:20px;margin:24px 0;text-align:center;border-radius:6px;">
       <p style="margin:0 0 8px 0;font-size:12px;color:#777777;text-transform:uppercase;letter-spacing:1px;">Verification Code</p>
       <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#111111;">${escapeHtml(otp)}</div>
       <p style="margin:12px 0 0 0;font-size:12px;color:#777777;">This code expires in 10 minutes.</p>
     </div>
     <p style="font-size:13px;color:#555555;line-height:1.5;">If you did not attempt to log in, you can safely ignore this email and secure your account if necessary. We will never ask you for this code.</p>`,
  );

  const text = `Hello ${firstname || "Investor"},

Your BNB Investment Trade verification code is: ${otp}

This code expires in 10 minutes. If you did not attempt to log in, ignore this email. We will never ask you for this code.`;

  return sendEmail({
    to: { email },
    subject: "BNB Investment Trade - Login Verification Code",
    html,
    text,
    tags: ["first-login-otp"],
  });
}

// PASSWORD RESET EMAIL
export async function sendPasswordResetEmail({
  firstname,
  email,
  resetUrl,
}: {
  firstname: string;
  email: string;
  resetUrl: string;
}) {
  const name = escapeHtml(firstname || "Investor");
  const url = escapeHtml(resetUrl);

  const html = layout(
    "Reset your password",
    `${paragraph(`Hello ${name},`)}
     ${paragraph(
       "We received a request to reset the password for your BNB Investment Trade account. Click the button below to choose a new password.",
     )}
     <p style="margin:24px 0;">
       <a href="${url}" style="display:inline-block;background:#dabc17;color:#000000;font-weight:700;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:6px;">Reset password</a>
     </p>
     <p style="font-size:12px;color:#777777;line-height:1.6;">This link can only be used once and expires after a short time. If the button does not work, copy this address into your browser:</p>
     <p style="font-size:12px;color:#555555;word-break:break-all;">${url}</p>
     <p style="font-size:13px;color:#555555;line-height:1.5;">If you did not ask for this, you can safely ignore this email. Your password will not change.</p>`,
  );

  const text = `Hello ${firstname || "Investor"},

We received a request to reset your BNB Investment Trade password. Open this link to choose a new one:

${resetUrl}

This link can only be used once and expires after a short time. If you did not ask for this, ignore this email.`;

  return sendEmail({
    to: { email },
    subject: "Reset your BNB Investment Trade password",
    html,
    text,
    tags: ["password-reset"],
  });
}

// type Recipient = { email: string; name?: string };

// const escapeHtml = (value: string) =>
//   value.replace(
//     /[&<>"']/g,
//     (char) =>
//       ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
//         char
//       ]!,
//   );

// async function sendEmail({
//   to,
//   subject,
//   html,
//   text,
//   tags,
// }: {
//   to: Recipient;
//   subject: string;
//   html: string;
//   text: string;
//   tags?: string[];
// }) {
//   const apiKey = process.env.BREVO_API_KEY;
//   const senderEmail = process.env.BREVO_SENDER_EMAIL;

//   if (!apiKey || !senderEmail) {
//     throw new Error(
//       "Email service is not configured (BREVO_API_KEY or BREVO_SENDER_EMAIL is missing).",
//     );
//   }

//   const response = await fetch("https://api.brevo.com/v3/smtp/email", {
//     method: "POST",
//     headers: {
//       "api-key": apiKey,
//       "content-type": "application/json",
//       accept: "application/json",
//     },
//     body: JSON.stringify({
//       sender: {
//         name: process.env.BREVO_SENDER_NAME || "BNB Investment Trade",
//         email: senderEmail,
//       },
//       to: [to],
//       subject,
//       htmlContent: html,
//       textContent: text,
//       tags,
//     }),
//     signal: AbortSignal.timeout(10_000),
//   });

//   if (!response.ok) {
//     const detail = await response.text().catch(() => "");
//     throw new Error(`Brevo responded ${response.status}: ${detail}`);
//   }

//   return (await response.json().catch(() => ({}))) as { messageId?: string };
// }

// function layout(title: string, content: string) {
//   return `<!DOCTYPE html>
//   <html>
//     <body style="margin:0;padding:0;background:#ffffff;">
//       <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #111111;">
//         <div style="background:#000000;padding:14px 18px;border-radius:6px;display:inline-block;margin-bottom:20px;">
//           <span style="color:#e9ce39;font-size:20px;font-weight:700;">BNB</span>
//           <span style="color:#ffffff;font-size:20px;font-weight:600;"> Investment Trade</span>
//         </div>

//         <h2 style="font-size:20px;margin:0 0 8px 0;">${title}</h2>

//         ${content}

//         <hr style="border:none;border-top:1px solid #eeeeee;margin:30px 0 20px;" />
//         <p style="font-size:11px;color:#999999;line-height:1.5;">Secure · Reliable · Trusted</p>
//       </div>
//     </body>
//   </html>`;
// }

// const paragraph = (text: string) =>
//   `<p style="font-size:14px;color:#444444;line-height:1.6;">${text}</p>`;

// export async function sendFirstLoginOtpEmail({
//   firstname,
//   email,
//   otp,
// }: {
//   email: string;
//   otp: string;
//   firstname: string;
// }) {
//   const name = escapeHtml(firstname || "Investor");

//   const html = layout(
//     "Login Verification",
//     `${paragraph(`Hello ${name},`)}
//      ${paragraph(
//        "We detected your first login to your BNB Investment Trade account. Use the verification code below to complete your secure login.",
//      )}
//      <div style="background:#fafafa;border:1px solid #eeeeee;border-left:4px solid #dabc17;padding:20px;margin:24px 0;text-align:center;border-radius:6px;">
//        <p style="margin:0 0 8px 0;font-size:12px;color:#777777;text-transform:uppercase;letter-spacing:1px;">Verification Code</p>
//        <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#111111;">${escapeHtml(otp)}</div>
//        <p style="margin:12px 0 0 0;font-size:12px;color:#777777;">This code expires in 10 minutes.</p>
//      </div>
//      <p style="font-size:13px;color:#555555;line-height:1.5;">If you did not attempt to log in, you can safely ignore this email and secure your account if necessary. We will never ask you for this code.</p>`,
//   );

//   const text = `Hello ${firstname || "Investor"},

//   Your BNB Investment Trade verification code is: ${otp}

//   This code expires in 10 minutes. If you did not attempt to log in, ignore this email. We will never ask you for this code.`;

//   return sendEmail({
//     to: { email },
//     subject: "BNB Investment Trade - Login Verification Code",
//     html,
//     text,
//     tags: ["first-login-otp"],
//   });
// }

// export async function sendPasswordResetEmail({
//   firstname,
//   email,
//   resetUrl,
// }: {
//   firstname: string;
//   email: string;
//   resetUrl: string;
// }) {
//   const name = escapeHtml(firstname || "Investor");
//   const url = escapeHtml(resetUrl);

//   const html = layout(
//     "Reset your password",
//     `${paragraph(`Hello ${name},`)}
//      ${paragraph(
//        "We received a request to reset the password for your BNB Investment Trade account. Click the button below to choose a new password.",
//      )}
//      <p style="margin:24px 0;">
//        <a href="${url}" style="display:inline-block;background:#dabc17;color:#000000;font-weight:700;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:6px;">Reset password</a>
//      </p>
//      <p style="font-size:12px;color:#777777;line-height:1.6;">This link can only be used once and expires after a short time. If the button does not work, copy this address into your browser:</p>
//      <p style="font-size:12px;color:#555555;word-break:break-all;">${url}</p>
//      <p style="font-size:13px;color:#555555;line-height:1.5;">If you did not ask for this, you can safely ignore this email. Your password will not change.</p>`,
//   );

//   const text = `Hello ${firstname || "Investor"},

// We received a request to reset your BNB Investment Trade password. Open this link to choose a new one:

// ${resetUrl}

// This link can only be used once and expires after a short time. If you did not ask for this, ignore this email.`;

//   return sendEmail({
//     to: { email },
//     subject: "Reset your BNB Investment Trade password",
//     html,
//     text,
//     tags: ["password-reset"],
//   });
// }

// import { BrevoClient } from "@getbrevo/brevo";

// export const brevo = new BrevoClient({
//   apiKey: process.env.BREVO_API_KEY!,
// });

// export async function sendFirstLoginOtpEmail({
//   firstname,
//   email,
//   otp,
// }: {
//   email: string;
//   otp: string;
//   firstname: string;
// }) {
//   const response = await brevo.transactionalEmails.sendTransacEmail({
//     sender: {
//       name: process.env.BREVO_SENDER_NAME!,
//       email: process.env.BREVO_SENDER_EMAIL!,
//     },

//     to: [
//       {
//         email,
//       },
//     ],
//     subject: "BNB Investment Trade - Login Verification Code",
//     htmlContent: `
//      <!DOCTYPE html>
//       <html>
//         <body>
//           <div
//             style="
//               font-family: Arial, sans-serif;
//               max-width: 500px;
//               margin: 0 auto;
//               padding: 24px;
//               color: #111111;
//             "
//           >

//             <div
//               style="
//                 background: #000000;
//                 padding: 14px 18px;
//                 border-radius: 6px;
//                 display: inline-block;
//                 margin-bottom: 20px;
//               "
//             >
//               <span
//                 style="
//                   color: #e9ce39;
//                   font-size: 20px;
//                   font-weight: 700;
//                 "
//               >
//                 BNB
//               </span>

//               <span
//                 style="
//                   color: #ffffff;
//                   font-size: 20px;
//                   font-weight: 600;
//                 "
//               >
//                 Investment Trade
//               </span>
//             </div>

//             <h2
//               style="
//                 font-size: 20px;
//                 margin-bottom: 8px;
//               "
//             >
//               Login Verification
//             </h2>

//             <p
//               style="
//                 font-size: 14px;
//                 color: #444444;
//                 line-height: 1.6;
//               "
//             >
//               Hello ${firstname},
//             </p>

//             <p
//               style="
//                 font-size: 14px;
//                 color: #444444;
//                 line-height: 1.6;
//               "
//             >
//               We detected your first login to your BNB Investment Trade
//               account. Use the verification code below to complete your
//               secure login.
//             </p>

//             <div
//               style="
//                 background: #fafafa;
//                 border: 1px solid #eeeeee;
//                 border-left: 4px solid #dabc17;
//                 padding: 20px;
//                 margin: 24px 0;
//                 text-align: center;
//                 border-radius: 6px;
//               "
//             >
//               <p
//                 style="
//                   margin: 0 0 8px 0;
//                   font-size: 12px;
//                   color: #777777;
//                   text-transform: uppercase;
//                   letter-spacing: 1px;
//                 "
//               >
//                 Verification Code
//               </p>

//               <div
//                 style="
//                   font-size: 32px;
//                   font-weight: 700;
//                   letter-spacing: 8px;
//                   color: #111111;
//                 "
//               >
//                 ${otp}
//               </div>

//               <p
//                 style="
//                   margin: 12px 0 0 0;
//                   font-size: 12px;
//                   color: #777777;
//                 "
//               >
//                 This code expires in 10 minutes.
//               </p>
//             </div>

//             <p
//               style="
//                 font-size: 13px;
//                 color: #555555;
//                 line-height: 1.5;
//               "
//             >
//               If you did not attempt to log in, you can safely ignore this
//               email and secure your account if necessary.
//             </p>

//             <hr
//               style="
//                 border: none;
//                 border-top: 1px solid #eeeeee;
//                 margin: 30px 0 20px;
//               "
//             />

//             <p
//               style="
//                 font-size: 11px;
//                 color: #999999;
//                 line-height: 1.5;
//               "
//             >
//               Secure · Reliable · Trusted
//             </p>

//           </div>
//         </body>
//         </html>
//         `,
//   });

//   return response;
// };
