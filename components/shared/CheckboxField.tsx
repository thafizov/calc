import React from 'react';
import { CheckboxFieldProps } from '../../types/calculator';

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  checked,
  onChange,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center space-x-3 pl-10">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
        />
        <span className="text-label text-gray-700">
          {label}
        </span>
      </label>
    </div>
  );
};

export default CheckboxField; 