"use client"

import { supabase } from "@/libs/supabase/browser";
import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";
import { useState } from "react";
import portfolioService, { PortfolioRange } from "@/services/portfolio.service";

export function usePortfolio() {
  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["portfolio-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .limit(1);

      if (error) {
        console.error(
          "Supabase Ledger Portfolio Fetch Exception Error:",
          error,
        );
        throw error;
      }

      const activeProfileRecord = data?.[0];

      return (
        activeProfileRecord || {
          total_balance: 0,
          active_yield_rate: 0,
          pending_allocations: 0,
        }
      );
    },
    refetchInterval: 10000,
  });

  return { portfolio, loadingPortfolio };
} 

export function usePortfolioChart() {
  const { userId } = useAuthSession();
  const [range, setRange] = useState<PortfolioRange>("1W");

  const {
    data: history = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["portfolio", "history", userId, range],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const { history, error } = await portfolioService.fetchPortfolioHistory(
        userId,
        range,
      );
      if (error) throw new Error(error.message);
      return history;
    },
    staleTime: 60_000,
  });

  return {
    history,
    isPending,
    isError,
    range,
    setRange,
  };
}

export function usePortfolioSummary() {
  const { userId } = useAuthSession();

  const { data: summary } = useQuery({
    queryKey: ["portfolio", "summary", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { summary, error } = await portfolioService.fetchSummary(userId!);
      if (error) throw new Error(error.message);
      return summary;
    },
    staleTime: 30_000,
  });

  const {
    data: holdings = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["portfolio", "holdings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { holdings, error } = await portfolioService.fetchHoldings(userId!);
      if (error) throw new Error(error.message);
      return holdings;
    },
    staleTime: 30_000,
  });

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return {
    summary,
    holdings,
    isPending,
    isError,
    fmt,
  };
}
