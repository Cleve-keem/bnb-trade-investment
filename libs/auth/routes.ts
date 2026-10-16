export const isAdminRole = (role?: string | null) =>
  role === "admin" || role === "super_admin";

export const homeForRole = (role?: string | null) =>
  isAdminRole(role) ? "/admin" : "/dashboard";

const ADMIN_PREFIX = "/admin";
// Add any other private customer route here
const USER_PREFIXES = ["/dashboard", "/profile", "/settings"];
// Do NOT add /verify-otp, /verify-email or /reset-password here
const AUTH_PAGES = ["/login", "/register"];

const under = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(prefix + "/");

export const isAdminPath = (p: string) => under(p, ADMIN_PREFIX);
export const isUserPath = (p: string) => USER_PREFIXES.some((x) => under(p, x));
export const isAuthPage = (p: string) => AUTH_PAGES.some((x) => under(p, x));

// After login, only send people to a page they're allowed to see.
export function safeRedirect(target: string | null, role?: string | null) {
  const fallback = homeForRole(role);
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }
  if (isAdminRole(role)) return isAdminPath(target) ? target : fallback;
  return isUserPath(target) ? target : fallback;
}
