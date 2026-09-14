"use client";

import { Eye, EyeOff, LucideIcon } from "lucide-react";
import React from "react";

interface FieldProps {
  field: {
    id: number | string;
    name: string;
    fieldName: string;
    type: string;
    icon: LucideIcon | null;
    placeholder?: string;
  };
  register?: any;
  error?: string;
  children?: React.ReactNode;
}

export default function FormField({
  field,
  register,
  error,
  children,
}: FieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  if (field.fieldName === "nameGroup") {
    return (
      <div className="mb-4 flex w-full flex-col">
        <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Full Legal Name
        </label>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input
            type="text"
            className={`w-full rounded-md border bg-[#121212] px-3 py-2 text-sm outline-none transition-all ${
              error
                ? "border-red-500"
                : "border-gray-800 focus:border-[#dabc17]"
            }`}
            {...register("firstname")}
            placeholder="First name"
          />

          <input
            type="text"
            className={`w-full rounded-md border bg-[#121212] px-3 py-2 text-sm outline-none transition-all ${
              error
                ? "border-red-500"
                : "border-gray-800 focus:border-[#dabc17]"
            }`}
            {...register("middlename")}
            placeholder="Middle name (Optional)"
          />

          <input
            type="text"
            className={`w-full rounded-md border bg-[#121212] px-3 py-2 text-sm outline-none transition-all ${
              error
                ? "border-red-500"
                : "border-gray-800 focus:border-[#dabc17]"
            }`}
            {...register("lastname")}
            placeholder="Last name"
          />
        </div>

        {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
      </div>
    );
  }

  const isPasswordType = field.type === "password";
  const isSelectType = field.type === "select";

  return (
    <div className="mb-4 flex w-full flex-col">
      <label
        htmlFor={field.fieldName}
        className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400"
      >
        {field.name}

        {field.name && <span className="ml-1 text-[#dabc17]">*</span>}
      </label>

      <div className="relative flex w-full items-center">
        {field.icon && (
          <div className="token-icon pointer-events-none absolute left-3 z-10 text-gray-500">
            <field.icon size={18} />
          </div>
        )}

        {isSelectType ? (
          <select
            id={field.fieldName}
            {...register(field.fieldName)}
            className={`w-full appearance-none rounded-md border bg-[#121212] px-3 py-2.5 text-sm text-white outline-none transition-all ${
              error
                ? "border-red-500"
                : "border-gray-800 focus:border-[#dabc17]"
            }`}
          >
            {children}
          </select>
        ) : (
          <input
            type={isPasswordType && showPassword ? "text" : field.type}
            id={field.fieldName}
            {...register(field.fieldName)}
            className={`w-full rounded-md border py-2.5 pr-10 text-sm outline-none transition-all ${
              error
                ? "border-red-500"
                : "border-gray-800 focus:border-[#dabc17]"
            } ${field.icon ? "pl-10" : "px-3"}`}
            placeholder={
              field.placeholder ?? `Enter your ${field.name.toLowerCase()}`
            }
          />
        )}

        {isPasswordType && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 text-gray-500 transition-colors hover:text-white"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// "use client";

// import { Eye, EyeOff, LucideIcon } from "lucide-react";
// import React from "react";

// interface FieldProps {
//   field: {
//     id: number | string;
//     name: string;
//     fieldName: string;
//     type: string;
//     icon: LucideIcon | null;
//     placeholder?: string;
//     // label?: string;
//   };
//   register?: any;
//   error?: string;
// }

// export default function FormField({ field, register, error }: FieldProps) {
//   const [showPassword, setShowPassword] = React.useState(false);
//   if (field.fieldName === "nameGroup") {
//     return (
//       <div className="flex flex-col mb-4 w-full">
//         <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
//           Full Legal Name
//         </label>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//           <input
//             type="text"
//             className={`w-full bg-[#121212] border border-gray-800 focus:border-[#dabc17] rounded-md px-3 py-2 text-sm outline-none transition-all ${error ? "border-red-500" : "border-gray-800 focus:border-[#dabc17]"}`}
//             {...register(`firstname`, {
//               required: { message: "first name is required!" },
//             })}
//             placeholder="First name"
//           />
//           <input
//             type="text"
//             className={`w-full bg-[#121212] border border-gray-800 focus:border-[#dabc17] rounded-md px-3 py-2 text-sm outline-none transition-all ${error ? "border-red-500" : "border-gray-800 focus:border-[#dabc17]"}`}
//             {...register("middlename")}
//             placeholder="Middle name (Optional)"
//           />
//           <input
//             type="text"
//             className={`w-full bg-[#121212] border border-gray-800 focus:border-[#dabc17] rounded-md px-3 py-2 text-sm outline-none transition-all ${error ? "border-red-500" : "border-gray-800 focus:border-[#dabc17]"}`}
//             {...register("lastname")}
//             placeholder="Last name"
//           />
//         </div>
//         {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
//       </div>
//     );
//   }

//   const isPasswordType = field.type === "password";

//   return (
//     <div className="flex flex-col mb-4 w-full">
//       <label
//         htmlFor={field.fieldName}
//         className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400"
//       >
//         {field.name}
//       </label>

//       {/* Relative structural shell preserves icon boundaries */}
//       <div className="relative flex items-center w-full">
//         {field.icon && (
//           <div className="absolute left-3 token-icon pointer-events-none z-10 text-gray-500">
//             <field.icon size={18} />
//           </div>
//         )}

//         <input
//           type={isPasswordType && showPassword ? "text" : field.type}
//           id={field.fieldName}
//           // name={field.fieldName}
//           {...register(`${field.fieldName}`)}
//           className={`w-full bg-[#121212] border ${error ? "border-red-500" : "border-gray-800 focus:border-[#dabc17]"} rounded-md py-2.5 pr-10 text-sm outline-none transition-all ${field.icon ? "pl-10" : "px-3"}`}
//           placeholder={
//             field.placeholder
//               ? field.placeholder
//               : `Enter your ${field.name.toLowerCase()}`
//           }
//         />

//         {isPasswordType && (
//           <button
//             type="button"
//             tabIndex={-1}
//             className="absolute right-3 hover:text-white text-gray-500 transition-colors"
//             onClick={() => setShowPassword((prev) => !prev)}
//           >
//             {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
//           </button>
//         )}
//       </div>
//       {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
//     </div>
//   );
// }
