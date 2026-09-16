import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export type CreateUserBody = {
  fullname: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: "user" | "admin" | "super_admin";
  status: "active" | "suspended";
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // GET CURRENT USER
    const {
      data: { user: currentAuthUser },
      error: authError,
    } = await supabase.auth.getUser();

    // THROW ERROR IF NO USER FOUND
    if (authError || !currentAuthUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // GET USER ROLE & STATUS
    const { data: currentAdmin, error: adminError } = await supabase
      .from("users")
      .select("id, role, status")
      .eq("id", currentAuthUser.id)
      .single();

    // THROW ERROR IF NOT ADMIN
    if (adminError || !currentAdmin) {
      return NextResponse.json(
        { error: "Unable to verify administrator." },
        { status: 403 },
      );
    }

    if (
      !["admin", "super_admin"].includes(currentAdmin.role) ||
      currentAdmin.status !== "active"
    ) {
      return NextResponse.json(
        { error: "You do not have permission to create users." },
        { status: 403 },
      );
    }
    // GET DATA FROM BODY
    const body = (await request.json()) as CreateUserBody;
    const { fullname, username, email, phone, password, role, status } = body;

    // THROW ERROR IF DATA ARE EMPTY
    if (!fullname?.trim() || !username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    }

    // VERIFY PASSWORD LENGHT
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    // RETURN 400 IF ROLE ISN'T USER | ADMIN | SUPER_ADMIN
    if (!["user", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // RETURN 400 IF STATUS ISN'T ACTIVE | SUSPENDED
    if (!["active", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    /*
     * --------------------------------------------------------
     * Only super_admin can create super_admin
     * --------------------------------------------------------
     */

    if (role === "super_admin" && currentAdmin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only a super admin can create another super admin." },
        { status: 403 },
      );
    }
    /*
     * --------------------------------------------------------
     * Server-side Supabase admin client
     * --------------------------------------------------------
     */
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is missing.");

      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 },
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
    /*
     * --------------------------------------------------------
     * Check username
     * --------------------------------------------------------
     */
    const { data: existingUsername } = await adminSupabase
      .from("users")
      .select("id")
      .eq("username", username.trim())
      .maybeSingle();

    if (existingUsername) {
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 409 },
      );
    }
    /*
     * --------------------------------------------------------
     * Check email
     * --------------------------------------------------------
     */
    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingEmail } = await adminSupabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { error: "That email is already registered." },
        { status: 409 },
      );
    }
    /*
     * --------------------------------------------------------
     * Create Supabase Auth user
     * --------------------------------------------------------
     */
    const { data: authData, error: createAuthError } =
      await adminSupabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullname.trim(),
          username: username.trim(),
          phone: phone?.trim() || null,
          role: role.trim() || "user",
        },
      });

    if (createAuthError || !authData.user) {
      return NextResponse.json(
        {
          error:
            createAuthError?.message ||
            "Failed to create authentication account.",
        },
        { status: 400 },
      );
    }

    const userId = authData.user.id;
    /*
     * --------------------------------------------------------
     * Create/update public.users
     * --------------------------------------------------------
     */
    const { data: existingProfile } = await adminSupabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    let profileError = null;

    if (existingProfile) {
      const { error } = await adminSupabase
        .from("users")
        .update({
          email: normalizedEmail,
          username: username.trim(),
          full_name: fullname.trim(),
          phone: phone?.trim() || null,
          role,
          status,
        })
        .eq("id", userId);

      profileError = error;
    } else {
      const { error } = await adminSupabase.from("users").insert({
        id: userId,
        email: normalizedEmail,
        username: username.trim(),
        full_name: fullname.trim(),
        phone: phone?.trim() || null,
        role,
        status,
      });

      profileError = error;
    }

    if (profileError) {
      await adminSupabase.auth.admin.deleteUser(userId);

      return NextResponse.json(
        {
          error: "Failed to create user profile. The account was rolled back.",
        },
        { status: 500 },
      );
    }

    /*
     * --------------------------------------------------------
     * Ensure wallet exists
     * --------------------------------------------------------
     */

    const { data: existingWallet } = await adminSupabase
      .from("wallets")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingWallet) {
      const { error: walletError } = await adminSupabase
        .from("wallets")
        .insert({
          user_id: userId,
          balance: 0,
          locked_balance: 0,
          currency: "USD",
          status: "active",
        });

      if (walletError) {
        await adminSupabase.from("users").delete().eq("id", userId);

        await adminSupabase.auth.admin.deleteUser(userId);

        return NextResponse.json(
          {
            error: "Failed to create user wallet. The account was rolled back.",
          },
          { status: 500 },
        );
      }
    }

    /*
     * --------------------------------------------------------
     * Success
     * --------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        user: {
          id: userId,
          fullName: fullname.trim(),
          username: username.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || null,
          role,
          status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create admin user error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating the user." },
      { status: 500 },
    );
  }
}
