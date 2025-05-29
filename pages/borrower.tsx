import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import DurationSelect from '../components/DurationSelect';
import DatePickerInput from '../components/DatePickerInput';
import { useBorrowerTest } from '../hooks/useBorrowerTest';
import CapitalizationSelect from '../components/CapitalizationSelect';

// Типы для переключателя
type TabType = 'monthly' | 'amount' | 'term';

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

export default function BorrowerTestPage() {
  // Состояние для переключателя
  const [activeTab, setActiveTab] = React.useState<TabType>('monthly');

  // Состояния для вкладки "Сумма"
  const [monthlyPayment, setMonthlyPayment] = React.useState('10000');
  const [creditTerm, setCreditTerm] = React.useState('12');
  const [amountRate, setAmountRate] = React.useState('15.00');

  // Состояния для вкладки "Срок"
  const [creditAmount, setCreditAmount] = React.useState('100000');
  const [termPayment, setTermPayment] = React.useState('10000');
  const [termRate, setTermRate] = React.useState('15.00');

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
  } = useBorrowerTest();

  // Ref для скролла к графику
  const scheduleRef = React.useRef<HTMLDivElement>(null);

  // Получаем текущее окончание в зависимости от числа
  const currentPeriod = getWordForm(parseInt(term) || 0, periodType === 'year' ? 'year' : 'month');

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
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

  return (
    <>
      <Head>
        <title>Тест заемщика</title>
        <meta 
          name="description" 
          content="Пройдите наш тест заемщика и оцените свою долговую нагрузку. Узнайте, какой кредит будет вам по силам" 
        />
      </Head>
      
      <main className="min-h-screen" style={{ backgroundColor: '#CEE1F0' }}>
        <div className="relative py-8 md:py-10 lg:py-10 laptop:py-12 px-4 max-w-container mx-auto lg:scale-90 lg:origin-top">
          <div className="block md:grid md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
            {/* Левая колонка с текстом */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center px-[30px] py-[5px] bg-dark-blue text-white text-subhead rounded-[30px]">
                Бесплатный и понятный
              </div>
              
              <h1 className="text-head mt-1.5 md:mt-2.5 leading-tight md:leading-normal" style={{ color: '#1E1E1E' }}>
                ПРОЙДИ НАШ<br />
                ТЕСТ ЗАЕМЩИКА
              </h1>
              
              <p className="text-subhead mt-1.5 md:mt-6 lg:mt-10 mb-6 md:mb-8 lg:mb-0" style={{ color: '#1E1E1E' }}>
                Хотите взять потребительский кредит, но не уверены, что справитесь с выплатами? 
                Тест поможет оценить вашу долговую нагрузку и понять, какой кредит будет вам по силам.
              </p>
            </div>

            {/* Правая колонка с картинкой */}
            <div className="hidden md:block lg:col-span-7 relative h-[300px] md:h-[400px]">
              <Image 
                src="/calc/img/note.png"
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

          {/* Переключатель табов */}
          <div className="relative z-20 flex justify-center md:justify-start -mt-[68px]">
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`px-[60px] py-[25px] rounded-t-[30px] text-[18px] font-medium transition-all duration-200 whitespace-nowrap border-0 outline-none ${
                activeTab === 'monthly'
                  ? 'bg-white text-dark-blue'
                  : 'bg-dark-blue text-white'
              }`}
            >
              Ежемесячный платеж
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('amount')}
              className={`px-[60px] py-[25px] rounded-t-[30px] text-[18px] font-medium transition-all duration-200 whitespace-nowrap border-0 outline-none ${
                activeTab === 'amount'
                  ? 'bg-white text-dark-blue'
                  : 'bg-dark-blue text-white'
              }`}
            >
              Сумма
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('term')}
              className={`px-[60px] py-[25px] rounded-t-[30px] text-[18px] font-medium transition-all duration-200 whitespace-nowrap border-0 outline-none ${
                activeTab === 'term'
                  ? 'bg-white text-dark-blue'
                  : 'bg-dark-blue text-white'
              }`}
            >
              Срок
            </button>
          </div>

          {/* Форма калькулятора */}
          <div className="relative z-10">
            <div className="relative z-10">
              <div className="bg-white rounded-tr-[30px] rounded-br-[30px] rounded-bl-[30px] max-w-container mx-auto">
                <div className="max-w-container mx-auto px-6 md:px-10 lg:px-9 laptop:px-[60px] py-12 md:py-16 lg:py-14 laptop:py-[80px]">
                  <form className="space-y-8">
                    {/* Контент для вкладки "Ежемесячный платеж" */}
                    {activeTab === 'monthly' && (
                      <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                      </div>
                    )}

                    {/* Контент для вкладки "Сумма" */}
                    {activeTab === 'amount' && (
                      <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Ежемесячный платеж, ₽
                          </label>
                          <input
                            type="text"
                            value={monthlyPayment}
                            onChange={(e) => setMonthlyPayment(e.target.value)}
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Срок кредита
                          </label>
                          <input
                            type="text"
                            value={creditTerm}
                            onChange={(e) => setCreditTerm(e.target.value)}
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Процентная ставка, % годовых
                          </label>
                          <input
                            type="text"
                            value={amountRate}
                            onChange={(e) => setAmountRate(e.target.value)}
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Контент для вкладки "Срок" */}
                    {activeTab === 'term' && (
                      <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Сумма кредита, ₽
                          </label>
                          <input
                            type="text"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Ежемесячный платеж, ₽
                          </label>
                          <input
                            type="text"
                            value={termPayment}
                            onChange={(e) => setTermPayment(e.target.value)}
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Процентная ставка, % годовых
                          </label>
                          <input
                            type="text"
                            value={termRate}
                            onChange={(e) => setTermRate(e.target.value)}
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Результаты */}
              <div className="text-white rounded-[30px] max-w-container mx-auto" style={{ backgroundColor: '#486FCF' }}>
                <div className="max-w-container mx-auto px-6 md:px-10 lg:px-9 laptop:px-[60px] py-6 md:py-8 lg:py-6 laptop:py-[30px]">
                  {/* Результаты для вкладки "Ежемесячный платеж" */}
                  {activeTab === 'monthly' && (
                    <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Ежемесячный платеж</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">8 991₽</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Совокупный средний доход</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">30 000₽</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Налоговая нагрузка</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">29%</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Остаток ежемесячного дохода после выплат</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">21 008₽</div>
                      </div>
                    </div>
                  )}

                  {/* Результаты для вкладки "Сумма" */}
                  {activeTab === 'amount' && (
                    <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Максимальная сумма кредита</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">150 000₽</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Переплата</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">25 000₽</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Общая сумма выплат</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">175 000₽</div>
                      </div>
                    </div>
                  )}

                  {/* Результаты для вкладки "Срок" */}
                  {activeTab === 'term' && (
                    <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Срок кредита</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">24 месяца</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Переплата</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">18 500₽</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Общая сумма выплат</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">118 500₽</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* График начислений */}
              {isVisible && schedule.length > 0 && (
                <div 
                  ref={scheduleRef}
                  className="mt-8 bg-white rounded-[30px] shadow-lg max-w-container mx-auto opacity-0 animate-pulse" 
                  style={{
                    animation: 'slideDown 0.5s ease-out forwards'
                  }}>
                  <div className="max-w-container mx-auto px-6 md:px-10 lg:px-9 laptop:px-[60px] py-6 md:py-8 lg:py-6 laptop:py-[30px]">
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
                              <td className="py-4 px-6 text-right whitespace-nowrap">{formatNumber(item.interest)} ₽</td>
                              <td className="py-4 px-0 text-right whitespace-nowrap">{formatNumber(item.balance)} ₽</td>
                            </tr>
                          ))}
                          {/* Итоговая строка с общей суммой начислений */}
                          <tr className="border-t-2 border-accent-blue bg-blue-50">
                            <td className="py-4 px-0 font-bold text-accent-blue">Итого начислено:</td>
                            <td className="py-4 px-6 text-right whitespace-nowrap font-bold text-accent-blue">{formatNumber(totalInterest)} ₽</td>
                            <td className="py-4 px-0"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <style jsx>{`
                    @keyframes slideDown {
                      from {
                        opacity: 0;
                        transform: translateY(-20px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 