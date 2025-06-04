/**
 * Форматирует число с фиксированным количеством знаков после запятой
 * Использует запятую как десятичный разделитель для российской локали
 */
export const formatDecimal = (value: number, decimalPlaces: number = 2): string => {
  return value.toFixed(decimalPlaces).replace('.', ',');
};

/**
 * Форматирует число для отображения денежных сумм с разделителями тысяч и запятыми
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Форматирует целые числа с разделителями тысяч (без десятичных знаков)
 */
export const formatInteger = (value: number): string => {
  return Math.round(value).toLocaleString('ru-RU');
}; 