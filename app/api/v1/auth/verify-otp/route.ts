import { createClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized session context. Please log in again.",
        },
        { status: 401 },
      );
    }

    // Read request body
    const { otp } = await request.json();
    console.log(otp);

    // Validate OTP
    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          error: "OTP must be a 6-digit code.",
        },
        { status: 400 },
      );
    }

    // Complete first login
    const { data, error: dbError } = await supabase.rpc(
      "complete_first_login",
      {
        p_user_id: user.id,
        p_code: otp,
      },
    );

    // Database/RPC error
    if (dbError) {
      console.error("complete_first_login RPC error:", dbError);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify OTP.",
        },
        { status: 500 },
      );
    }

    // Invalid / expired / already-used OTP
    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired OTP.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "First login completed successfully.",
    });
  } catch (error) {
    console.error("First login verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal validation error.",
      },
      { status: 500 },
    );
  }
}

// import { createClient } from "@/libs/supabase/server";
// import { cookies } from "next/headers";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   try {
//     const cookieStore = await cookies();
//     const supabase = createClient(cookieStore);

//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser();

//     if (authError || !user) {
//       return NextResponse.json(
//         { error: "Unauthorized session context. Please log in again." },
//         { status: 401 },
//       );
//     }

//     const body = await request.json();
//     const { code } = body;

//     if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "OTP must be a 6-digit code.",
//         },
//         { status: 400 },
//       );
//     }

//     // Verify OTP through PostgreSQL
//     const { data, error: dbError } = await supabase.rpc(
//       "complete_first_login",
//       {
//         p_user_id: user.id,
//         p_code: code,
//       },
//     );

//     if (dbError) {
//       console.error("complete_first_login RPC error:", dbError);

//       return NextResponse.json(
//         {
//           success: false,
//           error: "Unable to verify OTP.",
//         },
//         { status: 500 },
//       );
//     }

//     if (!data) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid or expired OTP.",
//         },
//         { status: 401 },
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "First login completed successfully.",
//     });
//   } catch (error: any) {
//     console.error("First login verification error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Internal server error.",
//       },
//       { status: 500 },
//     );
//   }
// }
