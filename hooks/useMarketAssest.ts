"use client";

import { MarketAsset } from "@/app/(dashboard)/markets/types/market";
import { useQuery } from "@tanstack/react-query";

export default function useMarketAssets() {
  const {
    data: assets = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["market", "assets"],
    queryFn: async () => {
      const res = await fetch("/api/v1/market/assets");
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to load markets");
      return body.assets as MarketAsset[];
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  return { assets, isPending, isError, error };
}
