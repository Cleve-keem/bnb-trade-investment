"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase/browser";
import { isAdminPath, isUserPath } from "@/libs/auth/routes";
import { consumeManualLogout } from "@/libs/auth/session-flags";

export function useAuthQuerySync() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const pathRef = useRef(pathname);
  const lastUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newId = session?.user?.id ?? null;
      const oldId = lastUserId.current;
      lastUserId.current = newId;

      // A different person (or nobody) is now signed in: drop the old data
      if (oldId !== undefined && oldId !== newId) {
        queryClient.clear();
      }

      if (event === "SIGNED_OUT") {
        const manual = consumeManualLogout();
        const path = pathRef.current;

        if (isAdminPath(path) || isUserPath(path)) {
          router.replace(
            manual
              ? "/login"
              : `/login?redirect=${encodeURIComponent(path)}&reason=expired`,
          );
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient, router]);
}

// "use client";

// import { useEffect } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/libs/supabase/browser";

// export function useAuthQuerySync() {
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === "SIGNED_OUT") {
//         queryClient.removeQueries({
//           queryKey: ["user"],
//         });

//         queryClient.removeQueries({
//           queryKey: ["user-dashboard"],
//         });

//         return;
//       }

//       if (event === "SIGNED_IN") {
//         queryClient.removeQueries({
//           queryKey: ["user"],
//         });

//         queryClient.removeQueries({
//           queryKey: ["user-dashboard"],
//         });

//         return;
//       }

//       if (event === "USER_UPDATED") {
//         queryClient.invalidateQueries({
//           queryKey: ["user"],
//         });
//       }
//     });

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [queryClient]);
// }
