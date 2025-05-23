import React from 'react';
import CalculatorForm from '../components/CalculatorForm';
import ResultBlock from '../components/ResultBlock';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-container mx-auto px-4">
        <div className="space-y-2.5 mb-10">
          <h1 className="text-head text-gray-900">
            Калькулятор доходности вклада
          </h1>
          <p className="text-subhead text-gray-600">
            Рассчитайте доход по вкладу с учетом капитализации процентов
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-white rounded-[30px] shadow-lg -mx-8" />
          <div className="relative max-w-container mx-auto px-[60px] py-[80px]">
            <CalculatorForm />
          </div>
        </div>

        <div className="mt-10">
          <ResultBlock />
        </div>
      </div>
    </div>
  );
};

export default Home; 