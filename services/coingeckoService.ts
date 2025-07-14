
import type { Coin, PriceData } from '../types';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

export const searchCoins = async (query: string): Promise<Coin[]> => {
    if (!query) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`, { cache: 'no-cache' });
        if (!response.ok) {
            console.error('CoinGecko API search error:', response.statusText);
            throw new Error('Failed to search for assets.');
        }
        const data = await response.json();
        return data.coins || [];
    } catch (error) {
        console.error('Network error during coin search:', error);
        throw new Error('Failed to search for assets due to a network issue.');
    }
};

export const fetchPrice = async (coinId: string): Promise<number | null> => {
    if (!coinId) return null;
     try {
        const response = await fetch(`${API_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`, { cache: 'no-cache' });
        if (!response.ok) {
            console.error('CoinGecko API price fetch error:', response.statusText);
            throw new Error('Failed to fetch price data.');
        }
        const data: PriceData = await response.json();
        return data[coinId]?.usd ?? null;
    } catch (error) {
        console.error('Network error during price fetch:', error);
        throw new Error('Failed to fetch price due to a network issue.');
    }
};
