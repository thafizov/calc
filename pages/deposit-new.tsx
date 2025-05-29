import React from 'react';
import CalculatorLayout from '../components/shared/CalculatorLayout';
import InputField from '../components/shared/InputField';
import ResultsBlock from '../components/shared/ResultsBlock';
import DurationSelect from '../components/DurationSelect';
import DatePickerInput from '../components/DatePickerInput';
import CapitalizationSelect from '../components/CapitalizationSelect';
import { useDepositCalculator } from '../hooks/useDepositCalculator';

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

export default function DepositNewPage() {
  const {
    amount,
    term,
    periodType,
    rate,
    startDate,
    total,
    profit,
    schedule,
    totalInterest,
    isVisible,
    errors,
    effectiveRate,
    setAmount,
    setTerm,
    setPeriodType,
    setRate,
    setStartDate,
    setIsVisible,
    formatNumber,
    isCapitalized,
    setIsCapitalized,
    capitalizationPeriod,
    setCapitalizationPeriod
  } = useDepositCalculator();

  // Ref для скролла к графику
  const scheduleRef = React.useRef<HTMLDivElement>(null);

  // Получаем текущее окончание в зависимости от числа
  const currentPeriod = getWordForm(parseInt(term) || 0, periodType === 'year' ? 'year' : 'month');

  const handleTermChange = (value: string) => {
    setTerm(value);
  };

  const handlePeriodChange = (value: string) => {
    setPeriodType(value === 'год' || value === 'года' || value === 'лет' ? 'year' : 'month');
  };

  const handleToggleSchedule = () => {
    setIsVisible(!isVisible);
    
    // Если показываем график, скроллим к нему через небольшую задержку
    if (!isVisible && schedule.length > 0) {
      setTimeout(() => {
        scheduleRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  };

  const handleRateBlur = (value: string) => {
    if (value && !value.includes('.')) {
      setRate(`${value}.00`);
    } else if (value.endsWith('.')) {
      setRate(`${value}00`);
    } else if (value.includes('.') && value.split('.')[1].length < 2) {
      setRate(`${value}0`);
    }
  };

  // Подготавливаем данные для ResultsBlock
  const results = [
    {
      label: 'Сумма в конце срока',
      value: `${formatNumber(total)} ₽`
    },
    {
      label: 'Доход',
      value: `${formatNumber(profit)} ₽`
    }
  ];

  return (
    <CalculatorLayout
      title="ИСПОЛЬЗУЙ НАШ<br />ДЕПОЗИТНЫЙ КАЛЬКУЛЯТОР"
      subtitle="Вы сможете рассчитать доход по вкладу, оценить, как он меняется в зависимости от разных сроков и условий выплаты процентов."
      badge="Бесплатный и понятный"
    >
      <form className="space-y-8">
        <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Сумма вклада */}
          <InputField
            label="Сумма вклада, ₽"
            value={amount}
            onChange={setAmount}
            error={errors.amount}
          />

          {/* Срок вклада */}
          <InputField
            label="Срок вклада"
            value={term}
            onChange={handleTermChange}
            error={errors.term}
            suffix={
              <DurationSelect 
                value={currentPeriod} 
                onChange={handlePeriodChange}
                term={term}
              />
            }
          />

          {/* Процентная ставка */}
          <InputField
            label="Процентная ставка, % годовых"
            value={rate}
            onChange={setRate}
            onBlur={handleRateBlur}
            error={errors.rate}
          />

          {/* Дата открытия */}
          <div className="space-y-2">
            <label className="block text-label text-gray-700 pl-10">
              Дата открытия
            </label>
            <DatePickerInput
              value={startDate}
              onChange={setStartDate}
            />
            {errors.startDate && (
              <div className="text-red-500 text-sm pl-10">{errors.startDate}</div>
            )}
          </div>

          {/* Капитализация */}
          <div className="space-y-2">
            <label className="flex items-center space-x-3 pl-10">
              <input
                type="checkbox"
                checked={isCapitalized}
                onChange={(e) => setIsCapitalized(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
              />
              <span className="text-label text-gray-700">
                Начисление процентов с учетом капитализации
              </span>
            </label>
          </div>

          {/* Период капитализации */}
          {isCapitalized && (
            <div className="space-y-2">
              <label className="block text-label text-gray-700 pl-10">
                Период капитализации
              </label>
              <CapitalizationSelect
                value={capitalizationPeriod}
                onChange={setCapitalizationPeriod}
                isCapitalized={isCapitalized}
              />
            </div>
          )}
        </div>

        {/* Результаты */}
        <ResultsBlock
          results={results}
          onActionClick={handleToggleSchedule}
          actionLabel="График начислений"
        />

        {/* Дополнительная информация */}
        {(effectiveRate > 0 || totalInterest > 0) && (
          <div className="bg-gray-50 rounded-[20px] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {effectiveRate > 0 && (
                <div>
                  <div className="text-sm text-gray-600">Эффективная ставка</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(effectiveRate)}%
                  </div>
                </div>
              )}
              {totalInterest > 0 && (
                <div>
                  <div className="text-sm text-gray-600">Общая сумма процентов</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(totalInterest)} ₽
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* График начислений */}
        {isVisible && schedule.length > 0 && (
          <div ref={scheduleRef} className="bg-white rounded-[20px] border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">График начислений</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Проценты
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Остаток
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.map((item, index) => (
                    <tr key={index} className={item.isCapitalization ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.date}
                        {item.isCapitalization && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Капитализация
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(item.interest)} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatNumber(item.balance)} ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </form>
    </CalculatorLayout>
  );
} 