import { useState, useEffect } from 'react';

// Типы для кредитных расчетов
export interface BorrowerTestErrors {
  amount?: string;
  term?: string;
  rate?: string;
  monthlyPayment?: string;
  income1?: string;
  income2?: string;
  income3?: string;
  averageIncome?: string;
}

// Типы для статуса кредитоспособности
export type CreditStatus = 'excellent' | 'good' | 'moderate' | 'high-risk';

export interface CreditAlert {
  status: CreditStatus;
  title: string;
  message: string;
  recommendations: string[];
  color: 'green' | 'yellow' | 'orange' | 'red';
  icon: '✅' | '⚠️' | '🔶' | '❌';
}

// Утилиты для валидации кредитов
const validateAmount = (value: string): string | undefined => {
  const amount = parseFloat(value.replace(/[^\d.]/g, ''));
  if (isNaN(amount)) return 'Введите корректную сумму';
  if (amount < 10000) return 'Минимальная сумма кредита 10 000 ₽';
  if (amount > 5_000_000) return 'Максимальная сумма кредита 5 000 000 ₽';
  return undefined;
};

const validateTerm = (months: number): string | undefined => {
  if (months <= 0) return 'Срок кредита должен быть больше 0';
  if (months < 3) return 'Минимальный срок кредита 3 месяца';
  if (months > 84) return 'Максимальный срок кредита 84 месяца';
  return undefined;
};

const validateRate = (value: string): string | undefined => {
  const rate = parseFloat(value.replace(',', '.'));
  if (isNaN(rate)) return 'Введите корректную ставку';
  if (rate < 1) return 'Минимальная ставка 1%';
  if (rate > 50) return 'Максимальная ставка 50%';
  return undefined;
};

const validateIncome = (value: string): string | undefined => {
  const income = parseFloat(value.replace(/[^\d]/g, ''));
  if (isNaN(income)) return 'Введите корректный доход';
  if (income < 1000) return 'Минимальный доход 1 000 ₽';
  if (income > 10_000_000) return 'Максимальный доход 10 000 000 ₽';
  return undefined;
};

const validateMonthlyPayment = (value: string, averageIncome: number): string | undefined => {
  const payment = parseFloat(value.replace(/[^\d]/g, ''));
  if (isNaN(payment)) return 'Введите корректный платеж';
  if (payment < 100) return 'Минимальный платеж 100 ₽';
  if (payment > averageIncome * 0.8) return 'Платеж не может превышать 80% от дохода';
  return undefined;
};

// Форматирование чисел
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Форматирование суммы
const formatAmount = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  
  // Если нет цифр или только нули, возвращаем пустую строку
  if (!numbers || parseInt(numbers) === 0) {
    return '';
  }
  
  const amount = parseInt(numbers);
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
export const useBorrowerTest = () => {
  // Основные состояния для кредита
  const [amount, setAmount] = useState<string>(formatAmount('200000'));
  const [term, setTerm] = useState<string>('3');
  const [periodType, setPeriodType] = useState<'year' | 'month'>('year');
  const [rate, setRate] = useState<string>('5.00');
  
  // Состояния для теста заемщика
  const [monthlyPayment, setMonthlyPayment] = useState<string>(formatAmount('10000'));
  const [income1, setIncome1] = useState<string>(formatAmount('30000'));
  const [income2, setIncome2] = useState<string>(formatAmount('30000'));
  const [income3, setIncome3] = useState<string>(formatAmount('30000'));
  const [averageIncome, setAverageIncome] = useState<string>(formatAmount('30000'));
  
  // Результаты расчетов
  const [calculatedMonthlyPayment, setCalculatedMonthlyPayment] = useState<number>(0);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [calculatedTerm, setCalculatedTerm] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [debtBurden, setDebtBurden] = useState<number>(0);
  const [remainingIncome, setRemainingIncome] = useState<number>(0);
  const [averageIncomeValue, setAverageIncomeValue] = useState<number>(0);
  
  // Состояния для уведомлений
  const [creditAlert, setCreditAlert] = useState<CreditAlert | null>(null);
  
  // Состояния для UI
  const [errors, setErrors] = useState<BorrowerTestErrors>({});

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

  // Обработчики для полей теста заемщика
  const handleMonthlyPaymentChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setMonthlyPayment(formatAmount(cleanValue));
    
    // Валидируем относительно среднего дохода
    const avgIncome = parseFloat(averageIncome.replace(/[^\d]/g, '')) || 0;
    setErrors(prev => ({ ...prev, monthlyPayment: validateMonthlyPayment(cleanValue, avgIncome) }));
  };

  const handleIncome1Change = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setIncome1(formatAmount(cleanValue));
    setErrors(prev => ({ ...prev, income1: validateIncome(cleanValue) }));
  };

  const handleIncome2Change = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setIncome2(formatAmount(cleanValue));
    setErrors(prev => ({ ...prev, income2: validateIncome(cleanValue) }));
  };

  const handleIncome3Change = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setIncome3(formatAmount(cleanValue));
    setErrors(prev => ({ ...prev, income3: validateIncome(cleanValue) }));
  };

  const handleAverageIncomeChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setAverageIncome(formatAmount(cleanValue));
    setErrors(prev => ({ ...prev, averageIncome: validateIncome(cleanValue) }));
  };

  // Конвертация периода в месяцы
  const convertToMonths = (value: string, type: 'year' | 'month'): number => {
    const numValue = parseInt(value) || 0;
    return type === 'year' ? numValue * 12 : numValue;
  };

  // Расчет кредитных параметров
  useEffect(() => {
    const calculateLoan = () => {
      const loanAmount = parseFloat(amount.replace(/[^\d]/g, ''));
      const loanRate = parseFloat(rate.replace(',', '.'));
      const months = convertToMonths(term, periodType);
      const monthlyRate = loanRate / 100 / 12; // Месячная процентная ставка

      if (isNaN(loanAmount) || isNaN(loanRate) || months <= 0) {
        return;
      }

      // Расчет ежемесячного платежа по формуле аннуитета
      // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
      let monthlyPaymentCalc = 0;
      if (monthlyRate > 0) {
        const denominator = Math.pow(1 + monthlyRate, months) - 1;
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
        monthlyPaymentCalc = loanAmount * (numerator / denominator);
      } else {
        // Если ставка 0%, то просто делим сумму на количество месяцев
        monthlyPaymentCalc = loanAmount / months;
      }

      // Общая переплата
      const totalPayment = monthlyPaymentCalc * months;
      const totalInterestCalc = totalPayment - loanAmount;

      // Расчет среднего дохода
      const income1Value = parseFloat(income1.replace(/[^\d]/g, '')) || 0;
      const income2Value = parseFloat(income2.replace(/[^\d]/g, '')) || 0;
      const income3Value = parseFloat(income3.replace(/[^\d]/g, '')) || 0;
      const averageIncomeCalc = (income1Value + income2Value + income3Value) / 3;

      // Расчет долговой нагрузки (ПДН)
      const debtBurdenCalc = averageIncomeCalc > 0 ? (monthlyPaymentCalc / averageIncomeCalc) * 100 : 0;

      // Остаток дохода после выплат
      const remainingIncomeCalc = averageIncomeCalc - monthlyPaymentCalc;

      // Устанавливаем результаты
      setCalculatedMonthlyPayment(monthlyPaymentCalc);
      setCalculatedAmount(loanAmount); // Для режима "Сумма" будет пересчитываться отдельно
      setCalculatedTerm(months); // Для режима "Срок" будет пересчитываться отдельно
      setTotalInterest(totalInterestCalc);
      setDebtBurden(debtBurdenCalc);
      setRemainingIncome(remainingIncomeCalc);
      setAverageIncomeValue(averageIncomeCalc);

      // Определяем статус кредитоспособности
      const alert = calculateCreditworthiness(
        monthlyPaymentCalc,
        averageIncomeCalc,
        debtBurdenCalc,
        remainingIncomeCalc
      );
      setCreditAlert(alert);
    };

    // Расчет максимальной суммы кредита (для режима "Сумма")
    const calculateMaxAmount = () => {
      const monthlyPaymentValue = parseFloat(monthlyPayment.replace(/[^\d]/g, ''));
      const loanRate = parseFloat(rate.replace(',', '.'));
      const months = convertToMonths(term, periodType);
      const monthlyRate = loanRate / 100 / 12;

      if (isNaN(monthlyPaymentValue) || isNaN(loanRate) || months <= 0 || monthlyPaymentValue <= 0) {
        return;
      }

      // Обратная формула аннуитета: P = PMT * [(1+r)^n - 1] / [r(1+r)^n]
      let maxAmount = 0;
      if (monthlyRate > 0) {
        const denominator = monthlyRate * Math.pow(1 + monthlyRate, months);
        const numerator = Math.pow(1 + monthlyRate, months) - 1;
        maxAmount = monthlyPaymentValue * (numerator / denominator);
      } else {
        maxAmount = monthlyPaymentValue * months;
      }

      setCalculatedAmount(maxAmount);
      
      // Пересчитываем переплату
      const totalPayment = monthlyPaymentValue * months;
      const totalInterestCalc = totalPayment - maxAmount;
      setTotalInterest(totalInterestCalc);
    };

    // Расчет минимального срока (для режима "Срок")
    const calculateMinTerm = () => {
      const loanAmount = parseFloat(amount.replace(/[^\d]/g, ''));
      const monthlyPaymentValue = parseFloat(monthlyPayment.replace(/[^\d]/g, ''));
      const loanRate = parseFloat(rate.replace(',', '.'));
      const monthlyRate = loanRate / 100 / 12;

      if (isNaN(loanAmount) || isNaN(monthlyPaymentValue) || isNaN(loanRate) || 
          loanAmount <= 0 || monthlyPaymentValue <= 0) {
        return;
      }

      // Проверяем, что платеж больше месячных процентов
      const monthlyInterest = loanAmount * monthlyRate;
      if (monthlyPaymentValue <= monthlyInterest) {
        return;
      }

      // Формула расчета срока: n = log(PMT / (PMT - P*r)) / log(1+r)
      let minTermMonths = 0;
      if (monthlyRate > 0) {
        const numerator = Math.log(monthlyPaymentValue / (monthlyPaymentValue - loanAmount * monthlyRate));
        const denominator = Math.log(1 + monthlyRate);
        minTermMonths = numerator / denominator;
      } else {
        minTermMonths = loanAmount / monthlyPaymentValue;
      }

      // Округляем вверх до целого числа месяцев
      minTermMonths = Math.ceil(minTermMonths);
      
      setCalculatedTerm(minTermMonths);
      
      // Пересчитываем переплату
      const totalPayment = monthlyPaymentValue * minTermMonths;
      const totalInterestCalc = totalPayment - loanAmount;
      setTotalInterest(totalInterestCalc);
    };

    calculateLoan();
    calculateMaxAmount();
    calculateMinTerm();
  }, [amount, term, periodType, rate, monthlyPayment, income1, income2, income3, averageIncome]);

  // Функция определения кредитоспособности
  const calculateCreditworthiness = (
    monthlyPayment: number,
    averageIncome: number,
    debtBurden: number,
    remainingIncome: number
  ): CreditAlert => {
    // Проверяем базовые условия
    const incomeToPaymentRatio = averageIncome > 0 ? averageIncome / monthlyPayment : 0;
    const minLivingExpenses = 15000; // Минимум для жизни
    
    if (debtBurden < 20 && incomeToPaymentRatio >= 3 && remainingIncome >= minLivingExpenses * 1.5) {
      return {
        status: 'excellent',
        title: 'Отличная кредитоспособность',
        message: 'При указанных условиях у вас отличные шансы на одобрение кредита. Ваша долговая нагрузка минимальна, а доходы позволяют комфортно обслуживать кредит.',
        recommendations: [
          'Вы можете рассмотреть увеличение суммы кредита',
          'Возможно получение более выгодной процентной ставки',
          'Рассмотрите возможность досрочного погашения'
        ],
        color: 'green',
        icon: '✅'
      };
    }
    
    if (debtBurden < 35 && incomeToPaymentRatio >= 2 && remainingIncome >= minLivingExpenses) {
      return {
        status: 'good',
        title: 'Хорошие шансы на одобрение',
        message: 'При соблюдении всех указанных вами условий вы сможете вовремя и в полном объеме вносить предусмотренные договором платежи.',
        recommendations: [
          'Ваш ежемесячный доход должен быть как минимум в два раза больше, чем ежемесячный платеж',
          'Обратите внимание, что полученные рекомендации актуальны, если у вас нет других кредитов или займов',
          'Рекомендуем создать финансовую подушку на 3-6 месяцев'
        ],
        color: 'yellow',
        icon: '⚠️'
      };
    }
    
    if (debtBurden < 50 && incomeToPaymentRatio >= 1.5 && remainingIncome >= minLivingExpenses * 0.7) {
      return {
        status: 'moderate',
        title: 'Умеренный риск',
        message: 'Ваша долговая нагрузка находится в пограничной зоне. Кредит возможен, но требует осторожности в планировании бюджета.',
        recommendations: [
          'Рассмотрите увеличение срока кредита для снижения платежа',
          'Попробуйте увеличить доходы или привлечь созаемщика',
          'Рассмотрите уменьшение суммы кредита',
          'Обязательно учтите все текущие обязательства'
        ],
        color: 'orange',
        icon: '🔶'
      };
    }
    
    return {
      status: 'high-risk',
      title: 'Высокий риск отказа',
      message: 'При текущих параметрах высока вероятность отказа в кредите. Долговая нагрузка превышает рекомендуемые значения.',
      recommendations: [
        'Увеличьте срок кредита для снижения ежемесячного платежа',
        'Рассмотрите значительное уменьшение суммы кредита',
        'Найдите способы увеличения доходов',
        'Рассмотрите привлечение поручителя или созаемщика',
        'Возможно, стоит отложить получение кредита'
      ],
      color: 'red',
      icon: '❌'
    };
  };

  return {
    // Основные состояния
    amount,
    term,
    periodType,
    rate,
    errors,

    // Результаты расчетов
    calculatedMonthlyPayment,
    calculatedAmount,
    calculatedTerm,
    totalInterest,
    debtBurden,
    remainingIncome,
    averageIncomeValue,

    // Методы изменения основных параметров
    setAmount: handleAmountChange,
    setTerm: handleTermChange,
    setPeriodType,
    setRate: handleRateChange,
    
    // Утилиты
    formatNumber,

    // Состояния и методы для теста заемщика
    monthlyPayment,
    income1,
    income2,
    income3,
    averageIncome,
    setMonthlyPayment: handleMonthlyPaymentChange,
    setIncome1: handleIncome1Change,
    setIncome2: handleIncome2Change,
    setIncome3: handleIncome3Change,
    setAverageIncome: handleAverageIncomeChange,

    // Состояния для уведомлений
    creditAlert,
  };
}; 