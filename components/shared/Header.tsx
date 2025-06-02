import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface MenuItem {
  label: string;
  href: string;
}

interface DropdownMenuProps {
  title: string;
  items: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
}

interface HeaderProps {
  hasScaling?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, items, isOpen, onToggle }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center space-x-1 px-4 py-2 text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="font-medium">{title}</span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="py-2">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => onToggle()}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ hasScaling = false }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  const calculatorItems: MenuItem[] = [
    { label: 'Депозитный калькулятор', href: '/deposit' },
    { label: 'Калькулятор доходности', href: '/calc' },
    { label: 'Тест заемщика', href: '/borrower' },
  ];

  const organizationItems: MenuItem[] = [
    { label: 'Новости', href: 'https://finance-arts.ru/#news' },
    { label: 'Гранты', href: 'https://finance-arts.ru/#grants' },
    { label: 'Стажировка', href: 'https://finance-arts.ru/#internships' },
    { label: 'Отзывы', href: 'https://finance-arts.ru/#team' },
    { label: 'Команда', href: 'https://finance-arts.ru/#team' },
    { label: 'Партнёры', href: 'https://finance-arts.ru/#partnership' },
  ];

  const handleDropdownToggle = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Обработка скролла для sticky header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Показать/скрыть header при скролле
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      // Изменить стиль при скролле
      setIsScrolled(currentScrollY > 50);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Закрытие меню при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Закрытие меню при нажатии Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <header 
      ref={headerRef} 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md' 
          : 'bg-white shadow-md'
        }
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className={`max-w-container mx-auto px-4 sm:px-6 lg:px-8 ${hasScaling ? 'lg:scale-90 lg:origin-center' : ''}`}>
        <div className="flex items-center justify-between h-16">
          
          {/* Логотип */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="relative w-10 h-10">
              <Image
                src="/img/logo.svg"
                alt="Logo"
                width={40}
                height={40}
                className="w-full h-full"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium text-lg leading-none uppercase">Финансы — это искусство</span>
            </div>
          </Link>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-4">
            <DropdownMenu
              title="Калькуляторы"
              items={calculatorItems}
              isOpen={openDropdown === 'calculators'}
              onToggle={() => handleDropdownToggle('calculators')}
            />
            
            <DropdownMenu
              title="Организация"
              items={organizationItems}
              isOpen={openDropdown === 'organization'}
              onToggle={() => handleDropdownToggle('organization')}
            />
          </nav>

          {/* Мобильное меню кнопка */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-in fade-in-0 slide-in-from-top-5 duration-200 bg-white">
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-900 font-semibold mb-2">Калькуляторы</h3>
                <div className="space-y-1 pl-4">
                  {calculatorItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="block text-gray-600 hover:text-gray-900 py-1 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-gray-900 font-semibold mb-2">Организация</h3>
                <div className="space-y-1 pl-4">
                  {organizationItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="block text-gray-600 hover:text-gray-900 py-1 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 