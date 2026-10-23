import { MarketAsset } from "@/app/(dashboard)/markets/types/market";
import { NextResponse } from "next/server";

export const revalidate = 60;

const COINGECKO_IDS = [
  "bitcoin",
  "ethereum",
  "binancecoin",
  "solana",
  "ripple",
] as const;

export async function GET() {
  try {
    const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("ids", COINGECKO_IDS.join(","));
    url.searchParams.set("order", "market_cap_desc");
    url.searchParams.set("price_change_percentage", "24h");

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`CoinGecko responded ${res.status}`);
    }

    const raw = (await res.json()) as Array<{
      symbol: string;
      name: string;
      image: string;
      current_price: number;
      price_change_percentage_24h: number | null;
      total_volume: number;
    }>;

    const assets: MarketAsset[] = raw.map((c) => ({
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      iconUrl: c.image,
      price: c.current_price,
      change: c.price_change_percentage_24h ?? 0,
      volume: c.total_volume,
    }));

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("❌ MARKET_ASSETS_FETCH_ERROR:", error);
    return NextResponse.json(
      { error: "Unable to fetch market data." },
      { status: 502 },
    );
  }
}
