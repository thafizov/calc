import React, { Fragment, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
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
  }, [value, onChange, isCapitalized]);

  // Находим выбранную опцию
  const selectedOption = options.find(option => option.value === value) || options[0];

  return (
    <Listbox value={selectedOption} onChange={(newValue) => onChange(newValue.value as CapitalizationPeriod)}>
      <div className="relative">
        <Listbox.Button className="w-full h-[60px] pl-10 pr-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px] flex items-center justify-between cursor-pointer hover:bg-[#CEE1F0] transition-colors">
          <span className="block truncate text-left">{selectedOption.label}</span>
          <ChevronDownIcon
            className="h-5 w-5 text-[#96A8D4] flex-shrink-0"
            aria-hidden="true"
          />
        </Listbox.Button>
        
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-[15px] bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                    active ? 'bg-[#E9F5FF] text-accent-blue' : 'text-gray-900'
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <span className={`block truncate text-[18px] ${selected ? 'font-medium text-accent-blue' : 'font-normal'}`}>
                    {option.label}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default CapitalizationSelect; 