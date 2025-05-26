🔧 Исправь логику расчета доходности вклада

🎯 Что требуется:
1. Учитывай дату открытия вклада.
2. При включенной капитализации:
   - Начисляй проценты на тело вклада в каждом периоде: ежемесячно, ежеквартально, ежегодно (в зависимости от настроек).
   - Используй календарные дни (actual/actual), а не условные "30 дней в месяце".
   - Увеличивай тело вклада в конце каждого периода капитализации.
3. При выключенной капитализации:
   - Начисляй проценты на изначальную сумму, не прибавляя их к телу вклада.
4. В конце срока:
   - Вывести сумму на конец срока (`totalAmount`)
   - Доход (`income = totalAmount - initialAmount`)
   - Эффективную ставку:
     \[
     \text{effectiveRate} = \left( \frac{totalAmount}{initialAmount} \right)^{1 / years} - 1
     \]

5. Обнови график платежей в соответствии с изменениями
   

---

## ✅ примерный Код функции для расчета (React/JS):

```jsx
import { addMonths, isBefore } from 'date-fns';

export function calculateDeposit({
  initialAmount,
  annualRate,
  years,
  capitalization, // 'monthly' | 'quarterly' | 'yearly'
  startDate, // JS Date object
}) {
  const totalPeriods = {
    monthly: 12,
    quarterly: 4,
    yearly: 1,
  }[capitalization];

  const periodMonths = {
    monthly: 1,
    quarterly: 3,
    yearly: 12,
  }[capitalization];

  const results = [];
  const totalDaysInYear = (date) => {
    const year = date.getFullYear();
    return (new Date(year, 1, 29).getMonth() === 1) ? 366 : 365;
  };

  let currentAmount = initialAmount;
  let currentDate = new Date(startDate);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + years);

  let totalIncome = 0;

  while (isBefore(currentDate, endDate)) {
    const nextDate = addMonths(currentDate, periodMonths);
    const daysInPeriod = (nextDate - currentDate) / (1000 * 60 * 60 * 24);
    const dailyRate = (annualRate / 100) / totalDaysInYear(currentDate);

    const base = capitalization ? currentAmount : initialAmount;
    const interest = base * dailyRate * daysInPeriod;

    if (capitalization) {
      currentAmount += interest;
    }

    totalIncome += interest;

    results.push({
      date: nextDate,
      interest: +interest.toFixed(2),
      total: +currentAmount.toFixed(2),
    });

    currentDate = nextDate;
  }

  const effectiveRate =
    Math.pow(currentAmount / initialAmount, 1 / years) - 1;

  return {
    totalAmount: +currentAmount.toFixed(2),
    income: +totalIncome.toFixed(2),
    effectiveRate: +(effectiveRate * 100).toFixed(2),
    schedule: results,
  };
}



### добавил

import { addMonths, differenceInDays } from 'date-fns';

function calculateDeposit({ initialAmount, annualRate, years, capitalization, startDate }) {
  const periodMonths = {
    monthly: 1,
    quarterly: 3,
    yearly: 12,
  }[capitalization];

  let currentAmount = initialAmount;
  let currentDate = new Date(startDate);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + years);
  let totalIncome = 0;
  const schedule = [];

  while (currentDate < endDate) {
    let nextDate = addMonths(currentDate, periodMonths);
    if (nextDate > endDate) nextDate = endDate;

    const daysInPeriod = differenceInDays(nextDate, currentDate);
    const yearDays = (currentDate.getFullYear() % 4 === 0) ? 366 : 365;
    const dailyRate = annualRate / 100 / yearDays;

    const interest = currentAmount * dailyRate * daysInPeriod;

    totalIncome += interest;
    currentAmount += interest;

    schedule.push({
      date: nextDate.toISOString().slice(0, 10),
      interest: +interest.toFixed(2),
      total: +currentAmount.toFixed(2),
    });

    currentDate = nextDate;
  }

  const effectiveRate = Math.pow(currentAmount / initialAmount, 1 / years) - 1;

  return {
    totalAmount: +currentAmount.toFixed(2),
    income: +totalIncome.toFixed(2),
    effectiveRate: +(effectiveRate * 100).toFixed(2),
    schedule,
  };
}

const startDate = new Date('2025-05-25');
const initialAmount = 1_000_000;
const annualRate = 5;
const years = 3;

const monthly = calculateDeposit({ initialAmount, annualRate, years, capitalization: 'monthly', startDate });
const quarterly = calculateDeposit({ initialAmount, annualRate, years, capitalization: 'quarterly', startDate });
const yearly = calculateDeposit({ initialAmount, annualRate, years, capitalization: 'yearly', startDate });

console.log('Ежемесячная капитализация:', monthly);
console.log('Ежеквартальная капитализация:', quarterly);
console.log('Ежегодная капитализация:', yearly);
