import { LucideIcon } from "lucide-react";

export interface AdminRegistrationField {
  id: number;
  name: string;
  fieldName: string;
  type: string;
  icon: LucideIcon | null;
  placeholder?: string;
}

export const adminRegistrationConstants: AdminRegistrationField[] = [
  {
    id: 1,
    name: "Username",
    fieldName: "username",
    type: "text",
    icon: null,
    placeholder: "johndoe",
  },
  {
    id: 2,
    name: "Fullname",
    fieldName: "fullname",
    type: "text",
    icon: null,
    placeholder: "John Doe",
  },
  {
    id: 3,
    name: "Email Address",
    fieldName: "email",
    type: "email",
    icon: null,
    placeholder: "john@example.com",
  },
  {
    id: 4,
    name: "Phone Number",
    fieldName: "phoneNumber",
    type: "tel",
    icon: null,
    placeholder: "+234 800 000 0000",
  },
  {
    id: 5,
    name: "Password",
    fieldName: "password",
    type: "password",
    icon: null,
    placeholder: "Minimum 8 characters",
  },
  {
    id: 6,
    name: "Confirm Password",
    fieldName: "confirmPassword",
    type: "password",
    icon: null,
    placeholder: "Repeat password",
  },
  {
    id: 7,
    name: "Role",
    fieldName: "role",
    type: "select",
    icon: null,
  },
  {
    id: 8,
    name: "Status",
    fieldName: "status",
    type: "select",
    icon: null,
  },
];
