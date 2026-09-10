export type MarketAsset = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  icon: string;
};

export type Transaction = {
  id: string;
  type: "Deposit" | "Withdrawal" | "Trade" | "Investment";
  description: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  date: string;
};

export const portfolioData = [
  { date: "Aug 01", value: 258000 },
  { date: "Aug 04", value: 263000 },  
  { date: "Aug 07", value: 267500 },
  { date: "Aug 10", value: 272000 },
  { date: "Aug 13", value: 268000 },
  { date: "Aug 16", value: 279000 },
  { date: "Aug 19", value: 286000 },
  { date: "Aug 22", value: 291000 },
  { date: "Aug 25", value: 296500 },
  { date: "Aug 28", value: 298000 },
  { date: "Aug 31", value: 300000 },
];

export const marketAssets: MarketAsset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 81200,
    change: 5.00,
    volume: "$625.56M",
    icon: "₿",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2520.84,
    change: 4.83,
    volume: "$14.5M",
    icon: "Ξ",
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 721.74,
    change: 5.03,
    volume: "$3.05M",
    icon: "B",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 105.61,
    change: 5.77,
    volume: "$64.70M",
    icon: "S",
  },
  // {
  //   symbol: "XRP",
  //   name: "XRP",
  //   price: 1.35,
  //   change: -0.58,
  //   volume: "$2.5M",
  //   icon: "X",
  // },
  // {
  //   symbol: "ADA",
  //   name: "Cardano",
  //   price: 0.19,
  //   change: -0.31,
  //   volume: "$406M",
  //   icon: "A",
  // },
  // {
  //   symbol: "DOGE",
  //   name: "Dogecoin",
  //   price: 0.08,
  //   change: -1.43,
  //   volume: "$680M",
  //   icon: "D",
  // },
  // {
  //   symbol: "AVAX",
  //   name: "Avalanche",
  //   price: 42.81,
  //   change: -1.24,
  //   volume: "$185M",
  //   icon: "A",
  // },
];

export const holdings = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: "1.1612 BTC",
    value: 126000,
    allocation: 42,
    change: 8.21,
  },
  // {
  //   symbol: "ETH",
  //   name: "Ethereum",
  //   amount: "17.81 ETH",
  //   value: 75000,
  //   allocation: 25,
  //   change: 5.42,
  // },
  {
    symbol: "BNB",
    name: "BNB",
    amount: "64.28 BNB",
    value: 54000,
    allocation: 18,
    change: 4.92,
  },
  // {
  //   symbol: "SOL",
  //   name: "Solana",
  //   amount: "151.2 SOL",
  //   value: 30000,
  //   allocation: 10,
  //   change: 9.32,
  // },
  // {
  //   symbol: "USDT",
  //   name: "Tether",
  //   amount: "15000 USDT",
  //   value: 15000,
  //   allocation: 5,
  //   change: 0.02,
  // },
];

export const transactions: Transaction[] = [
  {
    id: "TXN-82950",
    type: "Deposit",
    description: "USD wallet deposit",
    amount: 124,
    status: "Completed",
    date: "Jan 28, 2026",
  },

  {
    id: "TXN-82949",
    type: "Deposit",
    description: "USD wallet deposit",
    amount: 291,
    status: "Completed",
    date: "Feb 21, 2026",
  },

  {
    id: "TXN-82948",
    type: "Withdrawal",
    description: "Investment",
    amount: -325,
    status: "Completed",
    date: "Mar 18, 2026",
  },

  {
    id: "TXN-82947",
    type: "Deposit",
    description: "Investment refund",
    amount: 325,
    status: "Pending",
    date: "Apr 18, 2026",
  },

  {
    id: "TXN-82946",
    type: "Investment",
    description: "Investing In Stock",
    amount: -1785,
    status: "Completed",
    date: "Jul 16, 2026",
  },
];

