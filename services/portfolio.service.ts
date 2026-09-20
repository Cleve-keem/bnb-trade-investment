import { supabase } from "@/libs/supabase/browser";

export type PortfolioRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

export type PortfolioPoint = {
  day: string;
  total_value: number;
};

export type PortfolioSummary = {
  total_value: number;
  cash_balance: number;
  invested_value: number;
  total_invested: number;
  total_return: number;
};

export type PortfolioHolding = {
  investment_id: string;
  plan_name: string;
  amount: number;
  current_value: number;
  change_percentage: number;
  allocation_percentage: number;
  status: string;
};

const portfolioService = {
  async fetchPortfolioHistory(userId: string, range: PortfolioRange) {
    const { data, error } = await supabase.rpc("get_portfolio_history", {
      p_user_id: userId,
      p_range: range,
    });

    return { history: (data ?? []) as PortfolioPoint[], error };
  },

  async fetchSummary(userId: string) {
    const { data, error } = await supabase.rpc("get_portfolio_summary", {
      p_user_id: userId,
    });
    return { summary: (data?.[0] ?? null) as PortfolioSummary | null, error };
  },
  
  async fetchHoldings(userId: string) {
    const { data, error } = await supabase.rpc("get_portfolio_holdings", {
      p_user_id: userId,
    });
    return { holdings: (data ?? []) as PortfolioHolding[], error };
  },
};

export default portfolioService;
