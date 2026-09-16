"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase/browser";

export function useAuthQuerySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        queryClient.removeQueries({
          queryKey: ["user"],
        });

        queryClient.removeQueries({
          queryKey: ["user-dashboard"],
        });

        return;
      }

      if (event === "SIGNED_IN") {
        queryClient.removeQueries({
          queryKey: ["user"],
        });

        queryClient.removeQueries({
          queryKey: ["user-dashboard"],
        });

        return;
      }

      if (event === "USER_UPDATED") {
        queryClient.invalidateQueries({
          queryKey: ["user"],
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);
}

// "use client";

// import { useEffect } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/libs/supabase/browser";

// export function useAuthQuerySync() {
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     const { data: subscription } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         if (event === "SIGNED_OUT") {
//           queryClient.removeQueries({ queryKey: ["user"] });
//         } else {
//           queryClient.invalidateQueries({ queryKey: ["user"] });
//         }
//       },
//     );

//     return () => subscription.subscription.unsubscribe();
//   }, [queryClient]);
// }
