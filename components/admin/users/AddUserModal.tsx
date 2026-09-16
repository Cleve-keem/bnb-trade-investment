"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import FormField from "@/components/forms/FormField";
import {
  adminRegisterSchema,
  AdminRegisterSchemaInput,
} from "@/libs/validations/admin";
import { adminRegistrationConstants } from "@/constants/admin/form";
import { CreateUserBody } from "@/app/api/v1/admin/users/create/route";

type AddUserModalProps = {
  onClose: () => void;
};

export default function AddUserModal({ onClose }: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminRegisterSchemaInput>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      username: "",
      fullname: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      role: "user",
      status: "active",
    } as CreateUserBody,
  });

  const onSubmit = async (data: AdminRegisterSchemaInput) => {
    setError(null);

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/v1/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create user.");
      }
      toast.success("User account created successfully.");

      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create user.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d131a] shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0d131a] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0b90b]/10">
              <UserPlus size={18} className="text-[#f0b90b]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Add User</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Create a new user account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 p-5 sm:p-6"
        >
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <section>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">
                Personal Information
              </h3>
              <p className="mt-1 text-xs text-zinc-600">
                Basic information for the user.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {adminRegistrationConstants
                .filter(
                  (field) =>
                    !["password", "confirmPassword", "role", "status"].includes(
                      field.fieldName,
                    ),
                )
                .map((field) => (
                  <FormField
                    key={field.id}
                    field={field}
                    register={register}
                    error={
                      errors[field.fieldName as keyof AdminRegisterSchemaInput]
                        ?.message
                    }
                  />
                ))}
            </div>
          </section>

          {/* Password */}
          <section>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">
                Login Credentials
              </h3>
              <p className="mt-1 text-xs text-zinc-600">
                Set the initial password for the account.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {adminRegistrationConstants
                .filter(
                  (field) =>
                    field.fieldName === "password" ||
                    field.fieldName === "confirmPassword",
                )
                .map((field) => (
                  <FormField
                    key={field.id}
                    field={field}
                    register={register}
                    error={
                      errors[field.fieldName as keyof AdminRegisterSchemaInput]
                        ?.message
                    }
                  />
                ))}
            </div>
          </section>

          {/* Role and status */}
          <section>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">
                Account Access
              </h3>
              <p className="mt-1 text-xs text-zinc-600">
                Choose the user's role and account status.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                field={
                  adminRegistrationConstants.find(
                    (field) => field.fieldName === "role",
                  )!
                }
                register={register}
                error={errors.role?.message}
              >
                <option value="user" className="bg-[#0d131a]">
                  User
                </option>
                <option value="admin" className="bg-[#0d131a]">
                  Admin
                </option>
                <option value="super_admin" className="bg-[#0d131a]">
                  Super Admin
                </option>
              </FormField>
              <FormField
                field={
                  adminRegistrationConstants.find(
                    (field) => field.fieldName === "status",
                  )!
                }
                register={register}
                error={errors.status?.message}
              >
                <option value="active" className="bg-[#0d131a]">
                  Active
                </option>
                <option value="suspended" className="bg-[#0d131a]">
                  Suspended
                </option>
              </FormField>
            </div>
          </section>

          {/* Notice */}
          <div className="rounded-xl border border-[#f0b90b]/10 bg-[#f0b90b]/[0.03] px-4 py-3">
            <p className="text-xs leading-5 text-zinc-500">
              The user will receive a new authentication account and a wallet.
              The wallet starts with a zero balance.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0b90b] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f5c52c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.025);
          padding: 0 14px;
          color: white;
          font-size: 14px;
          outline: none;
          transition:
            border-color 150ms ease,
            background 150ms ease;
        }

        .input::placeholder {
          color: rgb(82 82 91);
        }

        .input:focus {
          border-color: rgba(240, 185, 11, 0.4);
          background: rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </div>
  );
}
