import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/shared/Layout';

const calculators = [
  {
    id: 'deposit',
    title: 'ДЕПОЗИТНЫЙ\nКАЛЬКУЛЯТОР',
    description: 'Рассчитайте доход по вкладу и сравните, где выгоднее хранить сбережения — с ежемесячной или капитализируемой выплатой процентов.',
    link: '/deposit',
    image: '/img/land1.png'
  },
  {
    id: 'profitability',
    title: 'КАЛЬКУЛЯТОР\nДОХОДНОСТИ',
    description: 'Узнайте, сколько вы могли бы заработать, если бы инвестировали в акции, облигации или другие активы в прошлом.',
    link: '/profitability',
    image: '/img/land2.png'
  },
  {
    id: 'borrower',
    title: 'ТЕСТ\nЗАЕМЩИКА',
    description: 'Оцените свою финансовую нагрузку — тест покажет, какой кредит будет вам по силам, и поможет избежать лишней долговой нагрузки.',
    link: '/borrower',
    image: '/img/land3.png'
  }
];

export default function HomePage() {
  return (
    <Layout title="Финансовые калькуляторы">
      <Head>
        <meta 
          name="description" 
          content="Удобные инструменты для расчета депозитов, доходности инвестиций и оценки кредитной нагрузки" 
        />
        <style jsx>{`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
          }
        `}</style>
      </Head>
      
      <main className="min-h-screen bg-[#E9F5FF]">
        {/* Верхняя часть - хедер с логотипом и заголовком */}
        <div className="relative py-12 md:py-16 lg:py-20 px-4 max-w-[1200px] mx-auto">
          
          {/* Логотип */}
          <div className="flex justify-center mb-4 md:mb-6 lg:mb-[30px]">
            <div className="relative w-[75px] h-[75px]">
              <Image 
                src="/img/logo.svg"
                alt="Logo"
                fill
                style={{
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>

          {/* Заголовок с декоративными элементами */}
          <div className="text-center mb-4 min-[500px]:mb-8 min-[767px]:mb-6 md:mb-12 relative">
            {/* Левый декоративный элемент - деньги */}
            <div className="absolute left-0 sm:left-16 top-16 w-[50px] h-[50px] sm:w-[70px] sm:h-[70px] text-[50px] sm:text-[70px] bg-white/10 rounded-full flex items-center justify-center animate-[wiggle_4s_ease-in-out_infinite] hover:scale-110 transition-transform">
              💸
            </div>
            
            {/* Правый декоративный элемент - счеты */}
            <div className="absolute right-0 sm:right-16 top-20 w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] text-[40px] sm:text-[60px] bg-white/10 rounded-full flex items-center justify-center transform rotate-[15deg] animate-[wiggle_5s_ease-in-out_infinite_reverse] hover:scale-110 transition-transform">
              🧮
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-gray-900 mb-4 md:mb-6 lg:mb-[30px] leading-tight">
              {/* Первая строка */}
              <div className="inline-block bg-white/90 px-4 sm:px-6 lg:px-[30px] py-2 rounded-[60px] mb-3">
                ФИНАНСЫ — ЭТО ПРОСТО,
              </div>
              <br />
              
              {/* Вторая строка с наклоном */}
              <div className="inline-block bg-white/90 px-4 sm:px-6 lg:px-[30px] py-2 rounded-[60px] mb-3 transform -rotate-[4.5deg]">
                КОГДА ТЫ МОЖЕШЬ
              </div>
              <br />
              
              {/* Третья строка */}
              <div className="inline-block bg-white/90 px-4 sm:px-6 lg:px-[30px] py-2 rounded-[60px]">
                РАССЧИТАТЬ ИХ САМ
              </div>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
              <span className="hidden lg:inline">
                Мы разработали удобные инструменты, которые помогут тебе<br />
                почувствовать контроль над своими деньгами<br />
                — рассчитай, сравни, спланируй.
              </span>
              <span className="lg:hidden">
                Мы разработали удобные инструменты, которые помогут тебе почувствовать контроль над своими деньгами — рассчитай, сравни, спланируй.
              </span>
            </p>
          </div>
        </div>

        {/* Нижняя часть - карточки калькуляторов */}
        <div className="px-4 max-w-[1200px] mx-auto pb-12 md:pb-16 lg:pb-20">
          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {calculators.map((calc) => (
              <div key={calc.id} className="relative">
                <Link href={calc.link}>
                  <div className="bg-[#486FCF] rounded-[30px] text-white cursor-pointer hover:scale-105 transition-transform duration-300 h-full flex flex-col relative overflow-hidden">
                    
                    {/* Иконка стрелки */}
                    <div className="absolute top-[25px] right-[25px] z-10">
                      <div className="relative w-4 h-4">
                        <Image 
                          src="/img/arrow.svg"
                          alt="Arrow"
                          fill
                          style={{
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    </div>

                    {/* Контентная часть с паддингом */}
                    <div className="px-8 min-[650px]:px-[50px] pt-[60px] pb-5 flex-grow flex flex-col">
                      {/* Заголовок */}
                      <h2 className="text-xl font-medium mb-5 leading-tight whitespace-pre-line">
                        {calc.title}
                      </h2>

                      {/* Описание */}
                      <p className="text-white text-lg font-normal mb-8 flex-grow leading-normal">
                        {calc.description}
                      </p>

                      {/* Кнопка */}
                      <button className="bg-white text-gray-800 rounded-full py-3 px-8 font-medium hover:bg-gray-100 transition-colors">
                        Рассчитать
                      </button>
                    </div>

                    {/* Изображение на всю ширину */}
                    <div className="w-full">
                      <img 
                        src={calc.image}
                        alt={calc.title}
                        className="w-full h-auto block"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
} 