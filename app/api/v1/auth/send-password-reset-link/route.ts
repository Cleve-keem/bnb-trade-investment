import { NextResponse } from "next/server";
import { createAdminClient } from "@/libs/supabase/admin";
import { sendPasswordResetEmail } from "@/services/email.service";
import { getAppUrl } from "@/libs/api-url";

const OK = {
  success: true,
  message:
    "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.",
};

export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    // handled below
  }

  if (
    !email ||
    email.length > 254 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();

    // Limit per email: 1 per minute, 5 per hour
    const { data: emailOk, error: emailThrottleError } = await admin.rpc(
      "allow_auth_email",
      {
        p_kind: "password_reset",
        p_subject: email,
        p_cooldown_seconds: 60,
        p_max_per_hour: 5,
      },
    );
    if (emailThrottleError) throw emailThrottleError;
    if (!emailOk) {
      return NextResponse.json(
        { error: "Please wait a minute before requesting another reset link." },
        { status: 429 },
      );
    }

    // Limit per IP address: 20 per hour
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) {
      const { data: ipOk } = await admin.rpc("allow_auth_email", {
        p_kind: "password_reset_ip",
        p_subject: ip,
        p_cooldown_seconds: 0,
        p_max_per_hour: 20,
      });
      if (ipOk === false) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 },
        );
      }
    }

    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    // No account with that email (or no link): answer exactly the same way
    if (linkError || !data?.properties?.hashed_token) {
      if (linkError && linkError.status && linkError.status >= 500) {
        console.error("PASSWORD_RESET_LINK_ERROR:", linkError);
      }
      return NextResponse.json(OK);
    }

    const resetUrl = `${getAppUrl()}/reset-password?token_hash=${encodeURIComponent(
      data.properties.hashed_token,
    )}`;

    const fullName: string = data.user?.user_metadata?.full_name ?? "";
    const firstname = fullName.trim().split(/\s+/)[0] || "Investor";

    try {
      await sendPasswordResetEmail({ email, firstname, resetUrl });
    } catch (mailError) {
      console.error("PASSWORD_RESET_EMAIL_ERROR:", mailError);

      // While you set things up you see the real reason. In production the answer stays neutral.
      if (process.env.NODE_ENV !== "production") {
        const reason =
          mailError instanceof Error ? mailError.message : "unknown";
        return NextResponse.json(
          { error: `Email could not be sent: ${reason}` },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(OK);
  } catch (error) {
    console.error("PASSWORD_RESET_ROUTE_CRASH:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

// import { NextResponse } from "next/server";
// import crypto from "crypto";
// import { resendService } from "@/constants";
// import userService from "@/services/user.service";
// import { cookies } from "next/headers";
// import { createClient } from "@/libs/supabase/server";

// export async function POST(req: Request) {
//   const cookieStore = await cookies();
//   const supabase = createClient(cookieStore);

//   try {
//     const { email } = await req.json();

//     if (!email) {
//       return NextResponse.json(
//         { error: "Missing identity payloads." },
//         { status: 400 },
//       );
//     }

//     const { profile, error: profileError } =
//       await userService.fetchUserProfileByEmail(email);

//     if (profileError || !profile) {
//       return NextResponse.json(
//         { error: "No active profile matches this email address." },
//         { status: 404 },
//       );
//     }

//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

//     await supabase.from("email_verifications").delete().eq("email", email);

//     const { error: dbError } = await supabase
//       .from("email_verifications")
//       .insert({
//         user_id: profile.id,
//         token: verificationToken,
//         expires_at: tokenExpiration.toISOString(),
//       });

//     if (dbError) {
//       throw new Error(`Database token write error: ${dbError.message}`);
//     }

//     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
//     const resetLink = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(verificationToken)}`;

//     const { error: mailError } = await resendService.emails.send({
//       from: "BNB Security Node <security@resend.dev>",
//       to: email,
//       subject: "Password Reset Request",
//       html: `
//         <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f8f9fa; padding: 40px 20px;">
//           <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

//             <div style="background: #111827; padding: 24px 32px;">
//               <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">
//                 <span style="color: #e9ce39;">BNB</span> Investment Trade
//               </h1>
//             </div>

//             <div style="padding: 32px;">
//               <h2 style="margin-top: 0; color: #111827; font-size: 22px;">
//                 Reset Your Password
//               </h2>

//               <p style="color: #4b5563; line-height: 1.6;">
//                 Hello ${profile.full_name.split(" ")[0] || "Investor"},
//               </p>

//               <p style="color: #4b5563; line-height: 1.6;">
//                 We received a request to reset the password associated with your BNB Investment Trade account.
//               </p>

//               <p style="color: #4b5563; line-height: 1.6;">
//                 To create a new password, click the button below:
//               </p>

//               <div style="text-align: center; margin: 36px 0;">
//                 <a
//                   href="${resetLink}"
//                   target="_blank"
//                   style="
//                     display: inline-block;
//                     background-color: #e9ce39;
//                     color: #111827;
//                     text-decoration: none;
//                     padding: 14px 28px;
//                     border-radius: 8px;
//                     font-weight: 600;
//                   "
//                 >
//                   Reset Password
//                 </a>
//               </div>

//               <p style="color: #4b5563; line-height: 1.6;">
//                 This password reset link will expire in 24 hours for security reasons.
//               </p>

//               <p style="color: #4b5563; line-height: 1.6;">
//                 If the button above does not work, copy and paste the following URL into your browser:
//               </p>

//               <div style="
//                 background: #f3f4f6;
//                 padding: 12px;
//                 border-radius: 6px;
//                 word-break: break-all;
//                 color: #374151;
//                 font-size: 13px;
//               ">
//                 ${resetLink}
//               </div>

//               <p style="margin-top: 24px; color: #4b5563; line-height: 1.6;">
//                 If you did not request a password reset, you can safely ignore this email. Your account will remain secure and no changes will be made.
//               </p>

//               <p style="margin-top: 32px; color: #4b5563;">
//                 Regards,<br />
//                 BNB Investment Trade Security Team
//               </p>
//             </div>

//             <div style="
//               border-top: 1px solid #e5e7eb;
//               padding: 20px 32px;
//               background: #fafafa;
//               color: #6b7280;
//               font-size: 12px;
//               line-height: 1.6;
//             ">
//               This is an automated message. Please do not reply to this email.
//               <br />
//               © ${new Date().getFullYear()} BNB Investment Trade. All rights reserved.
//             </div>
//           </div>
//         </div>
//       `,
//     });

//     if (mailError) throw new Error(`Email send error: ${mailError.message}`);

//     return NextResponse.json({
//       success: true,
//       message: "Email dispatched successfully via Resend infrastructure.",
//     });
//   } catch (error: any) {
//     console.error("Error sending password reset link:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to send password reset link." },
//       { status: 500 },
//     );
//   }
// }
