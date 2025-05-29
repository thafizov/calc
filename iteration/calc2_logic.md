# Логика калькулятора теста заемщика

## Обзор проекта

Калькулятор теста заемщика предназначен для оценки кредитоспособности потенциального заемщика. Он работает в трех режимах:
1. **Расчет ежемесячного платежа** (по сумме и сроку)
2. **Расчет максимальной суммы кредита** (по платежу и сроку)  
3. **Расчет минимального срока** (по сумме и платежу)

## Архитектура решения

### Рефакторинг существующего хука

Изначально проект использовал хук `useBorrowerTest`, который был скопирован с депозитного калькулятора. Была проведена полная очистка от депозитной логики:

**Удалены ненужные состояния:**
- `isCapitalized`, `capitalizationPeriod` - капитализация не нужна для кредитов
- `startDate` - дата начала не критична для теста заемщика
- `schedule`, `isVisible` - график платежей не требуется
- `effectiveRate` - заменен на долговую нагрузку

**Переименованы состояния:**
- `total` → `calculatedAmount` (для режима "Сумма")
- `profit` → `totalInterest` (общая переплата)

**Добавлены новые состояния:**
- `calculatedMonthlyPayment` - рассчитанный ежемесячный платеж
- `calculatedTerm` - рассчитанный срок
- `debtBurden` - долговая нагрузка (ПДН)
- `remainingIncome` - остаток дохода после выплат
- `averageIncomeValue` - средний доход

## Валидация полей

### Обновленные функции валидации для кредитов:

```typescript
// Валидация суммы кредита
const validateAmount = (value: string): string | undefined => {
  const amount = parseFloat(value.replace(/[^\d.]/g, ''));
  if (isNaN(amount)) return 'Введите корректную сумму';
  if (amount < 10000) return 'Минимальная сумма кредита 10 000 ₽';
  if (amount > 5_000_000) return 'Максимальная сумма кредита 5 000 000 ₽';
  return undefined;
};

// Валидация срока кредита
const validateTerm = (months: number): string | undefined => {
  if (months <= 0) return 'Срок кредита должен быть больше 0';
  if (months < 3) return 'Минимальный срок кредита 3 месяца';
  if (months > 84) return 'Максимальный срок кредита 84 месяца';
  return undefined;
};

// Валидация процентной ставки
const validateRate = (value: string): string | undefined => {
  const rate = parseFloat(value.replace(',', '.'));
  if (isNaN(rate)) return 'Введите корректную ставку';
  if (rate < 1) return 'Минимальная ставка 1%';
  if (rate > 50) return 'Максимальная ставка 50%';
  return undefined;
};

// Валидация дохода
const validateIncome = (value: string): string | undefined => {
  const income = parseFloat(value.replace(/[^\d]/g, ''));
  if (isNaN(income)) return 'Введите корректный доход';
  if (income < 1000) return 'Минимальный доход 1 000 ₽';
  if (income > 10_000_000) return 'Максимальный доход 10 000 000 ₽';
  return undefined;
};

// Валидация ежемесячного платежа
const validateMonthlyPayment = (value: string, averageIncome: number): string | undefined => {
  const payment = parseFloat(value.replace(/[^\d]/g, ''));
  if (isNaN(payment)) return 'Введите корректный платеж';
  if (payment < 100) return 'Минимальный платеж 100 ₽';
  if (payment > averageIncome * 0.8) return 'Платеж не может превышать 80% от дохода';
  return undefined;
};
```

## Математические формулы

### 1. Расчет ежемесячного платежа (Аннуитетная схема)

**Формула:**
```
PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
```

Где:
- `PMT` - ежемесячный платеж
- `P` - сумма кредита
- `r` - месячная процентная ставка (годовая ставка / 12 / 100)
- `n` - количество месяцев

**Особый случай:** При ставке 0% используется простое деление: `PMT = P / n`

**Реализация:**
```typescript
let monthlyPaymentCalc = 0;
if (monthlyRate > 0) {
  const denominator = Math.pow(1 + monthlyRate, months) - 1;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
  monthlyPaymentCalc = loanAmount * (numerator / denominator);
} else {
  monthlyPaymentCalc = loanAmount / months;
}
```

