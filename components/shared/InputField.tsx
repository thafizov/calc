import React from 'react';
import { InputFieldProps } from '../../types/calculator';

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  type = 'text',
  suffix,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-label text-gray-700 pl-10">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
          placeholder={placeholder}
          className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <div className="text-red-500 text-sm pl-10">{error}</div>
      )}
    </div>
  );
};

export default InputField; 