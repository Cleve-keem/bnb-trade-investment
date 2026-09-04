import { supabase } from "@/libs/supabase/browser";
import {
  forgotPasswordSchema,
  LoginSchemaInput,
  RegisterSchemaInput,
} from "@/libs/validations/auth";

export const AuthService = {
  async register(data: RegisterSchemaInput) {
    const fullName = [data.lastname, data.firstname, data.middlename]
      .filter(Boolean)
      .join(" ");

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          full_name: fullName.trim(),
          phone: data.phoneNumber,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return authData;
  },

  async login(data: LoginSchemaInput) {
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return result;
  },

  async prepareFirstLoginOtp() {
    const response = await fetch(`/api/v1/auth/first-login-otp`, {
      method: "POST",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to send verification code.");
    }

    return result;
  },

  async verifyOTP(otp: string) {
    if (!otp) {
      throw new Error("Please enter the OTP sent to your email address.");
    }

    const response = await fetch("/api/v1/auth/verify-otp", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to verify OTP.");
    }

    return result;
  },

  async forgotPassword() {
    return "change password";
  },

  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },
};
