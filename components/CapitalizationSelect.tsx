import React, { useEffect } from 'react';
import { CapitalizationPeriod } from '../hooks/useDepositCalculator';

interface CapitalizationSelectProps {
  value: CapitalizationPeriod;
  onChange: (value: CapitalizationPeriod) => void;
  isCapitalized: boolean;
}

const options = [
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'quarterly', label: 'Ежеквартально' },
  { value: 'yearly', label: 'Ежегодно' }
];

const CapitalizationSelect: React.FC<CapitalizationSelectProps> = ({ value, onChange, isCapitalized }) => {
  // Устанавливаем значение по умолчанию при монтировании или изменении value
  useEffect(() => {
    if (!value && isCapitalized) {
      onChange('monthly');
    }
  }, [value, onChange]);

  return (
    <div className="relative">
      <select
        value={value || 'monthly'}
        onChange={(e) => onChange(e.target.value as CapitalizationPeriod)}
        className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px] appearance-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default CapitalizationSelect; 