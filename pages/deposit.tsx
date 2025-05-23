import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import DurationSelect from '../components/DurationSelect';
import DatePickerInput from '../components/DatePickerInput';

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

export default function DepositPage() {
  const [term, setTerm] = useState('1');
  const [periodType, setPeriodType] = useState<'year' | 'month'>('year');
  const [startDate, setStartDate] = useState(new Date());

  // Получаем текущее окончание в зависимости от числа
  const currentPeriod = getWordForm(parseInt(term) || 0, periodType);

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '' || parseInt(value) <= 100) {
      setTerm(value);
    }
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
                            defaultValue="1000000"
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
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
                        </div>

                        {/* Процентная ставка */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Процентная ставка, % годовых
                          </label>
                          <input
                            type="text"
                            defaultValue="5,00"
                            className="w-full h-[60px] pl-10 rounded-[30px] bg-[#E9F5FF] border-0 focus:ring-2 focus:ring-accent-blue text-[22px]"
                          />
                        </div>

                        {/* Дата открытия */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">
                            Дата открытия
                          </label>
                          <DatePickerInput value={startDate} onChange={setStartDate} />
                        </div>

                        {/* Чекбоксы */}
                        <div className="pt-[30px]">
                          <label className="flex h-[60px]">
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                className="mt-1 h-[20px] w-[20px] min-w-[20px] min-h-[20px] rounded border-2 border-[#CEE1F0] text-[#CEE1F0] focus:ring-2 focus:ring-[#CEE1F0] checked:bg-[#CEE1F0] checked:hover:bg-[#CEE1F0] checked:focus:bg-[#CEE1F0]"
                              />
                              <span className="ml-[20px] text-[18px] text-gray-700">
                                Начисление процентов с&nbsp;учетом капитализации
                              </span>
                            </div>
                          </label>
                        </div>

                        <div className="pt-[30px]">
                          <label className="flex h-[60px]">
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                className="mt-1 h-[20px] w-[20px] min-w-[20px] min-h-[20px] rounded border-2 border-[#CEE1F0] text-[#CEE1F0] focus:ring-2 focus:ring-[#CEE1F0] checked:bg-[#CEE1F0] checked:hover:bg-[#CEE1F0] checked:focus:bg-[#CEE1F0]"
                              />
                              <span className="ml-[20px] text-[18px] text-gray-700">
                                Досрочное закрытие вклада
                              </span>
                            </div>
                          </label>
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
                    <div className="grid gap-[70px] md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <div className="text-[18px] font-medium opacity-80">Сумма в конце срока</div>
                        <div className="text-[28px] font-semibold">1 050 000 ₽</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[18px] font-medium opacity-80">Доход</div>
                        <div className="text-[28px] font-semibold">50 000 ₽</div>
                      </div>
                      <div className="space-y-2 md:col-span-2 lg:col-span-1">
                        <button
                          type="button"
                          className="w-full h-[60px] bg-white text-[18px] text-accent-blue rounded-[30px] hover:bg-blue-50 transition-colors"
                        >
                          График начислений
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 