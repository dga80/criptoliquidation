
import React from 'react';
import type { LiquidationResult } from '../types';

interface ResultDisplayProps {
    result: LiquidationResult | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
    if (!result || !isFinite(result.price) || result.price <= 0) return null;

    return (
        <div className="p-4 mt-8 text-center bg-gray-900 border border-dashed rounded-lg border-gray-600">
            <p className="text-sm text-gray-400">Estimated Liquidation Price</p>
            <p className="text-3xl font-bold text-white">
                ${result.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </p>
            <p className="mt-1 text-xs text-gray-500">
                Maintenance Rate Used: {(result.mmr * 100).toFixed(2)}%
            </p>
        </div>
    );
};

export default ResultDisplay;