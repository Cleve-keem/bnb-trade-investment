import type { AdminSettings } from "@/types/settings";

export const SETTING_KEYS: Record<keyof AdminSettings, string> = {
  platformName: "platform_name",
  supportEmail: "support_email",
  supportPhone: "support_phone",
  depositBtc: "deposit_crypto_btc_address",
  depositEth: "deposit_crypto_eth_address",
  depositUsdt: "deposit_crypto_usdt_trc20_address",
  allowWithdrawals: "allow_withdrawals",
  allowInvestments: "allow_investments",
  allowRegistrations: "allow_registrations",
  maintenanceMode: "maintenance_mode",
};

export const DEFAULT_SETTINGS: AdminSettings = {
  platformName: "BNB",
  supportEmail: "",
  supportPhone: "",
  depositBtc: "",
  depositEth: "",
  depositUsdt: "",
  allowWithdrawals: true,
  allowInvestments: true,
  allowRegistrations: true,
  maintenanceMode: false,
};

export const COIN_FIELDS = [
  {
    field: "depositBtc",
    coin: "BTC",
    label: "Bitcoin (BTC) address",
    placeholder: "bc1q…",
  },
  {
    field: "depositEth",
    coin: "ETH",
    label: "Ethereum (ETH) address",
    placeholder: "0x…",
  },
  {
    field: "depositUsdt",
    coin: "USDT",
    label: "Tether (USDT) address, TRON network (TRC-20)",
    placeholder: "T…",
  },
] as const;
