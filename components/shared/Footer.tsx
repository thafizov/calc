import { getAssetPath } from "../../utils/paths";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  hasScaling?: boolean;
}

const Footer: React.FC<FooterProps> = ({ hasScaling = false }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-t border-gray-200">
      <div className={`max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12 ${hasScaling ? 'lg:scale-90 lg:origin-center' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Логотип и описание */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src={getAssetPath("/img/logo.svg")}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium text-lg leading-none uppercase">Финансы — это искусство</span>
              </div>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Автономная Некоммерческая Организация по формированию финансово-грамотного общества среди детей и молодежи «Финансы — это искусство»
            </p>
          </div>

          {/* Калькуляторы */}
          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">Калькуляторы</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/deposit" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Депозитный калькулятор
                </Link>
              </li>
              <li>
                <Link href="/calc" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Калькулятор доходности
                </Link>
              </li>
              <li>
                <Link href="/borrower" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Тест заемщика
                </Link>
              </li>
            </ul>
          </div>

          {/* Организация */}
          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">Организация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://finance-arts.ru/#news" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Новости
                </Link>
              </li>
              <li>
                <Link href="https://finance-arts.ru/#grants" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Гранты
                </Link>
              </li>
              <li>
                <Link href="https://finance-arts.ru/#internships" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Стажировка
                </Link>
              </li>
              <li>
                <Link href="https://finance-arts.ru/#team" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Отзывы
                </Link>
              </li>
              <li>
                <Link href="https://finance-arts.ru/#team" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Команда
                </Link>
              </li>
              <li>
                <Link href="https://finance-arts.ru/#partnership" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Партнёры
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Разделитель */}
        <div className="border-t border-gray-300 mt-8 pt-8">
          <div className="flex justify-center items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 