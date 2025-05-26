import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import DurationSelect from '../components/DurationSelect';
import DatePickerInput from '../components/DatePickerInput';
import { useDepositCalculator } from '../hooks/useDepositCalculator';
import CapitalizationSelect from '../components/CapitalizationSelect';

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

// Функция для конвертации периода в месяцы
const convertToMonths = (value: string, type: 'year' | 'month'): number => {
  const numValue = parseInt(value) || 0;
  return type === 'year' ? numValue * 12 : numValue;
};

export default function DepositPage() {
  const {
    amount,
    term,
    periodType,
    rate,
    startDate,
    total,
    profit,
    schedule,
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

  // Получаем текущее окончание в зависимости от числа
  const currentPeriod = getWordForm(parseInt(term) || 0, periodType === 'year' ? 'year' : 'month');

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
  };

  const handlePeriodChange = (value: string) => {
    setPeriodType(value === 'год' || value === 'года' || value === 'лет' ? 'year' : 'month');
  };

  return (
    <>
      <Head>
        <title>Депозитный калькулятор</title>
        <meta 
          name="description" 
          content="Рассчитайте доход по вкладу и оцените, как он меняется в зависимости от разных сроков и условий выплаты процентов" 
        />
      </Head>
      
      <main className="min-h-screen bg-deep-blue">
        <div className="relative py-12 px-4 max-w-container mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Левая колонка с текстом */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center px-[30px] py-[5px] bg-accent-blue text-white text-subhead rounded-[30px]">
                Бесплатный и понятный
              </div>
              
              <h1 className="text-head text-white mt-2.5">
                ИСПОЛЬЗУЙ НАШ<br />
                ДЕПОЗИТНЫЙ КАЛЬКУЛЯТОР
              </h1>
              
              <p className="text-subhead text-white/80 mt-10">
                Вы сможете рассчитать доход по вкладу, оценить, как он меняется в зависимости 
                от разных сроков и условий выплаты процентов.
              </p>
            </div>

            {/* Правая колонка с картинкой */}
            <div className="hidden lg:block lg:col-span-7 relative h-[400px]">
              <Image 
                src="/calc/img/cards.png"
                alt="Банковские карты"
                fill
                style={{
                  objectFit: 'contain',
                  objectPosition: 'right center'
                }}
                priority
              />
            </div>
          </div>

          {/* Форма калькулятора */}
          <div className="relative -mt-20">
            <div className="relative z-10">
              <div className="bg-white rounded-[30px] shadow-lg">
                <div className="max-w-container mx-auto">
                  <div className="px-[60px] py-[80px]">
                    <form className="space-y-8">
                      <div className="grid gap-[70px] md:grid-cols-2 lg:grid-cols-3">
                        {/* Сумма вклада */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Сумма вклада, ₽
                          </label>
                          <input
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
                          {errors.amount && (
                            <div className="text-red-500 text-sm pl-10">{errors.amount}</div>
                          )}
                        </div>

                        {/* Срок вклада */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Срок вклада
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={term}
                              onChange={handleTermChange}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center">
                              <DurationSelect 
                                value={currentPeriod} 
                                onChange={handlePeriodChange}
                                term={term}
                              />
                            </div>
                          </div>
                          {errors.term && (
                            <div className="text-red-500 text-sm pl-10">{errors.term}</div>
                          )}
                        </div>

                        {/* Процентная ставка */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Процентная ставка, % годовых
                          </label>
                          <input
                            type="text"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value && !value.includes('.')) {
                                setRate(`${value}.00`);
                              } else if (value.endsWith('.')) {
                                setRate(`${value}00`);
                              } else if (value.includes('.') && value.split('.')[1].length < 2) {
                                setRate(`${value}0`);
                              }
                            }}
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
                          {errors.rate && (
                            <div className="text-red-500 text-sm pl-10">{errors.rate}</div>
                          )}
                        </div>

                        {/* Дата открытия */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Дата открытия
                          </label>
                          <DatePickerInput value={startDate} onChange={setStartDate} />
                          {errors.startDate && (
                            <div className="text-red-500 text-sm pl-10">{errors.startDate}</div>
                          )}
                        </div>

                        {/* Капитализация */}
                        <div className="col-span-2 grid grid-cols-2 gap-[70px] items-start">
                          <div className="space-y-2">
                            <div className="block text-label text-gray-700 pl-10 invisible">
                              &nbsp;
                            </div>
                            <div className="h-[60px] flex items-start relative pt-[2px]">
                              <input
                                id="capitalization-checkbox"
                                type="checkbox"
                                checked={isCapitalized}
                                onChange={(e) => setIsCapitalized(e.target.checked)}
                                className="h-[14px] w-[14px] min-w-[14px] min-h-[14px] rounded border-2 border-[#CEE1F0] text-[#CEE1F0] focus:ring-2 focus:ring-[#CEE1F0] checked:bg-[#CEE1F0] checked:hover:bg-[#CEE1F0] cursor-pointer absolute left-0 top-[2px]"
                              />
                              <label htmlFor="capitalization-checkbox" className="text-[18px] text-gray-700 cursor-pointer absolute left-10 top-[-2px]">
                                Начисление процентов с&nbsp;учетом капитализации
                              </label>
                            </div>
                          </div>
                          {isCapitalized && (
                            <div className="space-y-2">
                              <div className="block text-label text-gray-700 pl-10">
                                Периодичность капитализации
                              </div>
                              <CapitalizationSelect
                                value={capitalizationPeriod}
                                onChange={setCapitalizationPeriod}
                                isCapitalized={isCapitalized}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Результаты */}
              <div className="bg-accent-blue text-white rounded-[30px]">
                <div className="max-w-container mx-auto">
                  <div className="px-[60px] py-[30px]">
                    <div className="grid gap-[70px] md:grid-cols-3">
                      {/* Левая часть с результатами (2 колонки) */}
                      <div className={`grid col-span-2 ${isCapitalized ? 'grid-cols-[42%_29%_29%]' : 'grid-cols-[55%_45%]'} gap-[20px]`}>
                        <div className="space-y-2">
                          <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Сумма в конце срока</div>
                          <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(total)} ₽</div>
                        </div>
                        
                        {isCapitalized && (
                          <div className="space-y-2">
                            <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Эффективная ставка</div>
                            <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(effectiveRate)}%</div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Доход</div>
                          <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(profit)} ₽</div>
                        </div>
                      </div>

                      {/* Кнопка графика (1 колонка справа) */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setIsVisible(!isVisible)}
                          className="w-full h-[60px] bg-white text-[18px] text-accent-blue rounded-[30px] hover:bg-blue-50 transition-colors"
                        >
                          График начислений
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* График начислений */}
              {isVisible && schedule.length > 0 && (
                <div className="mt-8 bg-white rounded-[30px] shadow-lg">
                  <div className="max-w-container mx-auto">
                    <div className="px-[60px] py-[30px]">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="py-4 px-0 text-left font-bold text-accent-blue">Дата</th>
                              <th className="py-4 px-6 text-right font-bold text-accent-blue">Начислено процентов</th>
                              <th className="py-4 px-0 text-right font-bold text-accent-blue">Остаток вклада</th>
                            </tr>
                          </thead>
                          <tbody>
                            {schedule.map((item, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-4 px-0">{item.date}</td>
                                <td className="py-4 px-6 text-right">{formatNumber(item.interest)} ₽</td>
                                <td className="py-4 px-0 text-right">{formatNumber(item.balance)} ₽</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 