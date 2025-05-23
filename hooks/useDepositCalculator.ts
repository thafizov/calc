import { useState, useEffect } from 'react';

// Типы
export type CapitalizationPeriod = 'monthly' | 'quarterly' | 'yearly' | null;

// Типы
export interface ScheduleItem {
  date: string;
  interest: number;
  balance: number;
  isCapitalization: boolean; // флаг для отметки периодов капитализации
}

interface DepositErrors {
  amount?: string;
  term?: string;
  rate?: string;
  startDate?: string;
}

// Утилиты для валидации
const validateAmount = (value: string): string | undefined => {
  const amount = parseFloat(value.replace(/[^\d.]/g, ''));
  if (isNaN(amount)) return 'Введите корректную сумму';
  if (amount < 1) return 'Минимальная сумма вклада 1 ₽';
  if (amount > 10_000_000) return 'Максимальная сумма вклада 10 000 000 ₽';
  return undefined;
};

const validateTerm = (months: number): string | undefined => {
  if (months <= 0) return 'Срок вклада должен быть больше 0';
  if (months > 60) return 'Максимальный срок вклада 60 месяцев';
  return undefined;
};

const validateRate = (value: string): string | undefined => {
  const rate = parseFloat(value.replace(',', '.'));
  if (isNaN(rate)) return 'Введите корректную ставку';
  if (rate < 0.01) return 'Минимальная ставка 0.01%';
  if (rate > 50) return 'Максимальная ставка 50%';
  return undefined;
};

// Форматирование чисел
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Форматирование суммы вклада
const formatAmount = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  const amount = parseInt(numbers) || 0;
  return new Intl.NumberFormat('ru-RU').format(amount);
};

// Форматирование процентной ставки
const formatRate = (value: string): string => {
  // Разрешаем пустую строку при удалении
  if (value === '') return '';
  
  // Заменяем запятую на точку и убираем все кроме цифр и точки
  const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
  
  // Если это просто точка, возвращаем как есть
  if (cleanValue === '.') return cleanValue;
  
  // Если есть точка, ограничиваем количество знаков после неё
  if (cleanValue.includes('.')) {
    const [whole, decimal] = cleanValue.split('.');
    return `${whole}.${(decimal || '').slice(0, 2)}`;
  }
  
  // Для целого числа
  const rate = parseFloat(cleanValue);
  return isNaN(rate) ? '' : rate.toString();
};

