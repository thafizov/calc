import React, { ReactNode, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  hasScaling?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, hasScaling = false }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Финансовые калькуляторы`;
    } else {
      document.title = 'Финансовые калькуляторы — это искусство!';
    }
  }, [title]);

  // Функция для закрытия выпадающих меню при клике вне их
  useEffect(() => {
    const handleClickOutside = () => {
      // Логика закрытия дропдаунов будет обрабатываться в Header
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header hasScaling={hasScaling} />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer hasScaling={hasScaling} />
    </div>
  );
};

export default Layout; 