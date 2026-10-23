// export const MIN_DEPOSIT = 10;
// export const MAX_DEPOSIT = 1_000_000;

// export const BTC_NETWORK_LABEL = "Bitcoin Network (BTC)";
// export const MIN_CONFIRMATIONS = 2;
// export const DEPOSIT_ADDRESS =
//   process.env.NEXT_PUBLIC_BTC_DEPOSIT_ADDRESS ?? "";

export type CryptoCurrency = "BTC" | "ETH" | "USDT";

// Keep these two the same as the numbers in request_deposit() in the database
export const MIN_DEPOSIT = 10;
export const MAX_DEPOSIT = 1_000_000;

export const CRYPTO_OPTIONS: {
  value: CryptoCurrency;
  name: string;
  network: string;
  color: string;
  symbol: string;
}[] = [
  {
    value: "BTC",
    name: "Bitcoin",
    network: "Bitcoin Network",
    color: "#F7931A",
    symbol: "₿",
  },
  {
    value: "ETH",
    name: "Ethereum",
    network: "Ethereum Network",
    color: "#8B9EFF",
    symbol: "Ξ",
  },
  {
    value: "USDT",
    name: "Tether",
    network: "TRON Network (TRC-20)",
    color: "#26A17B",
    symbol: "₮",
  },
];