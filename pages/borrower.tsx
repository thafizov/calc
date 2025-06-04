import { getAssetPath } from "../utils/paths";
import React, { useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import DurationSelect from '../components/DurationSelect';
import CreditAlert from '../components/CreditAlert';
import FloatingCreditButton from '../components/FloatingCreditButton';
import CalculatorPageLayout from '../components/shared/CalculatorPageLayout';
import OffersBlock from '../components/shared/OffersBlock';
import { useBorrowerTest } from '../hooks/useBorrowerTest';
import { formatDecimal } from '../utils/formatNumber';

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

  const {
    amount,
    term,
    periodType,
    rate,
    errors,
    calculatedMonthlyPayment,
    calculatedAmount,
    calculatedTerm,
    totalInterest,
    debtBurden,
    remainingIncome,
    averageIncomeValue,
    setAmount,
    setTerm,
    setPeriodType,
    setRate,
    formatNumber,
    income1,
    income2,
    income3,
    setIncome1,
    setIncome2,
    setIncome3,
    monthlyPayment,
    averageIncome,
    setMonthlyPayment,
    setAverageIncome,
    creditAlert
  } = useBorrowerTest();

  // Ref для скролла к уведомлению
  const alertRef = useRef<HTMLDivElement>(null);

  // Функция плавного скролла к уведомлению
  const scrollToAlert = () => {
    alertRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  };

  // Получаем текущее окончание в зависимости от числа
  const currentPeriod = getWordForm(parseInt(term) || 0, periodType === 'year' ? 'year' : 'month');

  // Функция для форматирования срока в месяцах
  const formatTermInMonths = (months: number): string => {
    if (months < 12) {
      return `${months} ${getWordForm(months, 'month')}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} ${getWordForm(years, 'year')}`;
      } else {
        return `${years} ${getWordForm(years, 'year')} ${remainingMonths} ${getWordForm(remainingMonths, 'month')}`;
      }
    }
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
  };

  const handlePeriodChange = (value: string) => {
    setPeriodType(value === 'год' || value === 'года' || value === 'лет' ? 'year' : 'month');
  };

  return (
    <CalculatorPageLayout>
      <Head>
        <title>Тест заемщика</title>
        <meta 
          name="description" 
          content="Пройдите наш тест заемщика и оцените свою долговую нагрузку. Узнайте, какой кредит будет вам по силам" 
        />
      </Head>
      
      <div className="min-h-screen" style={{ backgroundColor: '#CEE1F0' }}>
        <div className="relative pt-8 md:pt-10 lg:pt-10 laptop:pt-12 px-4 max-w-container mx-auto lg:scale-90 lg:origin-top">
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
              
              <p className="text-subhead mt-1.5 md:mt-6 lg:mt-10 mb-12 md:mb-16 lg:mb-0" style={{ color: '#1E1E1E' }}>
                Хотите взять потребительский кредит, но не уверены, что справитесь с выплатами? 
                Тест поможет оценить вашу долговую нагрузку и понять, какой кредит будет вам по силам.
              </p>
            </div>

            {/* Правая колонка с картинкой */}
            <div className="hidden md:block lg:col-span-7 relative h-[300px] md:h-[400px]">
              <Image 
                src={getAssetPath("/img/note.png")}
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
          <div className="relative z-20 max-w-container mx-auto -mt-4 md:-mt-8 lg:-mt-12">
            <div className="flex w-full">
              <button
                type="button"
                onClick={() => setActiveTab('monthly')}
                className={`flex-1 md:flex-none md:px-8 md:py-5 lg:px-[60px] lg:py-[25px] py-3 rounded-t-[30px] text-sm md:text-base lg:text-[18px] font-medium transition-all duration-200 whitespace-nowrap border-0 outline-none ${
                  activeTab === 'monthly'
                    ? 'bg-white text-dark-blue'
                    : 'bg-dark-blue text-white'
                }`}
              >
                <span className="block md:hidden">Платеж</span>
                <span className="hidden md:block">Ежемесячный платеж</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('amount')}
                className={`flex-1 md:flex-none md:px-8 md:py-5 lg:px-[60px] lg:py-[25px] py-3 rounded-t-[30px] text-sm md:text-base lg:text-[18px] font-medium transition-all duration-200 whitespace-nowrap border-0 outline-none ${
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
                className={`flex-1 md:flex-none md:px-8 md:py-5 lg:px-[60px] lg:py-[25px] py-3 rounded-t-[30px] text-sm md:text-base lg:text-[18px] font-medium transition-all duration-200 whitespace-nowrap border-0 outline-none ${
                  activeTab === 'term'
                    ? 'bg-white text-dark-blue'
                    : 'bg-dark-blue text-white'
                }`}
              >
                Срок
              </button>
            </div>
          </div>

          {/* Форма калькулятора */}
          <div className="relative z-10">
            <div className="relative z-10">
              <div className="bg-white rounded-br-[30px] rounded-bl-[30px] md:rounded-tr-[30px] md:rounded-br-[30px] md:rounded-bl-[30px] max-w-container mx-auto">
                <div className="max-w-container mx-auto px-6 md:px-10 lg:px-9 laptop:px-[60px] py-12 md:py-16 lg:py-14 laptop:py-[80px]">
                  <form className="space-y-8">
                    {/* Контент для вкладки "Ежемесячный платеж" */}
                    {activeTab === 'monthly' && (
                      <div className="space-y-8">
                        {/* Первая строка: основные параметры кредита */}
                        <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {/* Сумма кредита/займа */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Сумма кредита/займа, ₽
                            </label>
                            <input
                              type="text"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>

                          {/* Срок кредита/займа */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Срок кредита/займа
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center">
                                <DurationSelect 
                                  value={getWordForm(parseInt(term) || 0, periodType)} 
                                  onChange={(value) => {
                                    setPeriodType(value === 'год' || value === 'года' || value === 'лет' ? 'year' : 'month');
                                  }}
                                  term={term}
                                />
                              </div>
                            </div>
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
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>
                        </div>

                        {/* Вторая строка: доходы */}
                        <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {/* Среднемес. доход за 1-й год */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Среднемес. доход за 1-й год, ₽
                            </label>
                            <input
                              type="text"
                              value={income1}
                              onChange={(e) => setIncome1(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>

                          {/* Среднемес. доход за 2-й год */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Среднемес. доход за 2-й год, ₽
                            </label>
                            <input
                              type="text"
                              value={income2}
                              onChange={(e) => setIncome2(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>

                          {/* Среднемес. доход за 3-й год */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Среднемес. доход за 3-й год, ₽
                            </label>
                            <input
                              type="text"
                              value={income3}
                              onChange={(e) => setIncome3(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Контент для вкладки "Сумма" */}
                    {activeTab === 'amount' && (
                      <div className="space-y-8">
                        {/* Первая строка: основные параметры кредита */}
                        <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {/* Ежемесячный платеж */}
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

                          {/* Срок кредита/займа */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Срок кредита/займа
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center">
                                <DurationSelect 
                                  value={getWordForm(parseInt(term) || 0, periodType)} 
                                  onChange={(value) => {
                                    setPeriodType(value === 'год' || value === 'года' || value === 'лет' ? 'year' : 'month');
                                  }}
                                  term={term}
                                />
                              </div>
                            </div>
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
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>
                        </div>

                        {/* Вторая строка: доходы */}
                        <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {/* Среднемес. доход за 1-й год */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Среднемес. доход за 1-й год, ₽
                            </label>
                            <input
                              type="text"
                              value={income1}
                              onChange={(e) => setIncome1(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>

                          {/* Среднемес. доход за 2-й год */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Среднемес. доход за 2-й год, ₽
                            </label>
                            <input
                              type="text"
                              value={income2}
                              onChange={(e) => setIncome2(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>

                          {/* Среднемес. доход за 3-й год */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Среднемес. доход за 3-й год, ₽
                            </label>
                            <input
                              type="text"
                              value={income3}
                              onChange={(e) => setIncome3(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Контент для вкладки "Срок" */}
                    {activeTab === 'term' && (
                      <div className="space-y-8">
                        {/* Первая строка: основные параметры кредита */}
                        <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {/* Сумма кредита/займа */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Сумма кредита/займа, ₽
                            </label>
                            <input
                              type="text"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>

                          {/* Ежемесячный платеж */}
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

                          {/* Процентная ставка */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Процентная ставка, % годовых
                            </label>
                            <input
                              type="text"
                              value={rate}
                              onChange={(e) => setRate(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>
                        </div>

                        {/* Вторая строка: доход */}
                        <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {/* Среднемесячный доход */}
                          <div className="space-y-2">
                            <label className="block text-label text-gray-700 pl-10">
                              Среднемесячный доход, ₽
                            </label>
                            <input
                              type="text"
                              value={averageIncome}
                              onChange={(e) => setAverageIncome(e.target.value)}
                              className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Результаты */}
              <div className="text-white rounded-[30px] max-w-container mx-auto" style={{ backgroundColor: '#101568' }}>
                <div className="max-w-container mx-auto px-6 md:px-10 lg:px-9 laptop:px-[60px] py-6 md:py-8 lg:py-6 laptop:py-[30px]">
                  {/* Результаты для вкладки "Ежемесячный платеж" */}
                  {activeTab === 'monthly' && (
                    <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Ежемесячный платеж</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(calculatedMonthlyPayment)}₽</div>
                      </div>
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Совокупный средний доход</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(averageIncomeValue)}₽</div>
                      </div>
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Долговая нагрузка</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatDecimal(debtBurden, 1)}%</div>
                      </div>
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Остаток ежемесячного дохода после выплат</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(remainingIncome)}₽</div>
                      </div>
                    </div>
                  )}

                  {/* Результаты для вкладки "Сумма" */}
                  {activeTab === 'amount' && (
                    <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Сумма</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(calculatedAmount)}₽</div>
                      </div>
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Совокупный средний доход</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(averageIncomeValue)}₽</div>
                      </div>
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Долговая нагрузка</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatDecimal(debtBurden, 1)}%</div>
                      </div>
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Остаток ежемесячного дохода после выплат</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(remainingIncome)}₽</div>
                      </div>
                    </div>
                  )}

                  {/* Результаты для вкладки "Срок" */}
                  {activeTab === 'term' && (
                    <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Срок</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatTermInMonths(calculatedTerm)}</div>
                      </div>
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Среднемесячный доход</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(parseFloat(averageIncome.replace(/[^\d]/g, '')) || 0)}₽</div>
                      </div>
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Долговая нагрузка</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatDecimal(((parseFloat(monthlyPayment.replace(/[^\d]/g, '')) || 0) / (parseFloat(averageIncome.replace(/[^\d]/g, '')) || 1) * 100), 1)}%</div>
                      </div>
                      <div className="space-y-0 sm:space-y-1 flex flex-col items-start">
                        <div className="text-[18px] font-medium opacity-80 leading-tight line-clamp-2 min-h-[36px] sm:min-h-[44px] flex items-start">Остаток ежемесячного дохода после выплат</div>
                        <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber((parseFloat(averageIncome.replace(/[^\d]/g, '')) || 0) - (parseFloat(monthlyPayment.replace(/[^\d]/g, '')) || 0))}₽</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Уведомления о кредитоспособности */}
              {creditAlert && (
                <div className="max-w-container mx-auto">
                  <CreditAlert ref={alertRef} alert={creditAlert} />
                </div>
              )}
              
              {/* Блок предложений */}
              <OffersBlock type="credit" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Плавающая кнопка-индикатор */}
      {creditAlert && (
        <FloatingCreditButton
          alert={creditAlert}
          onClick={scrollToAlert}
          isVisible={true}
        />
      )}
    </CalculatorPageLayout>
  );
} 