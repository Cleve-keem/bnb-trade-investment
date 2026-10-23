import { DEFAULT_SETTINGS, SETTING_KEYS } from "@/constants/admin/settings";
import { supabase } from "@/libs/supabase/browser";
import type { AdminSettings, SettingsMeta } from "@/types/settings";

type Row = {
  setting_key: string;
  value: unknown;
  updated_at: string | null;
  updated_by_name: string | null;
};

const settingsService = {
  async fetchAdminSettings() {
    const { data, error } = await supabase.rpc("admin_get_settings");
    const rows = (data ?? []) as Row[];
    const byKey = Object.fromEntries(rows.map((r) => [r.setting_key, r.value]));

    const str = (field: keyof AdminSettings): string => {
      const v = byKey[SETTING_KEYS[field]];
      return typeof v === "string" ? v : (DEFAULT_SETTINGS[field] as string);
    };

    const flag = (field: keyof AdminSettings): boolean => {
      const v = byKey[SETTING_KEYS[field]];
      if (typeof v === "boolean") return v;
      if (v === "true") return true;
      if (v === "false") return false;
      return DEFAULT_SETTINGS[field] as boolean;
    };

    const settings: AdminSettings = {
      platformName: str("platformName"),
      supportEmail: str("supportEmail"),
      supportPhone: str("supportPhone"),
      depositBtc: str("depositBtc"),
      depositEth: str("depositEth"),
      depositUsdt: str("depositUsdt"),
      allowWithdrawals: flag("allowWithdrawals"),
      allowInvestments: flag("allowInvestments"),
      allowRegistrations: flag("allowRegistrations"),
      maintenanceMode: flag("maintenanceMode"),
    };

    // Who changed something last (seeded rows have nobody)
    const lastEdit = rows
      .filter((r) => r.updated_by_name)
      .sort((a, b) =>
        (b.updated_at ?? "").localeCompare(a.updated_at ?? ""),
      )[0];

    const meta: SettingsMeta = {
      updatedAt: lastEdit?.updated_at ?? null,
      updatedBy: lastEdit?.updated_by_name ?? null,
    };

    return { settings, meta, error };
  },

  async saveSettings(changes: Partial<AdminSettings>) {
    const payload = Object.fromEntries(
      Object.entries(changes).map(([field, value]) => [
        SETTING_KEYS[field as keyof AdminSettings],
        value,
      ]),
    );

    const { data, error } = await supabase.rpc("admin_update_settings", {
      p_changes: payload,
    });
    return { count: Number(data ?? 0), error };
  },

  // Settings anyone may see (works when logged out too)
  async fetchPublicSettings() {
    const { data, error } = await supabase.rpc("get_public_settings");
    const map: Record<string, unknown> = Object.fromEntries(
      ((data ?? []) as { setting_key: string; value: unknown }[]).map((r) => [
        r.setting_key,
        r.value,
      ]),
    );
    return { settings: map, error };
  },
};

export default settingsService;

export function getSettingsErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  const readable = [
    /does not look like/,
    /^Platform name/,
    /^Support (email|phone)/,
    /^Nothing to save/,
  ];
  if (readable.some((re) => re.test(message))) return message;

  if (/caller is not an admin/.test(message)) {
    return "You need to be an admin to change settings.";
  }
  return "We couldn't save your settings. Please try again.";
}