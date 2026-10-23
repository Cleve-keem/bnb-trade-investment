"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/libs/supabase/browser";
import { useAuthSession } from "./useAuthSession";
import settingsService from "@/services/settings.service";
import { AdminSettings } from "@/types/settings";

export type UserSettings = {
  currency: "USD" | "EUR";
  theme: "dark" | "system";
  notify_account: boolean;
  notify_trading: boolean;
  notify_market: boolean;
};

export function useSettings() {
  const { userId } = useAuthSession();
  const queryClient = useQueryClient();
  const key = ["user", "settings", userId];

  const query = useQuery({
    queryKey: key,
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_settings");
      if (error) throw new Error(error.message);
      const row = Array.isArray(data) ? data[0] : data;
      return row as UserSettings;
    },
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: async (next: UserSettings) => {
      const { error } = await supabase.rpc("update_my_settings", {
        p_currency: next.currency,
        p_theme: next.theme,
        p_notify_account: next.notify_account,
        p_notify_trading: next.notify_trading,
        p_notify_market: next.notify_market,
      });
      if (error) throw new Error(error.message);
    },
    // Change the screen immediately, undo if the save fails
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UserSettings>(key);
      queryClient.setQueryData(key, next);
      return { previous };
    },
    onError: (err, _next, context) => {
      queryClient.setQueryData(key, context?.previous);
      toast.error(err.message || "Couldn't save your settings.");
    },
  });

  function update(patch: Partial<UserSettings>) {
    if (!query.data) return;
    mutation.mutate({ ...query.data, ...patch });
  }

  return {
    settings: query.data,
    isPending: query.isPending,
    isError: query.isError,
    update,
  };
}

const KEY = ["admin", "settings"];

export function useAdminSettings() {
  const { userId } = useAuthSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...KEY, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { settings, meta, error } =
        await settingsService.fetchAdminSettings();
      if (error) throw new Error(error.message);
      return { settings, meta };
    },
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (changes: Partial<AdminSettings>) => {
      const { count, error } = await settingsService.saveSettings(changes);
      if (error) throw new Error(error.message);
      return count;
    },
    // Returning the promise makes the save wait until fresh values are loaded
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: KEY }),
        queryClient.invalidateQueries({ queryKey: ["public-settings"] }),
        queryClient.invalidateQueries({
          queryKey: ["deposit", "instructions"],
        }),
        queryClient.invalidateQueries({ queryKey: ["admin", "audit"] }),
      ]),
  });

  return {
    settings: query.data?.settings,
    meta: query.data?.meta,
    isPending: query.isPending,
    isError: query.isError,
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const { settings, error } = await settingsService.fetchPublicSettings();
      if (error) throw new Error(error.message);
      return settings;
    },
    staleTime: 5 * 60_000,
  });
}