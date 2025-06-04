import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatDecimal } from '../utils/formatNumber';

// Интерфейс для данных графика (совпадает с MonthlyChartData в хуке)
interface ChartDataPoint {
  month: string; // "2024-01", "2024-02", etc.
  [instrumentName: string]: string | number; // "Депозит": 5.2, "Облигации": 3.1, etc.
}

// Интерфейс для результатов калькулятора
interface ProfitabilityResult {
  instrument: string;
  finalAmount: number;
  profit: number;
  profitPercentage: number;
  inflationAdjustedProfit?: number;
  monthlyData?: { month: string; cumulativeReturn: number; value?: number }[];
}

// Интерфейс пропсов компонента
interface ProfitabilityChartProps {
  results: ProfitabilityResult[];
  monthlyChartData: ChartDataPoint[]; // Новый проп с реальными данными
  inflationEnabled: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

// Цветовая схема для инструментов
const INSTRUMENT_COLORS = {
  'Депозит': '#2563EB', // синий
  'Облигации': '#EA580C', // оранжевый  
  'Акции': '#16A34A', // зеленый
};

// Функция для форматирования месяца в читаемый вид
const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

// Функция для определения шага отображения на оси X
const getXAxisInterval = (monthsCount: number): number => {
  if (monthsCount <= 12) return 0; // Показываем каждый месяц
  if (monthsCount <= 24) return 2; // Показываем каждый 3-й месяц
  if (monthsCount <= 60) return 5; // Показываем каждый 6-й месяц
  return 11; // Показываем каждый год
};

// Кастомный компонент тултипа
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 md:p-4 rounded-lg shadow-lg border max-w-[200px] md:max-w-none text-xs md:text-sm">
        <p className="font-semibold text-gray-900 text-xs md:text-sm mb-1">{formatMonth(label)}</p>
        {payload.map((entry: any, index: number) => {
          const isInflation = entry.dataKey.includes('_inflation');
          const instrumentName = entry.dataKey.replace('_inflation', '');
          const displayName = isInflation ? `${instrumentName} (с учетом инфляции)` : instrumentName;
          
          return (
            <p key={index} style={{ color: entry.color }} className="text-xs md:text-sm leading-tight">
              {`${displayName}: ${formatDecimal(entry.value as number)}%`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

// Основной компонент
const ProfitabilityChart: React.FC<ProfitabilityChartProps> = ({
  results,
  monthlyChartData,
  inflationEnabled,
  startDate,
  endDate
}) => {
  // Используем реальные данные вместо моковых
  const chartData = monthlyChartData;

  if (chartData.length === 0) {
    return null;
  }

  // Определяем интервал для оси X
  const xAxisInterval = getXAxisInterval(chartData.length);

  return (
    <div className="bg-white rounded-[30px] shadow-lg max-w-container mx-auto">
      <div className="max-w-container mx-auto px-3 md:px-6 lg:px-9 laptop:px-[60px] pt-6 md:pt-8 lg:pt-6 laptop:pt-[30px] pb-6 md:pb-8 lg:pb-6 laptop:pb-[30px]">
        <h3 className="text-[20px] md:text-[24px] font-semibold text-gray-900 mb-4 md:mb-6 text-center">
          График доходности инвестиций
        </h3>
        
        {/* Легенда по типам учета инфляции - перемещена выше */}
        {inflationEnabled && (
          <div className="flex justify-center items-center gap-4 md:gap-6 mb-4 md:mb-6 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 md:w-6 h-0.5 bg-gray-400"></div>
              <span className="text-gray-600">Без учета инфляции</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 md:w-6 h-0.5 border-t-2 border-dashed border-gray-400"></div>
              <span className="text-gray-600">С учетом инфляции</span>
            </div>
          </div>
        )}
        
        <div className="h-[300px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 40,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="2 2" strokeWidth={1} />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={xAxisInterval}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(2)}`;
                }}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px'
                }}
                content={(props) => {
                  const { payload } = props;
                  const filteredPayload = payload?.filter((entry: any) => !entry.dataKey.includes('_inflation'));
                  
                  return (
                    <div className="flex justify-center items-center gap-3 md:gap-6 text-xs md:text-sm">
                      {filteredPayload?.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-1 md:gap-2">
                          <div 
                            className="w-4 md:w-6 h-0.5" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span style={{ color: entry.color }} className="font-medium">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />

              {/* Рендерим линии для каждого инструмента */}
              {results.map((result) => {
                const instrument = result.instrument;
                const color = INSTRUMENT_COLORS[instrument as keyof typeof INSTRUMENT_COLORS] || '#6B7280';
                
                return (
                  <React.Fragment key={instrument}>
                    {/* Основная линия */}
                    <Line
                      type="monotone"
                      dataKey={instrument}
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: color }}
                      connectNulls={false}
                    />
                    
                    {/* Линия с учетом инфляции (пунктирная) */}
                    {inflationEnabled && result.inflationAdjustedProfit !== undefined && (
                      <Line
                        type="monotone"
                        dataKey={`${instrument}_inflation`}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                        dot={false}
                        activeDot={{ r: 4, fill: color }}
                        connectNulls={false}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Дополнительная информация */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            * График показывает историческую доходность. Прошлые результаты не гарантируют будущей прибыльности.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityChart; 