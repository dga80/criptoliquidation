import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getBitgetMMR } from './constants';
import { fetchPrice } from './services/coingeckoService';
import type { LiquidationResult } from './types';
import InputGroup from './components/InputGroup';
import ToggleSwitch from './components/ToggleSwitch';
import CoinSearch from './components/CoinSearch';
import ResultDisplay from './components/ResultDisplay';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
    const [isShort, setIsShort] = useState(false);
    const [entryPrice, setEntryPrice] = useState('');
    const [initialCapital, setInitialCapital] = useState('');
    const [leverage, setLeverage] = useState(10);
    const [additionalMargin, setAdditionalMargin] = useState('0');
    const [desiredLiqPrice, setDesiredLiqPrice] = useState('');
    
    const [selectedCoinId, setSelectedCoinId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    const handleCoinSelect = useCallback((coinId: string) => {
        setSelectedCoinId(coinId);
    }, []);

    useEffect(() => {
        if (!selectedCoinId) return;

        let isCancelled = false;
        // In a browser environment, setInterval returns a number, not NodeJS.Timeout.
        // The type annotation was removed to let TypeScript infer the correct type.
        const intervalId = setInterval(async () => {
            try {
                const price = await fetchPrice(selectedCoinId);
                if (!isCancelled && price !== null) {
                    setEntryPrice(price.toString());
                    clearError();
                }
            } catch (err) {
                 if (!isCancelled) {
                    const error = err as Error;
                    setError(error.message || 'Could not update price. Auto-refresh disabled.');
                    clearInterval(intervalId);
                }
            }
        }, 20000);
        
        // initial fetch
        (async () => {
            try {
                const price = await fetchPrice(selectedCoinId);
                if (!isCancelled && price !== null) {
                    setEntryPrice(price.toString());
                    clearError();
                }
            } catch (err) {
                if (!isCancelled) {
                    const error = err as Error;
                    setError(error.message || 'Failed to fetch initial price.');
                }
            }
        })();


        return () => {
            isCancelled = true;
            clearInterval(intervalId);
        };
    }, [selectedCoinId]);


    const commonValues = useMemo(() => {
        const ep = parseFloat(entryPrice);
        const ic = parseFloat(initialCapital);
        const l = leverage;

        if (isNaN(ep) || isNaN(ic) || ep <= 0 || ic <= 0) {
            return null;
        }

        const positionValue = ic * l;
        const maintenanceMarginRate = getBitgetMMR(positionValue);
        const quantity = positionValue / ep;
        
        if (quantity <= 0) {
            return null;
        }
        return { entryPrice: ep, initialCapital: ic, leverage: l, maintenanceMarginRate, isShort, quantity };
    }, [entryPrice, initialCapital, leverage, isShort]);

    const liquidationResult: LiquidationResult | null = useMemo(() => {
        if (!commonValues) return null;

        const am = parseFloat(additionalMargin) || 0;
        let liquidationPrice;
        
        if (isShort) {
            const priceChange = commonValues.entryPrice * (1 / commonValues.leverage - commonValues.maintenanceMarginRate);
            liquidationPrice = commonValues.entryPrice + priceChange + (am / commonValues.quantity);
        } else {
            const priceChange = commonValues.entryPrice * (1 / commonValues.leverage - commonValues.maintenanceMarginRate);
            liquidationPrice = commonValues.entryPrice - priceChange - (am / commonValues.quantity);
        }
        
        if (liquidationPrice > 0 && isFinite(liquidationPrice)) {
            return { price: liquidationPrice, mmr: commonValues.maintenanceMarginRate };
        }
        return null;
    }, [commonValues, additionalMargin, isShort]);

    const handleDesiredPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const desiredPrice = e.target.value;
        setDesiredLiqPrice(desiredPrice);

        if (!commonValues) return;
        
        const dlp = parseFloat(desiredPrice);
        if (isNaN(dlp) || dlp <= 0) {
            setAdditionalMargin('0');
            return;
        }

        let requiredMargin;
        if (isShort) {
            const baseLiqPrice = commonValues.entryPrice * (1 + 1 / commonValues.leverage - commonValues.maintenanceMarginRate);
            requiredMargin = (dlp - baseLiqPrice) * commonValues.quantity;
        } else {
            const baseLiqPrice = commonValues.entryPrice * (1 - 1 / commonValues.leverage + commonValues.maintenanceMarginRate);
            requiredMargin = (baseLiqPrice - dlp) * commonValues.quantity;
        }

        if (isFinite(requiredMargin)) {
            setAdditionalMargin(Math.max(0, requiredMargin).toFixed(2));
        }
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        clearError();
        setter(e.target.value);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
            <div className="w-full max-w-md mx-auto">
                <div className="calculator-card bg-[#1F2937] border border-gray-700 rounded-2xl p-6 md:p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Calculadora de Liquidación</h1>
                    <p className="text-gray-400 text-center mb-8">Estimación con tasas de margen de Bitget</p>

                    <ToggleSwitch isToggled={isShort} onToggle={() => {
                        setIsShort(prev => !prev);
                        clearError();
                    }} />

                    <div className="mt-8 space-y-6">
                        <CoinSearch onCoinSelect={handleCoinSelect} onError={setError} setEntryPrice={setEntryPrice} />
                        
                        <InputGroup
                            label="Precio de Entrada (USDT)"
                            id="entryPrice"
                            type="number"
                            value={entryPrice}
                            onChange={handleInputChange(setEntryPrice)}
                            placeholder="Busca un activo o introduce un valor"
                        />

                        <InputGroup
                            label="Capital Inicial (USDT)"
                            id="initialCapital"
                            type="number"
                            value={initialCapital}
                            onChange={handleInputChange(setInitialCapital)}
                            placeholder="Ej: 1000"
                        />

                        <div>
                            <label htmlFor="leverage" className="block mb-4 text-sm font-medium text-gray-300">
                                Apalancamiento ({leverage}x)
                            </label>
                            <input
                                type="range"
                                id="leverage"
                                min="1"
                                max="125"
                                value={leverage}
                                onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer leverage-slider"
                            />
                        </div>


                        <InputGroup
                            label="Margen Adicional (USDT)"
                            id="additionalMargin"
                            type="number"
                            value={additionalMargin}
                            onChange={handleInputChange(setAdditionalMargin)}
                            placeholder="Opcional, Ej: 200"
                        />
                    </div>
                    
                    <ResultDisplay result={liquidationResult} />
                    
                    <hr className="my-8 border-gray-600" />

                    <div>
                        <h2 className="mb-6 text-xl font-bold text-center text-white">Calcular Margen Adicional</h2>
                        <InputGroup
                            label="Precio de Liquidación Deseado"
                            id="desiredLiquidationPrice"
                            type="number"
                            value={desiredLiqPrice}
                            onChange={handleDesiredPriceChange}
                            placeholder="Introduce un precio y se calculará el margen"
                        />
                    </div>
                    
                    <ErrorDisplay message={error} />
                </div>
                 <footer className="mt-6 text-sm text-center text-gray-500">
                    <p>Datos de precios por CoinGecko. Esta es una herramienta de estimación.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;