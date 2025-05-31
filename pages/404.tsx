import React from 'react';
import Link from 'next/link';
import Layout from '../components/shared/Layout';

const Custom404: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Большой номер 404 */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200 leading-none">404</h1>
          </div>
          
          {/* Текст ошибки */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Упс, такой страницы нет :(
            </h2>
            <p className="text-gray-600 text-lg">
              Похоже, вы попали на несуществующую страницу. Но не переживайте — мы поможем вам найти то, что нужно!
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Калькуляторы
            </Link>
            
            <a
              href="https://finance-arts.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Организация
            </a>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-12 text-sm text-gray-500">
            <p>Если вы считаете, что это ошибка, сообщите нам об этом</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Custom404; 