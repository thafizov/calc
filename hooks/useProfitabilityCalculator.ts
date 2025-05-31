import { useState, useEffect } from 'react';

// Типы для ошибок валидации
interface ProfitabilityErrors {
  amount?: string;
  startDate?: string;
  endDate?: string;
}

// Тип для результатов расчета
interface ProfitabilityResult {
  instrument: string;
  finalAmount: number;
  profit: number;
  profitPercentage: number;
  inflationAdjustedProfit?: number;
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

// Функция расчета доходности депозита
const calculateDepositReturn = (
  amount: number, 
  months: number, 
  rate: number = 6.0, // Базовая ставка депозита
  isCapitalized: boolean = false
): number => {
  const monthlyRate = rate / 100 / 12;
  
  if (isCapitalized) {
    // Формула сложных процентов
    return amount * Math.pow(1 + monthlyRate, months);
  } else {
    // Простые проценты
    return amount * (1 + (rate / 100) * (months / 12));
  }
};

// Функция расчета доходности облигаций (примерная)
const calculateBondReturn = (
  amount: number,
  months: number,
  bondType: string
): number => {
  let rate = 7.5; // Базовая доходность
  
  // Корректировка в зависимости от типа облигаций
  switch (bondType) {
    case 'ofz':
      rate = 7.5;
      break;
    case 'corporate':
      rate = 9.0;
      break;
    case 'municipal':
      rate = 6.5;
      break;
    default:
      rate = 7.5;
  }
  
  const monthlyRate = rate / 100 / 12;
  return amount * Math.pow(1 + monthlyRate, months);
};

// Функция расчета доходности акций (примерная, очень волатильная)
const calculateStockReturn = (
  amount: number,
  months: number
): number => {
  // Примерная средняя доходность фондового рынка 12% годовых
  const rate = 12.0;
  const monthlyRate = rate / 100 / 12;
  
  // Добавляем элемент случайности для имитации волатильности
  const volatilityFactor = 0.8 + Math.random() * 0.4; // От 0.8 до 1.2
  
  return amount * Math.pow(1 + monthlyRate, months) * volatilityFactor;
};

// Основной хук
export const useProfitabilityCalculator = () => {
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
  const [results, setResults] = useState<ProfitabilityResult[]>([]);
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

  // Вычисление результатов
  useEffect(() => {
    const cleanAmount = amount.replace(/[^\d]/g, '');
    const numAmount = parseInt(cleanAmount) || 0;
    
    if (numAmount === 0 || !startDate || !endDate) {
      setResults([]);
      return;
    }

    const months = calculateMonthsBetween(startDate, endDate);
    if (months <= 0) {
      setResults([]);
      return;
    }

    const newResults: ProfitabilityResult[] = [];

    // Расчет депозитов
    if (depositsChecked) {
      const finalAmount = calculateDepositReturn(numAmount, months, 6.0, true);
      const profit = finalAmount - numAmount;
      const profitPercentage = (profit / numAmount) * 100;
      
      let inflationAdjustedProfit;
      if (inflationEnabled) {
        const inflationRate = 4.0; // Предполагаемая инфляция 4% годовых
        const realRate = 6.0 - inflationRate;
        const realFinalAmount = calculateDepositReturn(numAmount, months, realRate, true);
        inflationAdjustedProfit = ((realFinalAmount - numAmount) / numAmount) * 100;
      }

      newResults.push({
        instrument: 'Депозит',
        finalAmount,
        profit,
        profitPercentage,
        inflationAdjustedProfit
      });
    }

    // Расчет облигаций
    if (bondsChecked) {
      const finalAmount = calculateBondReturn(numAmount, months, bondType);
      const profit = finalAmount - numAmount;
      const profitPercentage = (profit / numAmount) * 100;

      let inflationAdjustedProfit;
      if (inflationEnabled) {
        const inflationRate = 4.0; // Предполагаемая инфляция 4% годовых
        // Получаем базовую ставку облигаций
        let bondRate = 7.5;
        switch (bondType) {
          case 'ofz':
            bondRate = 7.5;
            break;
          case 'corporate':
            bondRate = 9.0;
            break;
          case 'municipal':
            bondRate = 6.5;
            break;
          default:
            bondRate = 7.5;
        }
        const realRate = bondRate - inflationRate;
        const realFinalAmount = calculateBondReturn(numAmount, months, bondType);
        // Пересчитываем с учетом реальной ставки
        const realMonthlyRate = realRate / 100 / 12;
        const realFinalAmountAdjusted = numAmount * Math.pow(1 + realMonthlyRate, months);
        inflationAdjustedProfit = ((realFinalAmountAdjusted - numAmount) / numAmount) * 100;
      }

      newResults.push({
        instrument: 'Облигации',
        finalAmount,
        profit,
        profitPercentage,
        inflationAdjustedProfit
      });
    }

    // Расчет акций
    if (stocksChecked) {
      const finalAmount = calculateStockReturn(numAmount, months);
      const profit = finalAmount - numAmount;
      const profitPercentage = (profit / numAmount) * 100;

      let inflationAdjustedProfit;
      if (inflationEnabled) {
        const inflationRate = 4.0; // Предполагаемая инфляция 4% годовых
        const stockRate = 12.0; // Базовая доходность акций
        const realRate = stockRate - inflationRate;
        const realMonthlyRate = realRate / 100 / 12;
        // Применяем тот же volatilityFactor что и в основном расчете
        const volatilityFactor = 0.8 + Math.random() * 0.4;
        const realFinalAmount = numAmount * Math.pow(1 + realMonthlyRate, months) * volatilityFactor;
        inflationAdjustedProfit = ((realFinalAmount - numAmount) / numAmount) * 100;
      }

      newResults.push({
        instrument: 'Акции',
        finalAmount,
        profit,
        profitPercentage,
        inflationAdjustedProfit
      });
    }

    setResults(newResults);
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
    // Состояния формы
    amount,
    startDate,
    endDate,
    errors,
    
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
    
    // Обработчики
    setAmount: handleAmountChange,
    setDateRange: handleDateRangeChange,
    
    // Утилиты
    formatNumber,
  };
}; 