// services/depositInstructions.service.ts
import { supabase } from "@/libs/supabase/browser";

export type DepositInstructions = {
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  cryptoAddresses: {
    BTC: string;
    ETH: string;
    USDT: string;
  };
};

const KEYS = [
  "deposit_bank_name",
  "deposit_bank_account_name",
  "deposit_bank_account_number",
  "deposit_crypto_btc_address",
  "deposit_crypto_eth_address",
  "deposit_crypto_usdt_trc20_address",
] as const;

const depositInstructionsService = {
  async fetch() {
    const { data, error } = await supabase
      .from("system_settings")
      .select("setting_key, value")
      .in("setting_key", KEYS);

    if (error || !data) return { instructions: null, error };

    const byKey = Object.fromEntries(
      data.map((row) => [row.setting_key, row.value as string]),
    );

    const instructions: DepositInstructions = {
      bankName: byKey.deposit_bank_name ?? "",
      bankAccountName: byKey.deposit_bank_account_name ?? "",
      bankAccountNumber: byKey.deposit_bank_account_number ?? "",
      cryptoAddresses: {
        BTC: byKey.deposit_crypto_btc_address ?? "",
        ETH: byKey.deposit_crypto_eth_address ?? "",
        USDT: byKey.deposit_crypto_usdt_trc20_address ?? "",
      },
    };

    return { instructions, error: null };
  },
};

export default depositInstructionsService;
