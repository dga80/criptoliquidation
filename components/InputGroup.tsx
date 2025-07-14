import React from 'react';

interface InputGroupProps {
    label: string;
    id: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    children?: React.ReactNode;
    className?: string;
    readOnly?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, id, children, className = '', ...props }) => {
    return (
        <div className={className}>
            <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">
                {label}
            </label>
            {children ? children : (
                <input
                    id={id}
                    className="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg form-input focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition-colors"
                    {...props}
                />
            )}
        </div>
    );
};

export default InputGroup;