### 2. Расчет максимальной суммы кредита

**Формула (обратная к аннуитету):**
```
P = PMT * [(1+r)^n - 1] / [r(1+r)^n]
```

**Реализация:**
```typescript
let maxAmount = 0;
if (monthlyRate > 0) {
  const denominator = monthlyRate * Math.pow(1 + monthlyRate, months);
  const numerator = Math.pow(1 + monthlyRate, months) - 1;
  maxAmount = monthlyPaymentValue * (numerator / denominator);
} else {
  maxAmount = monthlyPaymentValue * months;
}
```

### 3. Расчет минимального срока

**Формула:**
```
n = log(PMT / (PMT - P*r)) / log(1+r)
```

**Важная проверка:** Платеж должен быть больше месячных процентов, иначе кредит никогда не погасится.

**Реализация:**
```typescript
// Проверяем, что платеж больше месячных процентов
const monthlyInterest = loanAmount * monthlyRate;
if (monthlyPaymentValue <= monthlyInterest) {
  console.log('Платеж слишком мал для погашения кредита');
  return;
}

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
```

## Метрики заемщика

### 1. Совокупный средний доход

**Для режимов "Платеж" и "Сумма":**
```typescript
const averageIncomeCalc = (income1Value + income2Value + income3Value) / 3;
```

**Для режима "Срок":**
Используется поле `averageIncome` напрямую.

### 2. Долговая нагрузка (ПДН)

**Формула:**
```
ПДН = (ежемесячный_платеж / средний_доход) * 100%
```

**Реализация:**
```typescript
const debtBurdenCalc = averageIncomeCalc > 0 ? (monthlyPaymentCalc / averageIncomeCalc) * 100 : 0;
```

**Интерпретация:**
- ПДН < 30% - зеленый (хорошо)
- ПДН 30-50% - желтый (осторожно)  
- ПДН > 50% - красный (высокий риск)

### 3. Остаток дохода после выплат

**Формула:**
```
Остаток = средний_доход - ежемесячный_платеж
```

**Реализация:**
```typescript
const remainingIncomeCalc = averageIncomeCalc - monthlyPaymentCalc;
```

## Дефолтные значения

Установлены реалистичные начальные значения:
- **Сумма кредита**: 300 000 ₽
- **Срок**: 3 года
- **Ставка**: 5% годовых
- **Доходы**: по 30 000 ₽ за каждый год

Это дает:
- **Ежемесячный платеж**: ~8 991 ₽
- **Долговая нагрузка**: ~30% (приемлемо)
- **Остаток дохода**: ~21 000 ₽

## Интеграция с UI

### Динамические результаты по режимам:

**Режим "Ежемесячный платеж":**
- Показывает рассчитанный платеж
- Совокупный средний доход (среднее из 3 лет)
- Долговую нагрузку
- Остаток дохода

**Режим "Сумма":**
- Показывает максимальную сумму кредита
- Те же метрики заемщика

**Режим "Срок":**
- Показывает минимальный срок (с правильным форматированием)
- Использует среднемесячный доход напрямую
- Рассчитывает метрики на основе введенного платежа

### Форматирование срока

Создана функция для красивого отображения срока:
```typescript
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
```

## Обработка ошибок

1. **Валидация входных данных** на каждое изменение поля
2. **Проверка на деление на ноль** в формулах
3. **Проверка математической корректности** (например, платеж больше процентов)
4. **Graceful degradation** - если расчет невозможен, показываются нули

## Результат

Получился полнофункциональный калькулятор теста заемщика с:
- ✅ Тремя режимами расчета
- ✅ Правильными кредитными формулами
- ✅ Валидацией всех полей
- ✅ Динамическими результатами
- ✅ Реалистичными дефолтными значениями
- ✅ Обработкой ошибок
- ✅ Красивым форматированием

Калькулятор готов к использованию и дает корректные результаты для оценки кредитоспособности заемщика. 