export const aiSignals = [
  {
    symbol: "BTC/USD",
    signal: "BUY",
    confidence: 87,
    trend: "Bullish",
    momentum: "Strong",
  },
  {
    symbol: "ETH/USD",
    signal: "BUY",
    confidence: 76,
    trend: "Bullish",
    momentum: "Moderate",
  },
  {
    symbol: "BNB/USD",
    signal: "HOLD",
    confidence: 62,
    trend: "Neutral",
    momentum: "Moderate",
  },
  {
    symbol: "XRP/USD",
    signal: "SELL",
    confidence: 71,
    trend: "Bearish",
    momentum: "Weak",
  },
];

export const investments = [
  {
    name: "BNB Growth Plan",
    invested: 180,
    currentValue: 0,
    return: 780,
    progress: 100,
    maturity: "365 days",
    status: "Completed",
  },

  {
    name: "BNB DCA Plan",
    invested: 196,
    currentValue: 0,
    return: 928,
    progress: 100,
    maturity: "365 days",
    status: "Completed",
  },

  {
    name: "Digital Assets Plan",
    invested: 112,
    currentValue: 0,
    return: 459,
    progress: 10,
    maturity: "65 days",
    status: "Active",
  },

  {
    name: "BNB Growth Plan Premium",
    invested: 300,
    currentValue: 300,
    return: 0,
    progress: 42,
    maturity: "80 days",
    status: "Active",
  },
];

// export const investments = [
//   {
//     name: "BNB Growth Plan",
//     invested: 18690,
//     currentValue: 96960,
//     return: 78060,
//     progress: 100,
//     maturity: "365 days",
//     status: "Completed",
//   },
//   {
//     name: "BNB DCA Plan",
//     invested: 196294,
//     currentValue: 289108,
//     return: 92814,
//     progress: 100,
//     maturity: "365 days",
//     status: "Completed",
//   },
//   {
//     name: "Digital Assets Plan",
//     invested: 112048,
//     currentValue: 158008,
//     return: 45960,
//     progress: 100,
//     maturity: "365 days",
//     status: "Completed",
//   },
// ];

export type NotificationType =
  | "investment"
  | "deposit"
  | "withdrawal"
  | "security"
  | "system";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  read: boolean;
}

export const notifications: Notification[] = [
  // {
  //   id: "1",
  //   title: "Trade Executed",
  //   message: "Your BTC/USD market order has been successfully executed.",
  //   type: "investment",
  //   time: "2 minutes ago",
  //   read: false,
  // },
  // {
  //   id: "2",
  //   title: "Deposit Confirmed",
  //   message: "Your $5,000 USDT deposit has been successfully confirmed.",
  //   type: "deposit",
  //   time: "1 hour ago",
  //   read: false,
  // },
  // {
  //   id: "3",
  //   title: "AI Trading Signal",
  //   message: "A new BTC/USD bullish signal is available on your dashboard.",
  //   type: "investment",
  //   time: "3 hours ago",
  //   read: false,
  // },
  {
    id: "4",
    title: "Security Alert",
    message: "A new login was detected on your BNB account.",
    type: "security",
    time: "Today",
    read: true,
  },
  {
    id: "5",
    title: "System Update",
    message:
      "BNB trading services have been updated with improved performance.",
    type: "system",
    time: "2hrs ago",
    read: true,
  },
];

export const faqs = [
  {
    question: "How do I deposit funds?",
    answer:
      "Open the Deposit section from your dashboard, choose your preferred asset and network, enter the amount, and follow the instructions displayed on screen.",
  },
  {
    question: "How do I withdraw my funds?",
    answer:
      "Open Withdraw, select the asset you want to withdraw, enter the destination wallet address and amount, review the transaction details carefully, then confirm the request.",
  },
  {
    question: "How long does a withdrawal take?",
    answer:
      "Withdrawal processing time depends on the selected network and the current transaction queue. You can monitor the status from your transaction history.",
  },
  {
    question: "Where can I see my trading history?",
    answer:
      "Your recent trades and account activity are available from the Transactions section of your BNB dashboard.",
  },
  // {
  //   question: "How do AI trading signals work?",
  //   answer:
  //     "AI signals are informational indicators generated from market data and technical patterns. They are not guarantees of future market performance.",
  // },
];