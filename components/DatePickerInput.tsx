import { getAssetPath } from "../utils/paths";
import React, { useState, useEffect, useRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import InputMask from 'react-input-mask';
import Image from 'next/image';
import 'react-datepicker/dist/react-datepicker.css';
import ru from 'date-fns/locale/ru';

// Регистрируем русскую локаль
registerLocale('ru', ru as any);

interface DatePickerInputProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  placeholder = 'дд.мм.гггг',
  className = '',
}) => {
  // Состояние для текстового ввода
  const [inputValue, setInputValue] = useState<string>('');
  // Состояние для открытия/закрытия календаря
  const [isOpen, setIsOpen] = useState(false);
  // Состояние для ошибки
  const [error, setError] = useState<string>('');
  // Реф для отслеживания кликов вне компонента
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Обработчик клика вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Обновление текстового ввода при изменении value извне
  useEffect(() => {
    if (value) {
      const day = value.getDate().toString().padStart(2, '0');
      const month = (value.getMonth() + 1).toString().padStart(2, '0');
      const year = value.getFullYear();
      setInputValue(`${day}.${month}.${year}`);
      setError('');
    } else {
      setInputValue('');
    }
  }, [value]);

  // Парсинг введенной даты
  const parseDate = (dateStr: string): Date | null => {
    if (dateStr.length !== 10) return null;

    const [day, month, year] = dateStr.split('.');
    const parsedDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );

    // Проверка валидности даты
    if (
      parsedDate.getDate() === parseInt(day) &&
      parsedDate.getMonth() === parseInt(month) - 1 &&
      parsedDate.getFullYear() === parseInt(year)
    ) {
      // Проверка, что дата не в прошлом
      if (parsedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
        setError('Дата не может быть в прошлом');
        return null;
      }
      return parsedDate;
    }

    setError('Некорректная дата');
    return null;
  };

  // Обработчик изменения текстового ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Если ввод завершен (10 символов), пробуем распарсить дату
    if (newValue.length === 10) {
      const parsedDate = parseDate(newValue);
      if (parsedDate) {
        onChange(parsedDate);
        setError('');
      }
    }

    // Если поле очищено, сбрасываем значение
    if (newValue === '') {
      onChange(null);
      setError('');
    }
  };

  // Обработчик выбора даты из календаря
  const handleDateSelect = (date: Date | null) => {
    onChange(date);
    setIsOpen(false);
    setError('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <InputMask
          mask="99.99.9999"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full h-[60px] pl-10 pr-[120px] rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px] ${className}`}
          maskChar="_"
        />
        <div className="absolute right-0 inset-y-0 flex items-center">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-[60px] w-[90px] rounded-[30px] bg-[#CEE1F0] flex items-center justify-center cursor-pointer"
          >
            <Image 
              src={getAssetPath("/img/date.svg")}
              alt="Календарь"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>
      <div className="h-6">
        {error && (
          <div className="pl-10 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-10">
          <DatePicker
            selected={value}
            onChange={handleDateSelect}
            locale="ru"
            inline
            dateFormat="dd.MM.yyyy"
            minDate={new Date()}
            calendarClassName="rounded-[15px] border border-gray-200 shadow-lg"
          />
        </div>
      )}

      <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          border-radius: 15px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
        .react-datepicker__header {
          background: white;
          border-bottom: 1px solid #E5E7EB;
          border-radius: 15px 15px 0 0;
          padding-top: 10px;
        }
        .react-datepicker__current-month {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          text-transform: capitalize;
          margin-bottom: 5px;
        }
        .react-datepicker__day-name {
          color: #6B7280;
          font-weight: 500;
          width: 28px;
          margin: 3px;
          text-transform: capitalize;
          font-size: 12px;
        }
        .react-datepicker__day {
          width: 28px;
          height: 28px;
          line-height: 28px;
          margin: 3px;
          border-radius: 14px;
          color: #111827;
          font-size: 13px;
        }
        .react-datepicker__day:hover {
          background-color: #E9F5FF;
        }
        .react-datepicker__day--selected {
          background-color: #2C7DFA !important;
          color: white !important;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #E9F5FF;
          color: #111827;
        }
        .react-datepicker__navigation {
          top: 8px;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #6B7280;
          border-width: 2px 2px 0 0;
          width: 7px;
          height: 7px;
        }
        .react-datepicker__navigation:hover *::before {
          border-color: #111827;
        }
        .react-datepicker__month {
          margin: 0.4em;
        }
      `}</style>
    </div>
  );
};

export default DatePickerInput; 