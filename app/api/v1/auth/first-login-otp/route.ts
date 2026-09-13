import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { sendFirstLoginOtpEmail } from "@/services/email.service";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================================
    // 2. Create a server-only Supabase admin client
    // ============================================================

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data, error: otpError } = await adminSupabase.rpc(
      "prepare_first_login_otp",
      { p_user_id: user.id },
    );

    if (otpError) {
      console.error("❌ FIRST_LOGIN_OTP_GENERATION_ERROR:", otpError);
      return NextResponse.json({ error: otpError.message }, { status: 400 });
    }

    const otpCode = data?.o_otp_code;
    const reference = data?.o_reference;

    if (!otpCode) {
      return NextResponse.json(
        { error: "Unable to generate verification code." },
        { status: 500 },
      );
    }

    // ============================================================
    // 4. Send OTP through Resend
    // ============================================================
    const firstname =
      user.user_metadata?.full_name?.split(" ")[0] || "Investor";

    if (!user.email) {
      return NextResponse.json(
        { error: "No verified email on file for this account." },
        { status: 400 },
      );
    }

    try {
      await sendFirstLoginOtpEmail({
        email: user.email,
        otp: otpCode,
        firstname,
      });
    } catch (mailError) {
      console.error("❌ FIRST_LOGIN_OTP_EMAIL_ERROR:", mailError, {
        reference,
      });
      return NextResponse.json(
        { error: "Verification code was generated but could not be sent." },
        { status: 500 },
      );
    }

    // ============================================================
    // 6. Success
    // ============================================================
    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
    });
  } catch (error: any) {
    console.error("❌ FIRST_LOGIN_OTP_ROUTE_CRASH:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to prepare login verification.",
      },
      {
        status: 500,
      },
    );
  }
}
