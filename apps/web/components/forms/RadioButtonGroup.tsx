import React from 'react';

interface RadioButtonGroupProps {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  layout?: 'single' | 'double' | 'triple';
  error?: string;
}

export const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  name,
  options,
  value,
  onChange,
  layout = 'single',
  error,
}) => {
  const getContainerClass = () => {
    switch (layout) {
      case 'double':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-1';
      case 'triple':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1';
      default:
        return 'space-y-1';
    }
  };

  return (
    <div>
      <div className={getContainerClass()}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`my-0.5 flex h-10 cursor-pointer items-center rounded border border-gray-200 px-3 transition-all duration-300 ease-in-out ${
              value === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'hover:bg-blue-25 border-gray-200 bg-white text-gray-700 hover:border-blue-400'
            } `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-5 w-5 border-2 border-gray-200 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className={`mr-2 text-sm font-medium transition-colors duration-300`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-4 text-sm font-semibold text-red-500">{error}</p>}
    </div>
  );
};
