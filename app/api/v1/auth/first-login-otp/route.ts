import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/libs/supabase/admin";
import { sendFirstLoginOtpEmail } from "@/services/email.service";

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return fail("Unauthorized.", 401);
    if (!user.email) return fail("No email on file for this account.", 400);

    const admin = createAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("users")
      .select("first_login, status, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("FIRST_LOGIN_OTP_PROFILE_ERROR:", profileError);
      return fail("Unable to load your account.", 500);
    }
    if (profile.status !== "active")
      return fail("This account is not active.", 403);
    if (!profile.first_login)
      return fail("Your account is already verified.", 400);

    // At most 1 code per minute and 5 per hour
    const { data: allowed, error: throttleError } = await admin.rpc(
      "allow_auth_email",
      {
        p_kind: "first_login_otp",
        p_subject: user.id,
        p_cooldown_seconds: 60,
        p_max_per_hour: 5,
      },
    );

    if (throttleError) {
      console.error("FIRST_LOGIN_OTP_THROTTLE_ERROR:", throttleError);
      return fail("Unable to send a verification code right now.", 500);
    }
    if (!allowed) {
      return fail("Please wait a minute before requesting another code.", 429);
    }

    const { data, error: otpError } = await admin.rpc(
      "prepare_first_login_otp",
      {
        p_user_id: user.id,
      },
    );

    if (otpError) {
      console.error("FIRST_LOGIN_OTP_GENERATION_ERROR:", otpError);
      return fail("Unable to generate a verification code.", 500);
    }

    // The function may return one row or a list of rows
    const row = Array.isArray(data) ? data[0] : data;
    const otpCode: string | undefined = row?.o_otp_code;
    const reference: string | undefined = row?.o_reference;

    if (!otpCode) return fail("Unable to generate a verification code.", 500);

    const fullName = profile.full_name || user.user_metadata?.full_name || "";
    const firstname = fullName.trim().split(/\s+/)[0] || "Investor";

    try {
      await sendFirstLoginOtpEmail({
        email: user.email,
        otp: otpCode,
        firstname,
      });
    } catch (mailError) {
      console.error("FIRST_LOGIN_OTP_EMAIL_ERROR:", mailError, { reference });
      return fail(
        "We generated your code but could not email it. Please try again.",
        502,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
    });
  } catch (error) {
    console.error("FIRST_LOGIN_OTP_ROUTE_CRASH:", error);
    return fail("Failed to prepare login verification.", 500);
  }
}

// import { NextResponse } from "next/server";
// import { createClient } from "@/libs/supabase/server";
// import { cookies } from "next/headers";
// import { createClient as createAdminClient } from "@supabase/supabase-js";
// import { sendFirstLoginOtpEmail } from "@/services/email.service";

// export async function POST() {
//   try {
//     const cookieStore = await cookies();
//     const supabase = createClient(cookieStore);

//     const {
//       data: { user },
//       error: userError,
//     } = await supabase.auth.getUser();

//     if (userError || !user) {
//       return NextResponse.json(
//         {
//           error: "Unauthorized.",
//         },
//         {
//           status: 401,
//         },
//       );
//     }

//     // ============================================================
//     // 2. Create a server-only Supabase admin client
//     // ============================================================

//     const adminSupabase = createAdminClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
//       {
//         auth: {
//           autoRefreshToken: false,
//           persistSession: false,
//         },
//       },
//     );

//     const { data, error: otpError } = await adminSupabase.rpc(
//       "prepare_first_login_otp",
//       { p_user_id: user.id },
//     );

//     if (otpError) {
//       console.error("❌ FIRST_LOGIN_OTP_GENERATION_ERROR:", otpError);
//       return NextResponse.json({ error: otpError.message }, { status: 400 });
//     }

//     const otpCode = data?.o_otp_code;
//     const reference = data?.o_reference;

//     if (!otpCode) {
//       return NextResponse.json(
//         { error: "Unable to generate verification code." },
//         { status: 500 },
//       );
//     }

//     // ============================================================
//     // 4. Send OTP through Resend
//     // ============================================================
//     const firstname =
//       user.user_metadata?.full_name?.split(" ")[0] || "Investor";

//     if (!user.email) {
//       return NextResponse.json(
//         { error: "No verified email on file for this account." },
//         { status: 400 },
//       );
//     }

//     try {
//       await sendFirstLoginOtpEmail({
//         email: user.email,
//         otp: otpCode,
//         firstname,
//       });
//     } catch (mailError) {
//       console.error("❌ FIRST_LOGIN_OTP_EMAIL_ERROR:", mailError, {
//         reference,
//       });
//       return NextResponse.json(
//         { error: "Verification code was generated but could not be sent." },
//         { status: 500 },
//       );
//     }

//     // ============================================================
//     // 6. Success
//     // ============================================================
//     return NextResponse.json({
//       success: true,
//       message: "Verification code sent successfully.",
//     });
//   } catch (error: any) {
//     console.error("❌ FIRST_LOGIN_OTP_ROUTE_CRASH:", error);

//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "Failed to prepare login verification.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }
