import { useState, useEffect } from 'react';
import { 
  fetchProfitabilityData, 
  formatDateForApi,
  parseApiDate,
  calculateDepositProfitability,
  calculateBondProfitability,
  calculateStockProfitability,
  calculateInflationAdjustedProfitability,
  type ProfitabilityDataResponse
} from '../services/profitabilityDataService';

// Типы для ошибок валидации
interface ProfitabilityErrors {
  amount?: string;
  startDate?: string;
  endDate?: string;
}

// Тип для месячных данных графика
interface MonthlyChartData {
  month: string; // "2024-01"
  [instrumentName: string]: string | number; // "Депозит": 5.2, "Облигации": 3.1, etc.
}

// Тип для результатов расчета
interface ProfitabilityResult {
  instrument: string;
  finalAmount: number;
  profit: number;
  profitPercentage: number;
  inflationAdjustedProfit?: number;
  monthlyData?: { month: string; cumulativeReturn: number; value?: number }[]; // Для графика
}

// Тип для параметров калькулятора
interface CalculatorParams {
  amount: string;
  startDate: string;
  endDate: string;
  instruments: string[];
}

// Функция форматирования чисел
const formatAmount = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '');
  if (cleanValue === '') return '';
  
  const number = parseInt(cleanValue);
  return number.toLocaleString('ru-RU');
};

// Функция валидации суммы
const validateAmount = (value: string): string | undefined => {
  const cleanValue = value.replace(/[^\d]/g, '');
  const numValue = parseInt(cleanValue) || 0;
  
  if (numValue === 0) {
    return 'Укажите сумму вложений';
  }
  if (numValue < 1000) {
    return 'Минимальная сумма 1 000 ₽';
  }
  if (numValue > 100000000) {
    return 'Максимальная сумма 100 000 000 ₽';
  }
  return undefined;
};

// Функция валидации дат
const validateDates = (startDate: Date | null, endDate: Date | null): { startDate?: string; endDate?: string } => {
  const errors: { startDate?: string; endDate?: string } = {};
  
  if (!startDate) {
    errors.startDate = 'Выберите начальную дату периода';
  }
  
  if (!endDate) {
    errors.endDate = 'Выберите конечную дату периода';
  }
  
  if (startDate && endDate) {
    if (startDate >= endDate) {
      errors.endDate = 'Конечная дата должна быть больше начальной';
    }
    
    // Проверяем что период не слишком короткий (минимум 1 месяц)
    const diffInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
    
    if (diffInMonths < 1) {
      errors.endDate = 'Минимальный период 1 месяц';
    }
    
    // Проверяем что период не слишком длинный (максимум 30 лет)
    if (diffInMonths > 360) {
      errors.endDate = 'Максимальный период 30 лет';
    }
  }
  
  return errors;
};

// Функция расчета количества месяцев между датами
const calculateMonthsBetween = (startDate: Date, endDate: Date): number => {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
         (endDate.getMonth() - startDate.getMonth());
};

// Экспортируем результаты хука
export interface UseProfitabilityCalculatorResult {
  results: ProfitabilityResult[];
  isLoading: boolean;
  error: string | null;
  monthlyChartData: MonthlyChartData[];
}

// Основной хук для расчетов
export const useProfitabilityCalculator = (): {
  // Состояния формы
  amount: string;
  startDate: Date | null;
  endDate: Date | null;
  errors: ProfitabilityErrors;
  
  // Состояние загрузки
  isLoading: boolean;
  error: string | null;
  
  // Настройки
  inflationEnabled: boolean;
  setInflationEnabled: (enabled: boolean) => void;
  depositTerm: string;
  setDepositTerm: (term: string) => void;
  bondType: string;
  setBondType: (type: string) => void;
  
  // Инструменты
  depositsChecked: boolean;
  setDepositsChecked: (checked: boolean) => void;
  bondsChecked: boolean;
  setBondsChecked: (checked: boolean) => void;
  stocksChecked: boolean;
  setStocksChecked: (checked: boolean) => void;
  
  // Результаты
  results: ProfitabilityResult[];
  monthlyChartData: MonthlyChartData[];
  
  // Обработчики
  setAmount: (value: string) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  
  // Утилиты
  formatNumber: (num: number) => string;
} => {
  const [results, setResults] = useState<ProfitabilityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyChartData[]>([]);

  // Состояния формы
  const [amount, setAmount] = useState<string>(formatAmount('1000000'));
  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 5, 1)); // Июнь 2024
  const [endDate, setEndDate] = useState<Date | null>(new Date(2025, 4, 1)); // Май 2025
  
  // Состояния настроек
  const [inflationEnabled, setInflationEnabled] = useState<boolean>(false);
  const [depositTerm, setDepositTerm] = useState<string>('less_than_1_year');
  const [bondType, setBondType] = useState<string>('ofz');
  
  // Состояния инструментов
  const [depositsChecked, setDepositsChecked] = useState<boolean>(true);
  const [bondsChecked, setBondsChecked] = useState<boolean>(false);
  const [stocksChecked, setStocksChecked] = useState<boolean>(false);
  
  // Состояния результатов
  const [errors, setErrors] = useState<ProfitabilityErrors>({});

  // Обработчики изменения значений с валидацией
  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setAmount(formatAmount(cleanValue));
    setErrors(prev => ({ ...prev, amount: validateAmount(cleanValue) }));
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    
    const dateErrors = validateDates(start, end);
    setErrors(prev => ({ 
      ...prev, 
      startDate: dateErrors.startDate,
      endDate: dateErrors.endDate 
    }));
  };

  // Функция форматирования чисел для отображения
  const formatNumber = (value: number): string => {
    return Math.round(value).toLocaleString('ru-RU');
  };

  // Автоматическая валидация дат при изменении
  useEffect(() => {
    const dateErrors = validateDates(startDate, endDate);
    setErrors(prev => ({ 
      ...prev, 
      startDate: dateErrors.startDate,
      endDate: dateErrors.endDate 
    }));
  }, [startDate, endDate]);

  // Вычисление результатов с реальными данными
  useEffect(() => {
    const calculateResults = async () => {
      console.log('🔄 Starting calculation...');
      
      const cleanAmount = amount.replace(/[^\d]/g, '');
      const numAmount = parseInt(cleanAmount) || 0;
      
      console.log('💰 Amount:', numAmount);
      console.log('📅 Dates:', { startDate, endDate });
      console.log('🎯 Selected instruments:', { depositsChecked, bondsChecked, stocksChecked, inflationEnabled });
      
      if (numAmount === 0 || !startDate || !endDate) {
        console.log('❌ Missing data, clearing results');
        setResults([]);
        return;
      }

      // Проверяем валидность дат
      const dateErrors = validateDates(startDate, endDate);
      if (dateErrors.startDate || dateErrors.endDate) {
        console.log('❌ Date validation errors:', dateErrors);
        setResults([]);
        return;
      }

      console.log('⏳ Setting loading to true');
      setIsLoading(true);

      try {
        // Определяем какие инструменты нужно загрузить
        const instruments: string[] = [];
        if (depositsChecked) instruments.push('deposits');
        if (bondsChecked) instruments.push('bonds');
        if (stocksChecked) instruments.push('stocks');
        if (inflationEnabled) instruments.push('inflation');

        console.log('📦 Instruments to load:', instruments);

        if (instruments.length === 0) {
          console.log('❌ No instruments selected');
          setResults([]);
          setIsLoading(false);
          return;
        }

        // Загружаем данные
        const requestData = {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          instruments,
          depositTerm,
          bondType
        };
        
        console.log('📡 Fetching data with request:', requestData);
        console.log('🗓️ Actual dates used:', {
          startDateObject: startDate?.toISOString(),
          endDateObject: endDate?.toISOString(),
          startDateFormatted: formatDateForApi(startDate),
          endDateFormatted: formatDateForApi(endDate)
        });
        
        const apiData = await fetchProfitabilityData(requestData);
        
        console.log('📊 Received data:', {
          inflation: apiData.inflation?.length || 0,
          deposits: apiData.deposits?.length || 0,
          bonds: apiData.bonds?.length || 0,
          stocks: apiData.stocks?.length || 0,
        });

        // Логируем примеры данных для каждого инструмента
        if (apiData.deposits?.length) {
          console.log('💳 Deposits data sample:', apiData.deposits.slice(0, 3));
        }
        if (apiData.bonds?.length) {
          console.log('📈 Bonds data sample:', apiData.bonds.slice(0, 3));
        }
        if (apiData.stocks?.length) {
          console.log('📊 Stocks data sample:', apiData.stocks.slice(0, 3));
        }
        if (apiData.inflation?.length) {
          console.log('💹 Inflation data sample:', apiData.inflation.slice(0, 3));
        }

        const newResults: ProfitabilityResult[] = [];
        let allMonthlyData: MonthlyChartData[] = [];

        // Расчет депозитов
        if (depositsChecked && apiData.deposits) {
          console.log('🔢 Calculating deposits...');
          const calculation = calculateDepositProfitability(numAmount, apiData.deposits);
          console.log('💳 Deposit calculation result:', calculation);
          
          let inflationAdjustedProfit;
          if (inflationEnabled && apiData.inflation) {
            inflationAdjustedProfit = calculateInflationAdjustedProfitability(
              calculation.profitPercentage, 
              apiData.inflation
            );
            console.log('💹 Inflation adjusted profit:', inflationAdjustedProfit);
          }

          newResults.push({
            instrument: 'Депозит',
            finalAmount: calculation.finalAmount,
            profit: calculation.profit,
            profitPercentage: calculation.profitPercentage,
            inflationAdjustedProfit,
            monthlyData: calculation.monthlyData
          });
        }

        // Расчет облигаций
        if (bondsChecked && apiData.bonds) {
          console.log('🔢 Calculating bonds...');
          const calculation = calculateBondProfitability(numAmount, apiData.bonds);
          console.log('📈 Bond calculation result:', calculation);
          
          let inflationAdjustedProfit;
          if (inflationEnabled && apiData.inflation) {
            inflationAdjustedProfit = calculateInflationAdjustedProfitability(
              calculation.profitPercentage, 
              apiData.inflation
            );
          }

          newResults.push({
            instrument: 'Облигации',
            finalAmount: calculation.finalAmount,
            profit: calculation.profit,
            profitPercentage: calculation.profitPercentage,
            inflationAdjustedProfit,
            monthlyData: calculation.monthlyData
          });
        }

        // Расчет акций
        if (stocksChecked && apiData.stocks) {
          console.log('🔢 Calculating stocks...');
          const calculation = calculateStockProfitability(numAmount, apiData.stocks);
          console.log('📊 Stock calculation result:', calculation);
          
          let inflationAdjustedProfit;
          if (inflationEnabled && apiData.inflation) {
            inflationAdjustedProfit = calculateInflationAdjustedProfitability(
              calculation.profitPercentage, 
              apiData.inflation
            );
          }

          newResults.push({
            instrument: 'Акции',
            finalAmount: calculation.finalAmount,
            profit: calculation.profit,
            profitPercentage: calculation.profitPercentage,
            inflationAdjustedProfit,
            monthlyData: calculation.monthlyData
          });
        }

        // Генерируем данные для графика
        if (newResults.length > 0 && newResults[0].monthlyData) {
          const months = newResults[0].monthlyData.map(d => d.month);
          allMonthlyData = months.map((month, monthIndex) => {
            const chartDataPoint: MonthlyChartData = { month };
            
            newResults.forEach(result => {
              if (result.monthlyData) {
                const monthData = result.monthlyData.find(d => d.month === month);
                if (monthData) {
                  // Обычная линия доходности
                  chartDataPoint[result.instrument] = monthData.cumulativeReturn;
                  
                  // Линия с учетом инфляции (если включено и есть данные)
                  if (inflationEnabled && result.inflationAdjustedProfit !== undefined && apiData.inflation) {
                    // Рассчитываем накопленную инфляцию от начала периода до текущего месяца
                    let cumulativeInflation = 1;
                    
                    // Берем только данные инфляции от начала периода до текущего месяца включительно
                    for (let i = 0; i <= monthIndex && i < apiData.inflation.length; i++) {
                      cumulativeInflation *= (1 + apiData.inflation[i].value);
                    }
                    
                    // Применяем правильную формулу реальной доходности
                    const nominalReturnDecimal = monthData.cumulativeReturn / 100;
                    const realReturnDecimal = (1 + nominalReturnDecimal) / cumulativeInflation - 1;
                    const realReturn = realReturnDecimal * 100;
                    
                    // Логируем только для первых нескольких месяцев для отладки
                    if (monthIndex < 3) {
                      console.log(`📊 Chart inflation calc for ${month}:`, {
                        monthIndex,
                        nominalReturn: monthData.cumulativeReturn.toFixed(2) + '%',
                        cumulativeInflation: cumulativeInflation.toFixed(4),
                        realReturn: realReturn.toFixed(2) + '%'
                      });
                    }
                    
                    chartDataPoint[`${result.instrument}_inflation`] = realReturn;
                  }
                }
              }
            });
            
            return chartDataPoint;
          });
        }

        console.log('✅ Final results:', newResults);
        console.log('📊 Chart data:', allMonthlyData.slice(0, 3));
        setResults(newResults);
        setMonthlyChartData(allMonthlyData);
      } catch (error) {
        console.error('❌ Error calculating profitability:', error);
        setResults([]);
      } finally {
        console.log('⏹ Setting loading to false');
        setIsLoading(false);
      }
    };

    calculateResults();
  }, [
    amount, 
    startDate, 
    endDate, 
    depositsChecked, 
    bondsChecked, 
    stocksChecked,
    depositTerm,
    bondType,
    inflationEnabled
  ]);

  return {
    results,
    isLoading,
    error,
    monthlyChartData,
    amount,
    startDate,
    endDate,
    errors,
    inflationEnabled,
    setInflationEnabled,
    depositTerm,
    setDepositTerm,
    bondType,
    setBondType,
    depositsChecked,
    setDepositsChecked,
    bondsChecked,
    setBondsChecked,
    stocksChecked,
    setStocksChecked,
    setAmount: handleAmountChange,
    setDateRange: handleDateRangeChange,
    formatNumber,
  };
}; 