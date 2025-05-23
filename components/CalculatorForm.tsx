import React, { useState } from 'react';

interface CalculatorFormState {
  amount: string;
  term: string;
  rate: string;
  startDate: string;
  isCapitalization: boolean;
  isEarlyWithdrawal: boolean;
}

const CalculatorForm: React.FC = () => {
  const [formData, setFormData] = useState<CalculatorFormState>({
    amount: '1000000',
    term: '1',
    rate: '5,00',
    startDate: '2025-05-21',
    isCapitalization: false,
    isEarlyWithdrawal: false
  });

  return (
    <form className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Зона 1: Основные поля */}
        <div className="space-y-2">
          <label className="block text-label text-gray-700">
            Сумма вклада, ₽
          </label>
          <input
            type="text"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full h-[52px] px-4 rounded-2xl bg-input-blue border-0 focus:ring-2 focus:ring-accent-blue text-label"
          />
        </div>

        {/* Срок вклада */}
        <div className="space-y-2">
          <label className="block text-label text-gray-700">
            Срок вклада
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              className="w-full h-[52px] px-4 rounded-2xl bg-input-blue border-0 focus:ring-2 focus:ring-accent-blue text-label"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <select
                className="h-full rounded-r-2xl border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-blue text-label"
              >
                <option>год</option>
                <option>месяц</option>
              </select>
            </div>
          </div>
        </div>

        {/* Процентная ставка */}
        <div className="space-y-2">
          <label className="block text-label text-gray-700">
            Процентная ставка, % годовых
          </label>
          <input
            type="text"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            className="w-full h-[52px] px-4 rounded-2xl bg-input-blue border-0 focus:ring-2 focus:ring-accent-blue text-label"
          />
        </div>

        {/* Дата открытия */}
        <div className="space-y-2">
          <label className="block text-label text-gray-700">
            Дата открытия
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full h-[52px] px-4 rounded-2xl bg-input-blue border-0 focus:ring-2 focus:ring-accent-blue text-label"
          />
        </div>

        {/* Чекбоксы */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isCapitalization}
              onChange={(e) => setFormData({ ...formData, isCapitalization: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
            />
            <span className="text-label text-gray-700">
              Начисление процентов с учетом капитализации
            </span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isEarlyWithdrawal}
              onChange={(e) => setFormData({ ...formData, isEarlyWithdrawal: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
            />
            <span className="text-label text-gray-700">
              Досрочное закрытие вклада
            </span>
          </label>
        </div>

      </div>

      {/* Результаты */}
      <div className="bg-accent-blue text-white rounded-[32px] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="text-sm opacity-80">Сумма в конце срока</div>
            <div className="text-2xl font-bold">1 050 000 ₽</div>
          </div>
          <div>
            <div className="text-sm opacity-80">Доход</div>
            <div className="text-2xl font-bold">50 000 ₽</div>
          </div>
          <div className="text-center md:text-right">
            <button
              type="button"
              className="w-full md:w-auto px-6 py-3 bg-white text-accent-blue rounded-2xl font-medium hover:bg-blue-50 transition-colors"
            >
              График начислений
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CalculatorForm; 