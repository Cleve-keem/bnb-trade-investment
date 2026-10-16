"use client";

import { useAuthQuerySync } from "@/hooks/useAuthQuerySync";
import { supabase } from "@/libs/supabase/browser";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";

const isAuthError = (error: unknown) =>
  /jwt expired|invalid jwt|no authenticated user|refresh token/i.test(
    error instanceof Error ? error.message : String(error),
  );

const endSession = () => {
  supabase.auth.signOut({ scope: "local" });
};

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (isAuthError(error)) endSession();
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (isAuthError(error)) endSession();
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
    </QueryClientProvider>
  );
}

function AuthSync() {
  useAuthQuerySync();
  return null;
}

// "use client";

// import { useAuthQuerySync } from "@/hooks/useAuthQuerySync";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useState } from "react";

// export default function QueryProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [queryClient] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 1000 * 60 * 5,
//             refetchOnWindowFocus: true,
//           },
//         },
//       }),
//   );

//   return (
//     <QueryClientProvider client={queryClient}>
//       <AuthSync />
//       {children}
//     </QueryClientProvider>
//   );
// }

// function AuthSync() {
//   useAuthQuerySync();
//   return null;
// }
