import { supabase } from "@/libs/supabase/browser";

export type PortfolioRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

export type PortfolioPoint = { day: string; total_value: number };

export type PortfolioSummary = {
  total_value: number;
  cash_balance: number;
  available_balance: number;
  invested_value: number;
  total_invested: number;
  total_return: number;
  currency: string;
};

export type PortfolioHolding = {
  investment_id: string;
  plan_name: string;
  amount: number;
  current_value: number;
  change_percentage: number;
  allocation_percentage: number;
  status: string;
  currency: string;
};

const num = (value: unknown) => Number(value ?? 0);

const portfolioService = {
  async fetchPortfolioHistory(userId: string, range: PortfolioRange) {
    const { data, error } = await supabase.rpc("get_portfolio_history", {
      p_user_id: userId,
      p_range: range,
    });
    const history: PortfolioPoint[] = (data ?? []).map((r: any) => ({
      day: r.day,
      total_value: num(r.total_value),
    }));
    return { history, error };
  },

  async fetchSummary(userId: string) {
    const { data, error } = await supabase.rpc("get_portfolio_summary", {
      p_user_id: userId,
    });
    const row = Array.isArray(data) ? data[0] : data;
    const summary: PortfolioSummary | null = row
      ? {
          total_value: num(row.total_value),
          cash_balance: num(row.cash_balance),
          available_balance: num(row.available_balance),
          invested_value: num(row.invested_value),
          total_invested: num(row.total_invested),
          total_return: num(row.total_return),
          currency: row.currency ?? "USD",
        }
      : null;
    return { summary, error };
  },

  async fetchHoldings(userId: string) {
    const { data, error } = await supabase.rpc("get_portfolio_holdings", {
      p_user_id: userId,
    });
    const holdings: PortfolioHolding[] = (data ?? []).map((r: any) => ({
      investment_id: r.investment_id,
      plan_name: r.plan_name,
      amount: num(r.amount),
      current_value: num(r.current_value),
      change_percentage: num(r.change_percentage),
      allocation_percentage: num(r.allocation_percentage),
      status: r.status,
      currency: r.currency ?? "USD",
    }));
    return { holdings, error };
  },
};

export default portfolioService;

// import { supabase } from "@/libs/supabase/browser";

// export type PortfolioRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

// export type PortfolioPoint = {
//   day: string;
//   total_value: number;
// };

// export type PortfolioSummary = {
//   total_value: number;
//   cash_balance: number;
//   invested_value: number;
//   total_invested: number;
//   total_return: number;
// };

// export type PortfolioHolding = {
//   investment_id: string;
//   plan_name: string;
//   amount: number;
//   current_value: number;
//   change_percentage: number;
//   allocation_percentage: number;
//   status: string;
// };

// const portfolioService = {
//   async fetchPortfolioHistory(userId: string, range: PortfolioRange) {
//     const { data, error } = await supabase.rpc("get_portfolio_history", {
//       p_user_id: userId,
//       p_range: range,
//     });

//     return { history: (data ?? []) as PortfolioPoint[], error };
//   },

//   async fetchSummary(userId: string) {
//     const { data, error } = await supabase.rpc("get_portfolio_summary", {
//       p_user_id: userId,
//     });
//     return { summary: (data?.[0] ?? null) as PortfolioSummary | null, error };
//   },

//   async fetchHoldings(userId: string) {
//     const { data, error } = await supabase.rpc("get_portfolio_holdings", {
//       p_user_id: userId,
//     });
//     return { holdings: (data ?? []) as PortfolioHolding[], error };
//   },
// };

// export default portfolioService;
