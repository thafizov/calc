import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { CalculatorLayoutProps } from '../../types/calculator';

const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  title,
  subtitle,
  heroImage = '/calc/img/cards.png',
  children,
  badge
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={subtitle} />
      </Head>
      
      <main className="min-h-screen bg-deep-blue">
        <div className="relative py-8 md:py-10 lg:py-10 laptop:py-12 px-4 max-w-container mx-auto lg:scale-90 lg:origin-top">
          <div className="block md:grid md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
            {/* Левая колонка с текстом */}
            <div className="lg:col-span-5">
              {badge && (
                <div className="inline-flex items-center px-[30px] py-[5px] bg-accent-blue text-white text-subhead rounded-[30px]">
                  {badge}
                </div>
              )}
              
              <h1 className="text-head text-white mt-1.5 md:mt-2.5 leading-tight md:leading-normal">
                {title}
              </h1>
              
              <p className="text-subhead text-white/80 mt-1.5 md:mt-6 lg:mt-10 mb-12 md:mb-16 lg:mb-0">
                {subtitle}
              </p>
            </div>

            {/* Правая колонка с картинкой */}
            <div className="hidden md:block lg:col-span-7 relative h-[300px] md:h-[400px]">
              <Image 
                src={heroImage}
                alt="Иллюстрация калькулятора"
                fill
                style={{
                  objectFit: 'contain',
                  objectPosition: 'right center'
                }}
                priority
              />
            </div>
          </div>

          {/* Контент калькулятора */}
          <div className="relative -mt-8 md:-mt-12 lg:-mt-20">
            <div className="relative z-10">
              <div className="bg-white rounded-[30px] shadow-lg max-w-container mx-auto">
                <div className="max-w-container mx-auto px-6 md:px-10 lg:px-9 laptop:px-[60px] py-12 md:py-16 lg:py-14 laptop:py-[80px]">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CalculatorLayout; 