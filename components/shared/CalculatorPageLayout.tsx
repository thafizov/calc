import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface CalculatorPageLayoutProps {
  children: ReactNode;
}

const CalculatorPageLayout: React.FC<CalculatorPageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header hasScaling={true} />
      {/* Добавляем отступ сверху для компенсации фиксированной шапки */}
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer hasScaling={true} />
    </div>
  );
};

export default CalculatorPageLayout; 