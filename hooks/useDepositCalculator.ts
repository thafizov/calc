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
  const [totalInterest, setTotalInterest] = useState<number>(0);
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
    if (value) {
      // Если включаем капитализацию, сразу устанавливаем месячный период по умолчанию
      setIsCapitalized(true);
      setCapitalizationPeriod('monthly');
    } else {
      // Если выключаем, сбрасываем оба значения
      setIsCapitalized(false);
      setCapitalizationPeriod(null);
    }
  };

  // Расчет процентов и графика
  useEffect(() => {
    console.log('=== ВЫЗОВ USEEFFECT ===');
    console.log('isCapitalized:', isCapitalized);
    console.log('capitalizationPeriod:', capitalizationPeriod);
    console.log('Все зависимости:', { amount, term, periodType, rate, startDate });

    const calculateDeposit = () => {
      console.log('=== НАЧАЛО РАСЧЕТА ===');
      // Проверяем наличие ошибок
      if (Object.values(errors).some(error => error !== undefined)) {
        console.log('Есть ошибки валидации, прерываем расчет');
        return;
      }

      const depositAmount = parseFloat(amount.replace(/[^\d]/g, ''));
      const depositRate = parseFloat(rate.replace(',', '.'));
      const months = convertToMonths(term, periodType);
      const years = months / 12;

      if (isNaN(depositAmount) || isNaN(depositRate) || months <= 0) {
        console.log('Некорректные входные данные, прерываем расчет');
        return;
      }

      console.log('Входные данные для расчета:');
      console.log('- Сумма:', depositAmount);
      console.log('- Ставка:', depositRate);
      console.log('- Месяцев:', months);
      console.log('- Лет:', years);

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
        console.log('=== ВХОДНЫЕ ДАННЫЕ ===');
        console.log('Начальная сумма:', depositAmount);
        console.log('Срок в месяцах:', months);
        console.log('Ставка:', depositRate);
        console.log('Период капитализации:', capitalizationPeriod);
        console.log('Дата начала:', startDate);

        const monthsInPeriod = { monthly: 1, quarterly: 3, yearly: 12 }[capitalizationPeriod];
        
        // ОБРАБОТКА ИСКЛЮЧЕНИЙ: Проверяем, возможна ли капитализация
        const isCapitalizationPossible = months >= monthsInPeriod;
        
        if (!isCapitalizationPossible) {
          console.log('=== ИСКЛЮЧЕНИЕ: Срок меньше периода капитализации ===');
          console.log(`Срок: ${months} месяцев, Период капитализации: ${monthsInPeriod} месяцев`);
          
          // Рассчитываем как простые проценты
          const yearlyProfit = depositAmount * (depositRate / 100);
          const monthlyProfit = yearlyProfit / 12;
          totalProfit = monthlyProfit * months;
          totalAmount = depositAmount + totalProfit;
          
          // Эффективная ставка = номинальной ставке
          setEffectiveRate(Number(depositRate));
          
          // Создаем график как для простых процентов
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
        } else {
          // Обычный расчет с капитализацией
          let currentAmount = depositAmount;
          let currentDateCalc = new Date(startDate);
          let remainingMonths = months;

          // Используем правильную формулу сложного процента
          // Для разных периодов капитализации используем разные подходы
          if (capitalizationPeriod === 'monthly') {
            // Ежемесячная капитализация: FV = PV * (1 + r/12)^(12*t)
            totalAmount = depositAmount * Math.pow(1 + depositRate / 100 / 12, months);
          } else if (capitalizationPeriod === 'quarterly') {
            // Ежеквартальная капитализация: FV = PV * (1 + r/4)^(4*t)
            const quarters = months / 3;
            totalAmount = depositAmount * Math.pow(1 + depositRate / 100 / 4, quarters);
          } else if (capitalizationPeriod === 'yearly') {
            // Ежегодная капитализация: FV = PV * (1 + r)^t
            totalAmount = depositAmount * Math.pow(1 + depositRate / 100, years);
          }
          
          totalProfit = totalAmount - depositAmount;

          // Создаём упрощённый график для отображения
          const periodsCount = Math.ceil(months / monthsInPeriod);
          for (let i = 1; i <= periodsCount; i++) {
            const periodMonths = Math.min(i * monthsInPeriod, months);
            
            // Используем ту же формулу что и в основном расчете
            let periodAmount;
            if (capitalizationPeriod === 'monthly') {
              periodAmount = depositAmount * Math.pow(1 + depositRate / 100 / 12, periodMonths);
            } else if (capitalizationPeriod === 'quarterly') {
              const quarters = periodMonths / 3;
              periodAmount = depositAmount * Math.pow(1 + depositRate / 100 / 4, quarters);
            } else if (capitalizationPeriod === 'yearly') {
              const years = periodMonths / 12;
              periodAmount = depositAmount * Math.pow(1 + depositRate / 100, years);
            }
            
            const periodInterest = i === 1 ? periodAmount - depositAmount : periodAmount - scheduleItems[scheduleItems.length - 1].balance;
            
            currentDate = new Date(startDate);
            currentDate.setMonth(currentDate.getMonth() + periodMonths);
            
            scheduleItems.push({
              date: currentDate.toLocaleDateString('ru-RU'),
              interest: periodInterest,
              balance: periodAmount,
              isCapitalization: true
            });
          }

          console.log('=== РЕЗУЛЬТАТЫ РАСЧЕТА ===');
          console.log('Итоговая сумма:', totalAmount);
          console.log('Прибыль:', totalProfit);
          console.log('Срок в годах:', years);
          
          // Расчет эффективной ставки для капитализации
          if (years > 0) {
            const averageAnnualReturn = (totalProfit / depositAmount / years) * 100;
            console.log('Простая среднегодовая доходность:', averageAnnualReturn);
            setEffectiveRate(Math.round(averageAnnualReturn * 100) / 100);
          } else {
            setEffectiveRate(Number(depositRate));
          }
        }
      } else {
        // Расчет без капитализации
        const yearlyProfit = depositAmount * (depositRate / 100);
        const monthlyProfit = yearlyProfit / 12;
        totalProfit = monthlyProfit * months;
        totalAmount = depositAmount + totalProfit;

        console.log("Расчет без капитализации");

        // Расчет графика платежей
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

        // ОБРАБОТКА ИСКЛЮЧЕНИЙ: Расчет эффективной ставки для простых процентов
        if (years > 0) {
          // Для сроков от 1 года - обычный расчет
          const averageAnnualReturn = (totalProfit / depositAmount / years) * 100;
          console.log('Простая среднегодовая доходность без капитализации:', averageAnnualReturn);
          setEffectiveRate(Math.round(averageAnnualReturn * 100) / 100);
        } else {
          // ИСКЛЮЧЕНИЕ: Для сроков меньше года - эффективная ставка = номинальной
          console.log('=== ИСКЛЮЧЕНИЕ: Срок меньше года без капитализации, эффективная ставка = номинальной ===');
          setEffectiveRate(Number(depositRate));
        }
      }

      setTotal(totalAmount);
      setProfit(totalProfit);
      setSchedule(scheduleItems);
      
      // Рассчитываем общую сумму начислений (исключая начальную запись)
      const totalInterestSum = scheduleItems
        .filter(item => item.interest > 0)
        .reduce((sum, item) => sum + item.interest, 0);
      setTotalInterest(totalInterestSum);
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
    totalInterest,
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