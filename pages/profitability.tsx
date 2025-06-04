import { getAssetPath } from "../utils/paths";
import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import CalculatorPageLayout from '../components/shared/CalculatorPageLayout';
import OffersBlock from '../components/shared/OffersBlock';
import DateRangePicker from '../components/DateRangePicker';
import InflationSelect from '../components/InflationSelect';
import DepositTermSelect from '../components/DepositTermSelect';
import BondTypeSelect from '../components/BondTypeSelect';
import CustomCheckbox from '../components/CustomCheckbox';
import ProfitabilityChart from '../components/ProfitabilityChart';
import { useProfitabilityCalculator } from '../hooks/useProfitabilityCalculator';
import { formatDecimal } from '../utils/formatNumber';

export default function ProfitabilityPage() {
  const {
    // Состояния формы
    amount,
    startDate,
    endDate,
    errors,
    
    // Состояние загрузки
    isLoading,
    
    // Настройки
    inflationEnabled,
    setInflationEnabled,
    depositTerm,
    setDepositTerm,
    bondType,
    setBondType,
    
    // Инструменты
    depositsChecked,
    setDepositsChecked,
    bondsChecked,
    setBondsChecked,
    stocksChecked,
    setStocksChecked,
    
    // Результаты
    results,
    monthlyChartData,
    
    // Обработчики
    setAmount,
    setDateRange,
    
    // Утилиты
    formatNumber,
  } = useProfitabilityCalculator();

  // Ref для скролла к графику
  const scheduleRef = React.useRef<HTMLDivElement>(null);

  // Состояние видимости результатов (пока оставляем для совместимости)
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleToggleSchedule = () => {
    setIsVisible(!isVisible);
    
    // Если показываем график, скроллим к нему через небольшую задержку
    if (!isVisible) {
      setTimeout(() => {
        scheduleRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  };

  return (
    <CalculatorPageLayout>
      <Head>
        <title>Калькулятор доходности</title>
        <meta 
          name="description" 
          content="Позволяет оценить, сколько вы могли бы заработать, если бы вложились в разные виды активов в прошлом. Сравнивая доходность, не забывайте, что такая же прибыльность в будущем не гарантирована." 
        />
      </Head>
      
      <div className="min-h-screen" style={{ backgroundColor: '#7880FF' }}>
        <div className="relative pt-8 md:pt-10 lg:pt-10 laptop:pt-12 px-4 max-w-container mx-auto lg:scale-90 lg:origin-top">
          <div className="block md:grid md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
            {/* Левая колонка с текстом */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center px-[30px] py-[5px] text-white text-subhead rounded-[30px]" style={{ backgroundColor: '#101568' }}>
                Бесплатный и понятный
              </div>
              
              <h1 className="text-head text-white mt-1.5 md:mt-2.5 leading-tight md:leading-normal">
                ИСПОЛЬЗУЙ НАШ<br />
                КАЛЬКУЛЯТОР ДОХОДНОСТИ
              </h1>
              
              <p className="text-subhead text-white/80 mt-1.5 md:mt-6 lg:mt-10 mb-12 md:mb-16 lg:mb-0">
                Позволяет оценить, сколько вы могли бы заработать, если бы вложились в разные виды активов в прошлом. 
                Сравнивая доходность, не забывайте, что такая же прибыльность в будущем не гарантирована.
              </p>
            </div>

            {/* Правая колонка с картинкой */}
            <div className="hidden md:block lg:col-span-7 relative h-[300px] md:h-[400px]">
              <Image 
                src={getAssetPath("/img/calc.png")}
                alt="Калькулятор доходности"
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
          <div className="relative -mt-4 md:-mt-8 lg:-mt-12">
            <div className="relative z-10">
              <div className="bg-white rounded-[30px] shadow-lg max-w-container mx-auto">
                <div className="max-w-container mx-auto px-6 md:px-10 lg:px-9 laptop:px-[60px] py-12 md:py-16 lg:py-14 laptop:py-[80px]">
                  <form className="space-y-20">
                    <div className="grid gap-4 md:gap-6 lg:gap-11 laptop:gap-[70px] grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                      {/* Сумма вложений */}
                      <div className="space-y-2">
                        <label className="block text-label text-gray-700 pl-10">
                          Сумма вложений, ₽
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

                      {/* Период (теперь через датапикер) */}
                      <div className="space-y-2">
                        <label className="block text-label text-gray-700 pl-10">
                          Период
                        </label>
                        <DateRangePicker
                          startDate={startDate}
                          endDate={endDate}
                          onChange={setDateRange}
                          error={errors.startDate || errors.endDate}
                        />
                        {(errors.startDate || errors.endDate) && (
                          <div className="text-red-500 text-sm pl-10">{errors.startDate || errors.endDate}</div>
                        )}
                      </div>

                      {/* Учет инфляции */}
                      <div className="space-y-2">
                        <label className="block text-label text-gray-700 pl-10">
                          Учет инфляции
                        </label>
                        <InflationSelect
                          value={inflationEnabled}
                          onChange={setInflationEnabled}
                        />
                      </div>
                    </div>

                    {/* Выберите инструменты */}
                    <div className="space-y-6">
                      <h3 className="text-[20px] font-semibold text-gray-900">Выберите инструменты</h3>
                      
                      <div className="grid gap-x-4 gap-y-2 md:gap-x-6 md:gap-y-3 lg:gap-x-8 lg:gap-y-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                        {/* Депозиты */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">&nbsp;</label>
                          <CustomCheckbox
                            checked={depositsChecked}
                            onChange={setDepositsChecked}
                            label="Депозиты"
                          />
                        </div>
                        
                        {/* Срок депозита */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">Срок депозита</label>
                          <DepositTermSelect
                            value={depositTerm}
                            onChange={setDepositTerm}
                            disabled={!depositsChecked}
                          />
                        </div>
                        
                        {/* Пустая ячейка - скрываем на sm и показываем только на xl */}
                        <div className="hidden xl:block"></div>

                        {/* Облигации */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">&nbsp;</label>
                          <CustomCheckbox
                            checked={bondsChecked}
                            onChange={setBondsChecked}
                            label="Облигации"
                          />
                        </div>
                        
                        {/* Вид облигаций */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">Вид облигаций</label>
                          <BondTypeSelect
                            value={bondType}
                            onChange={setBondType}
                            disabled={!bondsChecked}
                          />
                        </div>
                        
                        {/* Пустая ячейка - скрываем на sm и показываем только на xl */}
                        <div className="hidden xl:block"></div>

                        {/* Акции */}
                        <div className="space-y-2">
                          <label className="block text-label text-gray-700 pl-10">&nbsp;</label>
                          <CustomCheckbox
                            checked={stocksChecked}
                            onChange={setStocksChecked}
                            label="Акции"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Индикатор загрузки */}
              {isLoading && (
                <div className="text-white rounded-[30px] max-w-container mx-auto" style={{ backgroundColor: '#101568' }}>
                  <div className="max-w-container mx-auto px-6 md:px-10 lg:px-9 laptop:px-[60px] pt-6 md:pt-8 lg:pt-6 laptop:pt-[30px] pb-6 md:pb-8 lg:pb-6 laptop:pb-[30px]">
                    <div className="text-center">
                      <div className="text-[18px] font-medium opacity-80">Загружаем данные...</div>
                      <div className="mt-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Результаты */}
              {!isLoading && results.length > 0 && (
                <div>
                  {results.map((result, index) => (
                    <div key={index} className="text-white rounded-[30px] max-w-container mx-auto" style={{ backgroundColor: '#101568' }}>
                      <div className="max-w-container mx-auto px-6 md:px-10 lg:px-9 laptop:px-[60px] pt-6 md:pt-8 lg:pt-6 laptop:pt-[30px] pb-6 md:pb-8 lg:pb-6 laptop:pb-[30px]">
                        <div className={`grid gap-4 md:gap-6 lg:gap-8 laptop:gap-[50px] grid-cols-1 sm:grid-cols-2 ${inflationEnabled ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
                          <div className="space-y-1">
                            <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Инструмент</div>
                            <div className="text-[28px] font-semibold whitespace-nowrap">{result.instrument}</div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Сумма в конце срока</div>
                            <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(result.finalAmount)} ₽</div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Доход</div>
                            <div className="text-[28px] font-semibold whitespace-nowrap">{formatNumber(result.profit)} ₽</div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Доход, %</div>
                            <div className="text-[28px] font-semibold whitespace-nowrap">{formatDecimal(result.profitPercentage)} %</div>
                          </div>

                          {inflationEnabled && result.inflationAdjustedProfit !== undefined && (
                            <div className="space-y-1">
                              <div className="text-[18px] font-medium opacity-80 whitespace-nowrap">Реальный доход, %</div>
                              <div className="text-[28px] font-semibold whitespace-nowrap">{formatDecimal(result.inflationAdjustedProfit)} %</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* График доходности */}
              {!isLoading && results.length > 0 && (
                <ProfitabilityChart
                  results={results}
                  inflationEnabled={inflationEnabled}
                  startDate={startDate}
                  endDate={endDate}
                  monthlyChartData={monthlyChartData}
                />
              )}
              
              {/* Блок предложений */}
              <OffersBlock type="investment" />
            </div>
          </div>
        </div>
      </div>
    </CalculatorPageLayout>
  );
} 