import React from 'react';
import Image from 'next/image';
import { getAssetPath } from '../../utils/paths';

interface OffersBlockProps {
  type: 'deposit' | 'credit' | 'investment';
}

const OffersBlock: React.FC<OffersBlockProps> = ({ type }) => {
  const getContent = () => {
    switch (type) {
      case 'deposit':
        return {
          badge: 'по вкладам и депозитам',
          title: 'ПОДОБРАЛИ ДЛЯ ВАС ЛУЧШИЕ ПРЕДЛОЖЕНИЯ',
          description: 'Сравните условия ведущих банков и выберите наиболее выгодный вклад с максимальной процентной ставкой',
          buttonText: 'Выбрать вклад',
          image: '/img/calc.png',
          badgeColor: 'bg-accent-blue',
          textColor: 'text-white',
          textOpacity: 'text-white/80'
        };
      case 'credit':
        return {
          badge: 'по кредитам и займам',
          title: 'ПОДОБРАЛИ ДЛЯ ВАС ЛУЧШИЕ ПРЕДЛОЖЕНИЯ',
          description: 'Найдите кредит с минимальной ставкой и комфортными условиями погашения от проверенных банков',
          buttonText: 'Выбрать кредит',
          image: '/img/cards.png',
          badgeColor: 'bg-dark-blue',
          textColor: 'text-[#1E1E1E]',
          textOpacity: 'text-[#1E1E1E]'
        };
      case 'investment':
        return {
          badge: 'по инвестициям и картам',
          title: 'ПОДОБРАЛИ ДЛЯ ВАС ЛУЧШИЕ ПРЕДЛОЖЕНИЯ',
          description: 'Откройте брокерский счет или выберите дебетовую карту с максимальным кэшбэком и выгодными условиями',
          buttonText: 'Выбрать предложение',
          image: '/img/note.png',
          badgeColor: 'bg-deep-blue',
          textColor: 'text-white',
          textOpacity: 'text-white/80'
        };
      default:
        return {
          badge: 'по финансовым продуктам',
          title: 'ПОДОБРАЛИ ДЛЯ ВАС ЛУЧШИЕ ПРЕДЛОЖЕНИЯ',
          description: 'Выберите наиболее выгодные финансовые продукты от ведущих банков и брокеров',
          buttonText: 'Выбрать предложение',
          image: '/img/cards.png',
          badgeColor: 'bg-accent-blue',
          textColor: 'text-white',
          textOpacity: 'text-white/80'
        };
    }
  };

  const content = getContent();

  const handleButtonClick = () => {
    // Здесь будет ссылка на внешний сайт
    window.open('https://example.com', '_blank');
  };

  return (
    <div className="pt-12 md:pt-16 lg:pt-20 pb-12 md:pb-16 lg:pb-20">
      <div className="max-w-container mx-auto px-4">
        <div className="block md:grid md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
          {/* Картинка СЛЕВА */}
          <div className="hidden md:block lg:col-span-7 relative h-[300px] md:h-[400px] order-1">
            <Image
              src={getAssetPath(content.image)}
              alt="Финансовые предложения"
              fill
              style={{
                objectFit: 'contain',
                objectPosition: 'left center'
              }}
              priority
            />
          </div>

          {/* Текст СПРАВА */}
          <div className="lg:col-span-5 order-2">
            {/* Заголовок ПЕРВЫЙ */}
            <h1 className={`text-head ${content.textColor} mt-1.5 md:mt-2.5 leading-tight md:leading-normal`}>
              {content.title}
            </h1>
            
            {/* Бейдж ВТОРОЙ */}
            <div className={`inline-flex items-center px-[30px] py-[5px] ${content.badgeColor} text-white text-subhead rounded-[30px] mt-1.5 md:mt-2.5`}>
              {content.badge}
            </div>
            
            {/* Описание ТРЕТИЙ */}
            <p className={`text-subhead ${content.textOpacity} mt-1.5 md:mt-6 lg:mt-10 mb-12 md:mb-16 lg:mb-0`}>
              {content.description}
            </p>
            
            {/* Кнопка ЧЕТВЕРТЫЙ */}
            <div className="mt-6 md:mt-8">
              <button
                onClick={handleButtonClick}
                className="inline-flex items-center px-8 md:px-10 lg:px-12 py-4 md:py-5 bg-white font-semibold text-subhead rounded-[30px] hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg group text-dark-blue"
              >
                {content.buttonText}
                <svg 
                  className="ml-2 md:ml-3 w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersBlock; 