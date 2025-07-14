
export const BITGET_MMR_TIERS = [
    { threshold: 150000, rate: 0.004 },
    { threshold: 900000, rate: 0.005 },
    { threshold: 12000000, rate: 0.01 },
    { threshold: 38000000, rate: 0.015 },
    { threshold: 50000000, rate: 0.03 },
    { threshold: 100000000, rate: 0.05 },
];

export const MAX_MMR_RATE = 0.12;

export const getBitgetMMR = (positionValue: number): number => {
    for (const tier of BITGET_MMR_TIERS) {
        if (positionValue <= tier.threshold) {
            return tier.rate;
        }
    }
    return MAX_MMR_RATE;
};