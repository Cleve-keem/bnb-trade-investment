import { supabase } from "@/libs/supabase/browser";

export type PortfolioRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

export type PortfolioPoint = {
  day: string;
  total_value: number;
};

const portfolioService = {
  async fetchPortfolioHistory(userId: string, range: PortfolioRange) {
    const { data, error } = await supabase.rpc("get_portfolio_history", {
      p_user_id: userId,
      p_range: range,
    });

    return { history: (data ?? []) as PortfolioPoint[], error };
  },
};

export default portfolioService;
