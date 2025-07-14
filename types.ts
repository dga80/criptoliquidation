
export interface Coin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

export interface PriceData {
  [coinId: string]: {
    usd: number;
  };
}

export interface LiquidationResult {
    price: number;
    mmr: number;
}