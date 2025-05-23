import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

// Функция для получения правильного окончания
const getWordForm = (number: number, type: 'year' | 'month'): string => {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (type === 'year') {
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'лет';
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
  } else {
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'месяцев';
    if (lastDigit === 1) return 'месяц';
    if (lastDigit >= 2 && lastDigit <= 4) return 'месяца';
    return 'месяцев';
  }
};

interface DurationSelectProps {
  value: string;
  onChange: (value: string) => void;
  term: string; // Добавляем проп для текущего значения срока
}

export default function DurationSelect({ value, onChange, term }: DurationSelectProps) {
  const number = parseInt(term) || 0;
  
  const periods = [
    { id: 1, name: getWordForm(number, 'year') },
    { id: 2, name: getWordForm(number, 'month') }
  ];

  // Находим период, который соответствует текущему значению (с учетом разных окончаний)
  const selected = periods.find(period => {
    if (period.id === 1) {
      return ['год', 'года', 'лет'].includes(value);
    } else {
      return ['месяц', 'месяца', 'месяцев'].includes(value);
    }
  }) || periods[0];

  return (
    <Listbox value={selected} onChange={(newValue) => onChange(newValue.name)}>
      <div className="relative flex h-[60px]">
        <div className="flex-1 bg-[#E9F5FF] rounded-l-[30px]" />
        <div className="w-[160px]">
          <Listbox.Button className="w-full h-full rounded-[30px] bg-[#CEE1F0] py-0 pl-6 pr-10 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-accent-blue text-[22px] flex items-center">
            <span className="block truncate">{value}</span>
            <ChevronDownIcon
              className="h-5 w-5 text-gray-900 absolute right-4"
              aria-hidden="true"
            />
          </Listbox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute right-0 z-10 mt-2 w-[160px] overflow-hidden rounded-[15px] bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {periods.map((period) => (
              <Listbox.Option
                key={period.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-3 pl-6 pr-4 ${
                    active ? 'bg-[#E9F5FF] text-accent-blue' : 'text-gray-900'
                  }`
                }
                value={period}
              >
                {({ selected }) => (
                  <span className={`block truncate text-[18px] ${selected ? 'font-medium text-accent-blue' : 'font-normal'}`}>
                    {period.name}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
} 