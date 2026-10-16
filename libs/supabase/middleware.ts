import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  homeForRole,
  isAdminPath,
  isAdminRole,
  isAuthPage,
  isUserPath,
} from "@/libs/auth/routes";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Redirect, but keep any refreshed (or cleared) login cookies
  const redirect = (path: string, params: Record<string, string> = {}) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  // getUser() asks Supabase to verify the login, so it can't be faked
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    console.error("Supabase proxy auth error:", error.message);
  }

  const pathname = request.nextUrl.pathname;
  const needsAdmin = isAdminPath(pathname);
  const needsUser = isUserPath(pathname);
  const isPrivate = needsAdmin || needsUser;

  // 1. Not logged in
  if (!user) {
    if (isPrivate) return redirect("/login", { redirect: pathname });
    return supabaseResponse;
  }

  // 2. Logged in: find out who they are
  const { data: profile } = await supabase
    .from("users")
    .select("role, status, first_login")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Can't confirm who this is, so keep them out of private pages
    if (isPrivate) return redirect("/login", { reason: "profile" });
    return supabaseResponse;
  }

  // 3. Suspended or deleted accounts are signed out
  if (profile.status !== "active") {
    await supabase.auth.signOut();
    if (isPrivate) return redirect("/login", { reason: "inactive" });
    return supabaseResponse;
  }

  const admin = isAdminRole(profile.role);

  // 4. Logged-in people don't need the landing, login or register pages
  if (pathname === "/" || isAuthPage(pathname)) {
    return redirect(homeForRole(profile.role));
  }

  // 5. Strict separation: admins and customers stay in their own area
  if (needsAdmin && !admin) return redirect("/dashboard");
  if (needsUser && admin) return redirect("/admin");

  // 6. New customers must finish the first-login code first
  if (needsUser && profile.first_login) {
    return redirect("/verify-otp", { email: user.email ?? "" });
  }

  return supabaseResponse;
}

// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   });

//   const supabase = createServerClient(supabaseUrl, supabaseKey, {
//     cookies: {
//       getAll() {
//         return request.cookies.getAll();
//       },

//       setAll(cookiesToSet) {
//         cookiesToSet.forEach(({ name, value }) => {
//           request.cookies.set(name, value);
//         });

//         supabaseResponse = NextResponse.next({
//           request,
//         });

//         cookiesToSet.forEach(({ name, value, options }) => {
//           supabaseResponse.cookies.set(name, value, options);
//         });
//       },
//     },
//   });

//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.getUser();

//   if (error) {
//     console.error("Supabase middleware auth error:", error);
//   }

//   const pathname = request.nextUrl.pathname;

//   const isProtectedPath =
//     pathname.startsWith("/admin") ||
//     pathname.startsWith("/dashboard") ||
//     pathname.startsWith("/profile") ||
//     pathname.startsWith("/settings");

//   if (isProtectedPath && !user) {
//     const loginUrl = request.nextUrl.clone();

//     loginUrl.pathname = "/login";
//     loginUrl.searchParams.set("redirect", pathname);

//     return NextResponse.redirect(loginUrl);
//   }

//   return supabaseResponse;
// }
