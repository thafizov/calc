// Типы для данных
export interface DataItem {
  date: string;
  value: number;
}

interface Tool {
  name: string;
  code: string;
  sort: number;
  items: DataItem[] | Tool[];
}

interface ApiData {
  tools: Tool[];
}

export interface ProfitabilityDataResponse {
  inflation?: DataItem[];
  deposits?: DataItem[];
  bonds?: DataItem[];
  stocks?: DataItem[];
}

export interface ProfitabilityDataRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  instruments: string[];
  depositTerm?: string;
  bondType?: string;
}

// Кэш для данных
let cachedData: ApiData | null = null;

// Функция загрузки данных (клиентская загрузка JSON)
const loadData = async (): Promise<ApiData> => {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('/data/all_data_final.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    cachedData = await response.json();
    return cachedData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

// Функция поиска инструмента по коду
const findToolByCode = (data: ApiData, code: string): Tool | null => {
  for (const tool of data.tools) {
    if (tool.code === code) {
      return tool;
    }
    // Поиск во вложенных элементах
    if (tool.items && tool.items.length > 0 && 'code' in tool.items[0]) {
      for (const item of tool.items as Tool[]) {
        if (item.code === code) {
          return item;
        }
        // Еще один уровень вложенности для депозитов
        if (item.items && item.items.length > 0 && 'code' in item.items[0]) {
          for (const subItem of item.items as Tool[]) {
            if (subItem.code === code) {
              return subItem;
            }
          }
        }
      }
    }
  }
  return null;
};

// Функция фильтрации данных по датам
const filterDataByDates = (items: DataItem[], startDate: string, endDate: string): DataItem[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  console.log('🗓️ Filtering data by dates:', { startDate, endDate, totalItems: items.length });
  console.log('🗓️ Start/End objects:', { start: start.toISOString(), end: end.toISOString() });
  
  const filtered = items.filter((item, index) => {
    const itemDate = new Date(item.date.split('.').reverse().join('-')); // DD.MM.YYYY -> YYYY-MM-DD
    const included = itemDate >= start && itemDate <= end;
    
    // Логируем первые и последние 5 записей для отладки
    if (index < 5 || index >= items.length - 5) {
      console.log(`🗓️ ${item.date} -> ${itemDate.toISOString().split('T')[0]}: ${included ? 'INCLUDED' : 'EXCLUDED'}`);
    }
    
    return included;
  });
  
  console.log('🗓️ Filtered result:', { 
    filteredItems: filtered.length,
    firstDate: filtered[0]?.date,
    lastDate: filtered[filtered.length - 1]?.date,
    firstFewDates: filtered.slice(0, 3).map(d => d.date),
    lastFewDates: filtered.slice(-3).map(d => d.date)
  });
  
  return filtered;
};

// Функция для получения данных (замена API роута)
export const fetchProfitabilityData = async (
  request: ProfitabilityDataRequest
): Promise<ProfitabilityDataResponse> => {
  try {
    const { startDate, endDate, instruments, depositTerm, bondType } = request;

    if (!startDate || !endDate || !instruments || instruments.length === 0) {
      throw new Error('Missing required parameters');
    }

    const data = await loadData();
    const result: Record<string, DataItem[]> = {};

    // Получаем данные по инфляции
    if (instruments.includes('inflation')) {
      const inflationTool = findToolByCode(data, 'inflation');
      if (inflationTool && inflationTool.items && 'date' in inflationTool.items[0]) {
        result.inflation = filterDataByDates(inflationTool.items as DataItem[], startDate, endDate);
      }
    }

    // Получаем данные по депозитам
    if (instruments.includes('deposits')) {
      let depositCode = 'deposit_ruble_1'; // по умолчанию
      
      switch (depositTerm) {
        case 'less_than_1_year':
          depositCode = 'deposit_ruble_1';
          break;
        case '1_to_3_years':
          depositCode = 'deposit_ruble_1_3';
          break;
        case 'more_than_3_years':
          depositCode = 'deposit_ruble_3';
          break;
      }

      const depositTool = findToolByCode(data, depositCode);
      if (depositTool && depositTool.items && 'date' in depositTool.items[0]) {
        result.deposits = filterDataByDates(depositTool.items as DataItem[], startDate, endDate);
      }
    }

    // Получаем данные по облигациям
    if (instruments.includes('bonds')) {
      let bondCode = 'bonds_ofz'; // по умолчанию
      
      switch (bondType) {
        case 'ofz':
          bondCode = 'bonds_ofz';
          break;
        case 'corporate':
          bondCode = 'bonds_corporate';
          break;
        case 'municipal':
          bondCode = 'bonds_ofz'; // пока используем ОФЗ
          break;
      }

      const bondTool = findToolByCode(data, bondCode);
      if (bondTool && bondTool.items && 'date' in bondTool.items[0]) {
        result.bonds = filterDataByDates(bondTool.items as DataItem[], startDate, endDate);
      }
    }

    // Получаем данные по акциям
    if (instruments.includes('stocks')) {
      const stockTool = findToolByCode(data, 'stock');
      if (stockTool && stockTool.items && 'date' in stockTool.items[0]) {
        result.stocks = filterDataByDates(stockTool.items as DataItem[], startDate, endDate);
      }
    }

    return result as ProfitabilityDataResponse;
  } catch (error) {
    console.error('Error fetching profitability data:', error);
    throw error;
  }
};

// Функция конвертации даты из Date в строку YYYY-MM-DD
export const formatDateForApi = (date: Date): string => {
  // Используем местное время вместо UTC, чтобы избежать сдвига дат из-за часовых поясов
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Функция конвертации даты из DD.MM.YYYY в Date
export const parseApiDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('.');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

// Функция расчета доходности депозита на основе реальных данных
export const calculateDepositProfitability = (
  amount: number,
  data: DataItem[]
): { finalAmount: number; profit: number; profitPercentage: number; monthlyData: { month: string; cumulativeReturn: number; value: number }[] } => {
  if (!data || data.length === 0) {
    return { finalAmount: amount, profit: 0, profitPercentage: 0, monthlyData: [] };
  }

  console.log('💳 Deposit calculation input:', { amount, dataLength: data.length });

  // Сортируем данные по дате
  const sortedData = [...data].sort((a, b) => 
    parseApiDate(a.date).getTime() - parseApiDate(b.date).getTime()
  );

  console.log('💳 Sorted deposit data sample:', sortedData.slice(0, 5));

  let cumulativeAmount = amount;
  const monthlyData: { month: string; cumulativeReturn: number; value: number }[] = [];

  // Рассчитываем накопленную доходность по месяцам
  sortedData.forEach((dataPoint, index) => {
    const date = parseApiDate(dataPoint.date);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Применяем месячную ставку (годовая ставка / 12)
    const monthlyRate = dataPoint.value / 100 / 12;
    cumulativeAmount = cumulativeAmount * (1 + monthlyRate);
    
    const cumulativeReturn = ((cumulativeAmount - amount) / amount) * 100;
    
    monthlyData.push({
      month,
      cumulativeReturn,
      value: dataPoint.value
    });
  });

  const finalAmount = cumulativeAmount;
  const profit = finalAmount - amount;
  const profitPercentage = (profit / amount) * 100;

  console.log('💳 Deposit calculation:', { 
    finalAmount, 
    profit, 
    profitPercentage,
    monthlyDataLength: monthlyData.length
  });

  return { finalAmount, profit, profitPercentage, monthlyData };
};

// Функция расчета доходности облигаций на основе индекса
export const calculateBondProfitability = (
  amount: number,
  data: DataItem[]
): { finalAmount: number; profit: number; profitPercentage: number; monthlyData: { month: string; cumulativeReturn: number; value: number }[] } => {
  if (!data || data.length < 2) {
    return { finalAmount: amount, profit: 0, profitPercentage: 0, monthlyData: [] };
  }

  console.log('📈 Bond calculation input:', { amount, dataLength: data.length });

  // Сортируем данные по дате
  const sortedData = [...data].sort((a, b) => 
    parseApiDate(a.date).getTime() - parseApiDate(b.date).getTime()
  );

  console.log('📈 Bond data sample:', {
    first: sortedData[0],
    last: sortedData[sortedData.length - 1],
    sample: sortedData.slice(0, 3)
  });

  const startValue = sortedData[0].value;
  const monthlyData: { month: string; cumulativeReturn: number; value: number }[] = [];

  // Рассчитываем доходность по месяцам на основе изменения индекса
  sortedData.forEach((dataPoint, index) => {
    const date = parseApiDate(dataPoint.date);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Рост индекса относительно начального значения
    const indexGrowth = dataPoint.value / startValue;
    const currentAmount = amount * indexGrowth;
    const cumulativeReturn = ((currentAmount - amount) / amount) * 100;
    
    monthlyData.push({
      month,
      cumulativeReturn,
      value: dataPoint.value
    });
  });

  const endValue = sortedData[sortedData.length - 1].value;
  const indexGrowth = endValue / startValue;
  const finalAmount = amount * indexGrowth;
  const profit = finalAmount - amount;
  const profitPercentage = (profit / amount) * 100;

  console.log('📈 Bond calculation:', { 
    indexGrowth, 
    finalAmount, 
    profit, 
    profitPercentage,
    monthlyDataLength: monthlyData.length
  });

  return { finalAmount, profit, profitPercentage, monthlyData };
};

// Функция расчета доходности акций на основе индекса
export const calculateStockProfitability = (
  amount: number,
  data: DataItem[]
): { finalAmount: number; profit: number; profitPercentage: number; monthlyData: { month: string; cumulativeReturn: number; value: number }[] } => {
  if (!data || data.length < 2) {
    return { finalAmount: amount, profit: 0, profitPercentage: 0, monthlyData: [] };
  }

  console.log('📊 Stock calculation input:', { amount, dataLength: data.length });

  // Сортируем данные по дате
  const sortedData = [...data].sort((a, b) => 
    parseApiDate(a.date).getTime() - parseApiDate(b.date).getTime()
  );

  console.log('📊 Stock data sample:', {
    first: sortedData[0],
    last: sortedData[sortedData.length - 1],
    sample: sortedData.slice(0, 3)
  });

  const startValue = sortedData[0].value;
  const monthlyData: { month: string; cumulativeReturn: number; value: number }[] = [];

  // Рассчитываем доходность по месяцам на основе изменения индекса
  sortedData.forEach((dataPoint, index) => {
    const date = parseApiDate(dataPoint.date);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Рост индекса относительно начального значения
    const indexGrowth = dataPoint.value / startValue;
    const currentAmount = amount * indexGrowth;
    const cumulativeReturn = ((currentAmount - amount) / amount) * 100;
    
    monthlyData.push({
      month,
      cumulativeReturn,
      value: dataPoint.value
    });
  });

  const endValue = sortedData[sortedData.length - 1].value;
  const indexGrowth = endValue / startValue;
  const finalAmount = amount * indexGrowth;
  const profit = finalAmount - amount;
  const profitPercentage = (profit / amount) * 100;

  console.log('📊 Stock calculation:', { 
    indexGrowth, 
    finalAmount, 
    profit, 
    profitPercentage,
    monthlyDataLength: monthlyData.length
  });

  return { finalAmount, profit, profitPercentage, monthlyData };
};

// Функция расчета реальной доходности с учетом инфляции
export const calculateInflationAdjustedProfitability = (
  profitPercentage: number,
  inflationData: DataItem[]
): number => {
  if (!inflationData || inflationData.length === 0) {
    return profitPercentage;
  }

  console.log('💹 Inflation adjustment calculation:', { 
    profitPercentage, 
    inflationDataLength: inflationData.length,
    inflationSample: inflationData.slice(0, 3),
    inflationPeriod: inflationData[0]?.date + ' - ' + inflationData[inflationData.length - 1]?.date
  });

  // ⚠️ ВАЖНО: inflationData уже отфильтрован по периоду в fetchProfitabilityData
  // Рассчитываем общую инфляцию только за заданный период (не за все годы!)
  let totalInflation = 1;
  for (const item of inflationData) {
    totalInflation *= (1 + item.value); // item.value уже в десятичной дроби (например, 0.0233 для 2.33%)
  }
  
  // Правильная формула реальной доходности: (1 + номинальная) / (1 + инфляция) - 1
  const nominalReturnDecimal = profitPercentage / 100; // Конвертируем проценты в десятичную дробь
  const realReturnDecimal = (1 + nominalReturnDecimal) / totalInflation - 1;
  
  const result = realReturnDecimal * 100; // Конвертируем обратно в проценты
  
  console.log('💹 Inflation adjustment result:', { 
    totalInflation: totalInflation.toFixed(4),
    totalInflationPercent: ((totalInflation - 1) * 100).toFixed(2) + '%',
    nominalReturn: profitPercentage.toFixed(2) + '%',
    realReturn: result.toFixed(2) + '%',
    periodUsed: inflationData.length + ' months'
  });
  
  return result;
}; 