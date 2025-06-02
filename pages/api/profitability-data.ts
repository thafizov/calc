import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Типы для данных
interface DataItem {
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

interface ProfitabilityDataRequest {
  startDate: string;
  endDate: string;
  instruments: string[];
  depositTerm?: string;
  bondType?: string;
}

// Кэш для данных
let cachedData: ApiData | null = null;

// Функция загрузки данных
const loadData = (): ApiData => {
  if (cachedData) {
    return cachedData;
  }

  const filePath = path.join(process.cwd(), 'data', 'all_data_final.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  cachedData = JSON.parse(fileContent);
  return cachedData;
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
  
  return items.filter(item => {
    const itemDate = new Date(item.date.split('.').reverse().join('-')); // DD.MM.YYYY -> YYYY-MM-DD
    return itemDate >= start && itemDate <= end;
  });
};

// Основной обработчик API
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate, instruments, depositTerm, bondType }: ProfitabilityDataRequest = req.body;

    if (!startDate || !endDate || !instruments || instruments.length === 0) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const data = loadData();
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

    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing profitability data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 