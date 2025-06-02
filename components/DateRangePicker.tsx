import React, { useState, useEffect, useRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import InputMask from 'react-input-mask';
import Image from 'next/image';
import 'react-datepicker/dist/react-datepicker.css';
import ru from 'date-fns/locale/ru';

// Регистрируем русскую локаль
registerLocale('ru', ru as any);

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  placeholder = 'мм.гг — мм.гг',
  className = '',
  error,
}) => {
  // Состояние для текстового ввода
  const [inputValue, setInputValue] = useState<string>('');
  // Состояние для открытия/закрытия календаря
  const [isOpen, setIsOpen] = useState(false);
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

  // Форматирование даты в MM.YY
  const formatDateToMonthYear = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}.${year}`;
  };

  // Обновление текстового ввода при изменении дат
  useEffect(() => {
    if (startDate && endDate) {
      const startFormatted = formatDateToMonthYear(startDate);
      const endFormatted = formatDateToMonthYear(endDate);
      setInputValue(`${startFormatted} — ${endFormatted}`);
    } else if (startDate) {
      const startFormatted = formatDateToMonthYear(startDate);
      setInputValue(`${startFormatted} — __.__`);
    } else if (endDate) {
      const endFormatted = formatDateToMonthYear(endDate);
      setInputValue(`__.__ — ${endFormatted}`);
    } else {
      setInputValue('');
    }
  }, [startDate, endDate]);

  // Парсинг введенного периода
  const parseDateRange = (rangeStr: string): [Date | null, Date | null] => {
    if (!rangeStr.includes(' — ')) return [null, null];

    const [startStr, endStr] = rangeStr.split(' — ');
    
    const parseMonthYear = (str: string): Date | null => {
      if (str === '__.__' || str.length !== 5 || str.includes('_')) return null;
      
      const [month, year] = str.split('.');
      const fullYear = parseInt(year) + 2000; // Предполагаем 20XX год
      const parsedDate = new Date(fullYear, parseInt(month) - 1, 1);
      
      // Проверка валидности
      if (
        parsedDate.getMonth() === parseInt(month) - 1 &&
        parsedDate.getFullYear() === fullYear &&
        parseInt(month) >= 1 && parseInt(month) <= 12
      ) {
        return parsedDate;
      }
      
      return null;
    };

    const start = parseMonthYear(startStr);
    const end = parseMonthYear(endStr);

    // ✅ ИСПРАВЛЕНИЕ: для endDate используем последний день месяца
    if (end) {
      end.setMonth(end.getMonth() + 1, 0); // Устанавливаем последний день месяца
    }

    return [start, end];
  };

  // Обработчик изменения текстового ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Если ввод завершен, пробуем распарсить период (длина 11: мм.гг — мм.гг)
    if (newValue.length === 11 && !newValue.includes('_')) {
      const [start, end] = parseDateRange(newValue);
      if (start || end) {
        onChange(start, end);
      }
    }

    // Если поле очищено, сбрасываем значения
    if (newValue === '' || newValue === '__.__ — __.__') {
      onChange(null, null);
    }
  };

  // Обработчик выбора начальной даты
  const handleStartDateChange = (date: Date | null) => {
    onChange(date, endDate);
  };

  // Обработчик выбора конечной даты
  const handleEndDateChange = (date: Date | null) => {
    // ✅ ИСПРАВЛЕНИЕ: для endDate устанавливаем последний день месяца
    let adjustedEndDate = date;
    if (date) {
      adjustedEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Последний день месяца
    }
    
    onChange(startDate, adjustedEndDate);
    
    // Закрываем календарь если выбраны обе даты
    if (adjustedEndDate && startDate) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <InputMask
          mask="99.99 — 99.99"
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
              src="/img/date.svg"
              alt="Календарь"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 bg-white rounded-[15px] border border-gray-200 shadow-lg p-2 calendar-dropdown">
          <div className="flex flex-col gap-2 calendar-container">
            {/* Левый календарь - начальная дата */}
            <div className="flex flex-col items-center">
              <h4 className="text-xs font-medium text-gray-700 mb-1 calendar-title">Начальная дата</h4>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                locale="ru"
                inline
                showMonthYearPicker
                dateFormat="MM/yyyy"
                maxDate={endDate || undefined}
              />
            </div>
            
            {/* Правый календарь - конечная дата */}
            <div className="flex flex-col items-center">
              <h4 className="text-xs font-medium text-gray-700 mb-1 calendar-title">Конечная дата</h4>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                locale="ru"
                inline
                showMonthYearPicker
                dateFormat="MM/yyyy"
                minDate={startDate || undefined}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Базовые стили для мобилки (до 480px): вертикально, маленькие */
        .calendar-dropdown {
          padding: 8px;
          right: 0;
          top: 100%;
          margin-top: 8px;
        }
        
        .calendar-container {
          flex-direction: column;
          gap: 8px;
        }
        
        .calendar-title {
          font-size: 12px;
          margin-bottom: 4px;
        }

        .react-datepicker {
          font-family: inherit;
          border: none;
          box-shadow: none;
        }
        .react-datepicker__header {
          background: white;
          border-bottom: 1px solid #E5E7EB;
          border-radius: 0;
          padding-top: 6px;
        }
        .react-datepicker__current-month {
          font-size: 12px;
          font-weight: 500;
          color: #111827;
          text-transform: capitalize;
          margin-bottom: 3px;
        }
        .react-datepicker__month-container {
          width: 150px;
        }
        .react-datepicker__month .react-datepicker__month-text,
        .react-datepicker__month .react-datepicker__quarter-text {
          display: inline-block;
          width: 2rem;
          margin: 1px;
          height: 24px;
          line-height: 24px;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          font-size: 10px;
          color: #111827;
        }
        .react-datepicker__month .react-datepicker__month-text:hover,
        .react-datepicker__month .react-datepicker__quarter-text:hover {
          background-color: #F3F4F6;
        }
        .react-datepicker__month .react-datepicker__month-text--selected,
        .react-datepicker__month .react-datepicker__quarter-text--selected {
          background-color: #3B82F6;
          color: white;
        }
        .react-datepicker__month .react-datepicker__month-text--disabled,
        .react-datepicker__month .react-datepicker__quarter-text--disabled {
          color: #D1D5DB;
          cursor: not-allowed;
        }
        .react-datepicker__year-text {
          display: inline-block;
          width: 2rem;
          margin: 1px;
          height: 24px;
          line-height: 24px;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          font-size: 10px;
          color: #111827;
        }
        .react-datepicker__year-text:hover {
          background-color: #F3F4F6;
        }
        .react-datepicker__year-text--selected {
          background-color: #3B82F6;
          color: white;
        }
        .react-datepicker__navigation {
          top: 6px;
          line-height: 1.7rem;
          border: none;
          background: none;
        }
        .react-datepicker__navigation--previous {
          left: 8px;
          border: none;
        }
        .react-datepicker__navigation--next {
          right: 8px;
          border: none;
        }
        .react-datepicker__navigation:hover .react-datepicker__navigation--previous {
          border: none;
        }
        .react-datepicker__navigation:hover .react-datepicker__navigation--next {
          border: none;
        }

        /* 480px+: горизонтально, маленькие календари */
        @media (min-width: 480px) {
          .calendar-container {
            flex-direction: row;
            gap: 16px;
          }
        }

        /* 960px+: горизонтально, большие календари */  
        @media (min-width: 960px) {
          .calendar-dropdown {
            padding: 20px;
          }
          
          .calendar-container {
            gap: 32px;
          }
          
          .calendar-title {
            font-size: 16px;
            margin-bottom: 10px;
          }

          .react-datepicker__header {
            padding-top: 12px;
          }
          .react-datepicker__current-month {
            font-size: 16px;
            margin-bottom: 8px;
          }
          .react-datepicker__month-container {
            width: 240px;
          }
          .react-datepicker__month .react-datepicker__month-text,
          .react-datepicker__month .react-datepicker__quarter-text {
            width: 3.5rem;
            margin: 3px;
            height: 32px;
            line-height: 32px;
            font-size: 14px;
          }
          .react-datepicker__year-text {
            width: 3.5rem;
            margin: 3px;
            height: 32px;
            line-height: 32px;
            font-size: 14px;
          }
          .react-datepicker__navigation {
            top: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker; 