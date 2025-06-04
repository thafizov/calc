import React from 'react';
import { CreditAlert } from '../hooks/useBorrowerTest';

interface FloatingCreditButtonProps {
  alert: CreditAlert;
  onClick: () => void;
  isVisible: boolean;
}

const FloatingCreditButton: React.FC<FloatingCreditButtonProps> = ({ 
  alert, 
  onClick, 
  isVisible
}) => {
  const getBackgroundColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500 hover:bg-green-600';
      case 'yellow':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'orange':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'red':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getShadowColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'shadow-green-500/30';
      case 'yellow':
        return 'shadow-yellow-500/30';
      case 'orange':
        return 'shadow-orange-500/30';
      case 'red':
        return 'shadow-red-500/30';
      default:
        return 'shadow-gray-500/30';
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full
        ${getBackgroundColor(alert.color)}
        ${getShadowColor(alert.color)}
        shadow-lg shadow-lg
        text-white text-2xl
        flex items-center justify-center
        transition-all duration-300 ease-out
        transform hover:scale-110 active:scale-95
        animate-bounce
        focus:outline-none focus:ring-4 focus:ring-white/30
        backdrop-blur-sm
      `}
      style={{
        animation: 'fadeInScale 0.5s ease-out, bounce 2s infinite 1s'
      }}
      title={`${alert.title} - Нажмите для перехода к результатам`}
    >
      <span className="animate-pulse">{alert.icon}</span>
      
      {/* Пульсирующий эффект */}
      <div 
        className={`
          absolute inset-0 rounded-full
          ${getBackgroundColor(alert.color).split(' ')[0]}
          opacity-30 animate-ping
        `}
        style={{
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
        }}
      />
    </button>
  );
};

export default FloatingCreditButton; 