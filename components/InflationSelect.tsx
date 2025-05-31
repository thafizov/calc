import { Fragment, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface InflationSelectProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const options = [
  { value: false, label: 'Нет' },
  { value: true, label: 'Да' }
];

const InflationSelect: React.FC<InflationSelectProps> = ({ value, onChange }) => {
  // Находим выбранную опцию
  const selectedOption = options.find(option => option.value === value) || options[0];

  return (
    <Listbox value={selectedOption} onChange={(newValue) => onChange(newValue.value)}>
      <div className="relative h-[60px]">
        {/* Все поле теперь кликабельно */}
        <Listbox.Button className="w-full h-full bg-[#E9F5FF] rounded-[30px] flex items-center pl-10 pr-24 transition-colors cursor-pointer focus:ring-2 focus:ring-accent-blue relative">
          <span className="block truncate text-left text-[22px] flex-1">{selectedOption.label}</span>
          
          {/* Стрелочка внутри кнопки */}
          <div className="absolute right-0 top-0 w-[80px] h-[60px] bg-[#CEE1F0] rounded-[30px] flex items-center justify-center transition-colors hover:bg-[#B8D0E8] pointer-events-none">
            <ChevronDownIcon
              className="h-5 w-5 text-[#96A8D4]"
              aria-hidden="true"
            />
          </div>
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
                key={option.value.toString()}
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

export default InflationSelect; 