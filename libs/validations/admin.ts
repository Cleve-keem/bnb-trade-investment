import { z } from "zod";

export const adminRegisterSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters."),
    fullname: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    phoneNumber: z.string().min(7, "Please enter a valid phone number."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    role: z.enum(["user", "admin", "super_admin"]),
    status: z.enum(["active", "suspended"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type AdminRegisterSchemaInput = z.infer<typeof adminRegisterSchema>;
