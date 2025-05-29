import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

const calculators = [
  {
    id: 'deposit',
    title: 'ДЕПОЗИТНЫЙ КАЛЬКУЛЯТОР',
    description: 'Рассчитайте доход по вкладу и сравните, где выгоднее хранить сбережения — с ежемесячной или капитализируемой выплатой процентов.',
    link: '/deposit',
    image: '/calc/img/cards.png'
  },
  {
    id: 'profitability',
    title: 'КАЛЬКУЛЯТОР ДОХОДНОСТИ',
    description: 'Узнайте, сколько вы могли бы заработать, если бы инвестировали в акции, облигации или другие активы в прошлом.',
    link: '/profitability',
    image: '/calc/img/calculator.png'
  },
  {
    id: 'borrower',
    title: 'ТЕСТ ЗАЕМЩИКА',
    description: 'Оцените свою финансовую нагрузку — тест покажет, какой кредит будет вам по силам, и поможет избежать лишней долговой нагрузки.',
    link: '/borrower',
    image: '/calc/img/note.png'
  }
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Финансовые калькуляторы</title>
        <meta 
          name="description" 
          content="Удобные инструменты для расчета депозитов, доходности инвестиций и оценки кредитной нагрузки" 
        />
      </Head>
      
      <main className="min-h-screen" style={{ 
        background: 'linear-gradient(90deg, #E8D5E8 0%, #F0E8F0 25%, #E8D5E8 50%, #F0E8F0 75%, #E8D5E8 100%)',
        backgroundSize: '80px 100%'
      }}>
        <div className="relative py-12 md:py-16 lg:py-20 px-4 max-w-[1200px] mx-auto">
          
          {/* Логотип */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">P</span>
            </div>
          </div>

          {/* Заголовок */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              ФИНАНСЫ — ЭТО ПРОСТО,<br />
              КОГДА ТЫ МОЖЕШЬ<br />
              РАССЧИТАТЬ ИХ САМ
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              Мы разработали удобные инструменты, которые помогут тебе<br />
              почувствовать контроль над своими деньгами<br />
              — рассчитай, сравни, спланируй.
            </p>
          </div>

          {/* Сетка калькуляторов */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {calculators.map((calc) => (
              <div key={calc.id} className="relative">
                <Link href={calc.link}>
                  <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[30px] p-8 text-white cursor-pointer hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                    
                    {/* Иконка стрелки */}
                    <div className="flex justify-end mb-4">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Заголовок */}
                    <h2 className="text-xl font-bold mb-4 leading-tight">
                      {calc.title}
                    </h2>

                    {/* Описание */}
                    <p className="text-white/90 mb-8 flex-grow text-sm leading-relaxed">
                      {calc.description}
                    </p>

                    {/* Кнопка */}
                    <button className="bg-white text-gray-800 rounded-full py-3 px-8 font-medium hover:bg-gray-100 transition-colors mb-6">
                      Рассчитать
                    </button>

                    {/* Изображение */}
                    <div className="relative h-24 mt-auto">
                      <Image 
                        src={calc.image}
                        alt={calc.title}
                        fill
                        style={{
                          objectFit: 'contain',
                          objectPosition: 'center bottom'
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
} 