// Основной хук
export const useDepositCalculator = () => {
  // Существующие состояния
  const [amount, setAmount] = useState<string>(formatAmount('1000000'));
  const [term, setTerm] = useState<string>('1');
  const [periodType, setPeriodType] = useState<'year' | 'month'>('year');
  const [rate, setRate] = useState<string>('5.00');
  const [startDate, setStartDate] = useState<Date>(new Date());
  
  // Новые состояния для капитализации
  const [isCapitalized, setIsCapitalized] = useState<boolean>(false);
  const [capitalizationPeriod, setCapitalizationPeriod] = useState<CapitalizationPeriod>(null);
  
  const [total, setTotal] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [effectiveRate, setEffectiveRate] = useState<number>(0);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [errors, setErrors] = useState<DepositErrors>({});

  // Обработчики изменения значений с валидацией
  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setAmount(formatAmount(cleanValue));
    setErrors(prev => ({ ...prev, amount: validateAmount(cleanValue) }));
  };

  const handleTermChange = (value: string) => {
    if (value === '' || /^\d{1,3}$/.test(value)) {
      setTerm(value);
      const months = convertToMonths(value, periodType);
      setErrors(prev => ({ ...prev, term: validateTerm(months) }));
    }
  };

  const handleRateChange = (value: string) => {
    const formattedRate = formatRate(value);
    setRate(formattedRate);
    
    // Валидируем только если поле не пустое и не в процессе ввода (с точкой на конце)
    if (formattedRate && !formattedRate.endsWith('.')) {
      setErrors(prev => ({ ...prev, rate: validateRate(formattedRate) }));
    } else {
      setErrors(prev => ({ ...prev, rate: undefined }));
    }
  };

  // Конвертация периода в месяцы
  const convertToMonths = (value: string, type: 'year' | 'month'): number => {
    const numValue = parseInt(value) || 0;
    return type === 'year' ? numValue * 12 : numValue;
  };

  // Обработчик изменения капитализации
  const handleCapitalizationChange = (value: boolean) => {
    setIsCapitalized(value);
    if (!value) {
      setCapitalizationPeriod(null);
    }
  };

  // Расчет процентов и графика
  useEffect(() => {
    const calculateDeposit = () => {
      // Проверяем наличие ошибок
      if (Object.values(errors).some(error => error !== undefined)) {
        return;
      }

      const depositAmount = parseFloat(amount.replace(/[^\d]/g, ''));
      const depositRate = parseFloat(rate.replace(',', '.'));
      const months = convertToMonths(term, periodType);
      const years = months / 12;

      if (isNaN(depositAmount) || isNaN(depositRate) || months <= 0) {
        return;
      }

      let totalAmount = depositAmount;
      let totalProfit = 0;
      const scheduleItems: ScheduleItem[] = [];
      let currentDate = new Date(startDate);

      // Добавляем начальную запись
      scheduleItems.push({
        date: currentDate.toLocaleDateString('ru-RU'),
        interest: 0,
        balance: depositAmount,
        isCapitalization: false
      });

      if (isCapitalized && capitalizationPeriod) {
        // Расчет с капитализацией
        const periodsInYear = {
          monthly: 12,
          quarterly: 4,
          yearly: 1
        }[capitalizationPeriod];

        const periodRate = depositRate / 100 / periodsInYear;
        const totalPeriods = (months / 12) * periodsInYear;
        
        // Расчет итоговой суммы по формуле сложных процентов
        totalAmount = depositAmount * Math.pow(1 + periodRate, totalPeriods);
        totalProfit = totalAmount - depositAmount;

        // Построение графика платежей
        let currentBalance = depositAmount;
        const periodMonths = {
          monthly: 1,
          quarterly: 3,
          yearly: 12
        }[capitalizationPeriod];

        for (let i = 1; i <= months; i++) {
          currentDate = new Date(startDate);
          currentDate.setMonth(currentDate.getMonth() + i);

          const isCapitalizationMonth = i % periodMonths === 0;
          
          if (isCapitalizationMonth) {
            // Расчет процентов на дату капитализации
            const periodsCompleted = i / periodMonths;
            const newBalance = depositAmount * Math.pow(1 + periodRate, periodsCompleted);
            const interest = newBalance - currentBalance;
            currentBalance = newBalance;
            
            scheduleItems.push({
              date: currentDate.toLocaleDateString('ru-RU'),
              interest,
              balance: currentBalance,
              isCapitalization: true
            });
          } else {
            // В промежуточные месяцы показываем начисленные проценты без капитализации
            const monthlyRate = depositRate / 100 / 12;
            const interest = currentBalance * monthlyRate;
            
            scheduleItems.push({
              date: currentDate.toLocaleDateString('ru-RU'),
              interest,
              balance: currentBalance,
              isCapitalization: false
            });
          }
        }

        // Расчет эффективной ставки
        const years = months / 12;
        setEffectiveRate(((Math.pow(totalAmount / depositAmount, 1 / years) - 1) * 100));
      } else {
        // Расчет без капитализации
        const yearlyProfit = depositAmount * (depositRate / 100);
        const monthlyProfit = yearlyProfit / 12;
        totalProfit = monthlyProfit * months;
        totalAmount = depositAmount + totalProfit;

        for (let i = 1; i <= months; i++) {
          currentDate = new Date(startDate);
          currentDate.setMonth(currentDate.getMonth() + i);
          
          scheduleItems.push({
            date: currentDate.toLocaleDateString('ru-RU'),
            interest: monthlyProfit,
            balance: depositAmount + (monthlyProfit * i),
            isCapitalization: false
          });
        }

        // Для вклада без капитализации эффективная ставка равна номинальной
        setEffectiveRate(depositRate);
      }

      setTotal(totalAmount);
      setProfit(totalProfit);
      setSchedule(scheduleItems);
    };

    calculateDeposit();
  }, [amount, term, periodType, rate, startDate, isCapitalized, capitalizationPeriod, errors]);

  return {
    // Существующие состояния
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

    // Существующие методы
    setAmount: handleAmountChange,
    setTerm: handleTermChange,
    setPeriodType,
    setRate: handleRateChange,
    setStartDate,
    setIsVisible,
    
    // Новые состояния и методы для капитализации
    isCapitalized,
    capitalizationPeriod,
    setIsCapitalized: handleCapitalizationChange,
    setCapitalizationPeriod,
    
    // Утилиты
    formatNumber,
  };
}; 