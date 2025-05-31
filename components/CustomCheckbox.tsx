import React from 'react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ 
  checked, 
  onChange, 
  label, 
  className = '' 
}) => {
  return (
    <div
      className={`relative flex h-[60px] cursor-pointer transition-all duration-200 ${className}`}
      onClick={() => onChange(!checked)}
    >
      {/* Основное поле с текстом - полностью закругленное */}
      <div className="w-full bg-[#E9F5FF] rounded-[30px] flex items-center pl-10 pr-24">
        <span className="text-[22px] text-gray-900">{label}</span>
      </div>
      
      {/* Овальная область с галочкой - позиционируется поверх справа */}
      <div className="absolute right-0 top-0 w-[80px] h-[60px] bg-[#CEE1F0] rounded-[30px] flex items-center justify-center">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-200"
        >
          <path 
            d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z" 
            fill={checked ? '#486FCF' : '#FFFFFF'}
          />
        </svg>
      </div>
    </div>
  );
};

export default CustomCheckbox; 