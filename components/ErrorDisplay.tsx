
import React from 'react';

interface ErrorDisplayProps {
    message: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    if (!message) return null;

    return (
        <div className="relative px-4 py-3 mt-6 text-red-200 bg-red-900/50 border border-red-600 rounded-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{message}</span>
        </div>
    );
};

export default ErrorDisplay;