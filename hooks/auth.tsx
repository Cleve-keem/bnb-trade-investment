import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import UserService from "@/services/user.service";

export function useLoginMutation() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: AuthService.login,

    onMutate: () => {
      return toast.loading("Verifying credentials...");
    },

    onSuccess: async (data, variables, contextToastId) => {
      toast.dismiss(contextToastId);

      const user = data.user;
      console.log("user", user);
      if (!user) {
        toast.error("Unable to authenticate user!");
        return;
      }
      // fetch profile
      const { profile, error } = await UserService.fetchUserProfileById(
        user.id,
      );

      if (error || !profile) {
        toast.error("Unable to load profile account");
        return;
      }
      // Admin
      if (profile.role === "admin") {
        toast.success("Welcome back!");
        router.push("/admin");
        return;
      }

      if (profile?.first_login) {
        try {
          await AuthService.prepareFirstLoginOtp();
          toast.success("Verification code sent to your email.");
          router.push(
            `/verify-otp?email=${encodeURIComponent(variables.email)}`,
          );
          return;
        } catch (error: any) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to send verification code.",
          );
          return;
        }
      }

      toast.success(`Welcome back!`);
      router.push("/dashboard");
    },

    onError(error, variables, contextToastId) {
      toast.dismiss(contextToastId);
      toast.error(error.message);
    },
  });

  return { mutate, isPending };
}

export function useRegisterMutation() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: AuthService.register,

    onMutate: () => {
      return toast.loading("Processing validation records...");
    },

    onSuccess(data, variables, contextToastId) {
      toast.dismiss(contextToastId);
      toast.success(
        "Registration successful! Please check your email to verify your account.",
      );
      router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
    },

    onError: (error: any, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      if (error) {
        console.error(
          "Full Supabase Context Object:",
          JSON.stringify(error, null, 2),
        );
      }

      if (error.status === 429) {
        alert("Too many attempts. Please try again in an hour.");
      } else {
        toast.error(error.message);
      }
    },
  });
  return { mutate, isPending };
}

export function useForgotPasswordMutation(onSuccessCallback?: () => void) {
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/v1/auth/send-password-reset-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to transmit custom recovery parameters.",
        );
      }

      return result;
    },
    onMutate: () => {
      return toast.loading("Processing validation records...");
    },

    onSuccess: (data, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.success(
        "A custom reset link has been dispatched to your email address.",
      );
      setEmailSent(true);

      if (onSuccessCallback) onSuccessCallback();
    },

    onError: (error: any, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.error(
        error.message || "Failed to process recovery initialization.",
      );
    },
  });

  return { mutate, isPending, emailSent };
}

export function useLogoutMutation() {
  const router = useRouter();

  const { mutate: logout, isPending } = useMutation({
    mutationFn: AuthService.logout,

    onMutate: () => {
      return toast.loading("Logging out...");
    },

    onSuccess: (_, __, toastId) => {
      toast.success("Logged out successfully", {
        id: toastId,
      });

      router.push("/login");
    },

    onError: (_, __, toastId) => {
      toast.error("Failed to log out", {
        id: toastId,
      });
    },
  });

  return {
    logout,
    isPending,
  };
}
