import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface DepositTermSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const options = [
  { value: 'less_than_1_year', label: 'Менее 1 года' },
  { value: '1_to_3_years', label: '1-3 года' },
  { value: 'more_than_3_years', label: 'Более 3 лет' }
];

const DepositTermSelect: React.FC<DepositTermSelectProps> = ({ value, onChange, disabled = false }) => {
  // Находим выбранную опцию
  const selectedOption = options.find(option => option.value === value) || options[0];

  return (
    <Listbox value={selectedOption} onChange={(newValue) => onChange(newValue.value)} disabled={disabled}>
      <div className="relative h-[60px]">
        {/* Все поле теперь кликабельно */}
        <Listbox.Button className={`w-full h-full rounded-[30px] flex items-center pl-10 pr-24 transition-colors relative ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-[#E9F5FF] cursor-pointer focus:ring-2 focus:ring-accent-blue'
        }`}>
          <span className="block truncate text-left text-[22px] flex-1">{selectedOption.label}</span>
          
          {/* Стрелочка внутри кнопки */}
          <div className={`absolute right-0 top-0 w-[80px] h-[60px] rounded-[30px] flex items-center justify-center transition-colors pointer-events-none ${
            disabled 
              ? 'bg-gray-200' 
              : 'bg-[#CEE1F0] hover:bg-[#B8D0E8]'
          }`}>
            <ChevronDownIcon
              className={`h-5 w-5 ${disabled ? 'text-gray-300' : 'text-[#96A8D4]'}`}
              aria-hidden="true"
            />
          </div>
        </Listbox.Button>
        
        {!disabled && (
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
        )}
      </div>
    </Listbox>
  );
};

export default DepositTermSelect; 