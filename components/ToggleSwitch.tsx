
import React from 'react';

interface ToggleSwitchProps {
    isToggled: boolean;
    onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isToggled, onToggle }) => {
    return (
        <div className="flex items-center justify-center space-x-4">
            <span className={`font-semibold text-lg transition-colors ${!isToggled ? 'text-green-400' : 'text-gray-500'}`}>
                LONG
            </span>
            <label htmlFor="positionType" className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                    type="checkbox"
                    id="positionType"
                    className="sr-only peer"
                    checked={isToggled}
                    onChange={onToggle}
                />
                <div className="w-12 h-6 bg-green-500 rounded-full transition-colors peer-checked:bg-red-500"></div>
                <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform transform peer-checked:translate-x-full"></div>
            </label>
            <span className={`font-semibold text-lg transition-colors ${isToggled ? 'text-red-400' : 'text-gray-500'}`}>
                SHORT
            </span>
        </div>
    );
};

export default ToggleSwitch;