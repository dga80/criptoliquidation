
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { searchCoins } from '../services/coingeckoService';
import type { Coin } from '../types';
import InputGroup from './InputGroup';

interface CoinSearchProps {
    onCoinSelect: (coinId: string) => void;
    onError: (message: string) => void;
    setEntryPrice: (price: string) => void;
}

const Loader: React.FC = () => (
    <div className="absolute top-3.5 right-3 w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
);

const CoinSearch: React.FC<CoinSearchProps> = ({ onCoinSelect, onError, setEntryPrice }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Coin[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const searchRef = useRef<HTMLDivElement>(null);

    const handleSearch = useCallback(async (query: string) => {
        if (query.trim() === '') {
            setResults([]);
            setIsLoading(false);
            setIsDropdownVisible(false);
            return;
        }
        setIsLoading(true);
        try {
            const coins = await searchCoins(query);
            setResults(coins.slice(0, 10));
            setIsDropdownVisible(true);
        } catch (error) {
            const err = error as Error;
            onError(err.message || 'Failed to search for assets.');
            setResults([]);
            setIsDropdownVisible(false);
        } finally {
            setIsLoading(false);
        }
    }, [onError]);

    useEffect(() => {
        handleSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm, handleSearch]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectCoin = (coin: Coin) => {
        setSearchTerm(`${coin.name} (${coin.symbol})`);
        onCoinSelect(coin.id);
        setEntryPrice(''); // Clear price while new one is fetched
        setResults([]);
        setIsDropdownVisible(false);
    };

    return (
        <div className="relative" ref={searchRef}>
            <InputGroup
                label="Buscar Activo"
                id="searchInput"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    onCoinSelect(''); // Clear selection if user types
                }}
                placeholder="e.g. Bitcoin, BTC..."
            />
            {isLoading && <Loader />}
            {isDropdownVisible && results.length > 0 && (
                <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60">
                    {results.map((coin) => (
                        <div
                            key={coin.id}
                            className="flex items-center p-3 space-x-3 transition-colors cursor-pointer hover:bg-gray-700"
                            onClick={() => handleSelectCoin(coin)}
                        >
                            <img src={coin.thumb} alt={coin.name} className="flex-shrink-0 w-6 h-6 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <span className="font-medium text-white truncate">{coin.name}</span>
                                <span className="ml-2 text-sm text-gray-400">{coin.symbol}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoinSearch;