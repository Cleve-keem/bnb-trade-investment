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

const depositInstructionsService = {
  async fetch() {
    const { data, error } = await supabase.rpc("get_deposit_instructions");

    if (error || !data) return { instructions: null, error };

    const byKey = Object.fromEntries(
      (data as { setting_key: string; value: string | null }[]).map((row) => [
        row.setting_key,
        row.value ?? "",
      ]),
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
