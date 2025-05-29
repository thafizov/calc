import React, { forwardRef } from 'react';
import { CreditAlert as CreditAlertType } from '../hooks/useBorrowerTest';

interface CreditAlertProps {
  alert: CreditAlertType;
}

const CreditAlert = forwardRef<HTMLDivElement, CreditAlertProps>(({ alert }, ref) => {
  const getBackgroundColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      case 'orange':
        return 'bg-orange-50 border-orange-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-800';
      case 'yellow':
        return 'text-yellow-800';
      case 'orange':
        return 'text-orange-800';
      case 'red':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'orange':
        return 'text-orange-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div 
      ref={ref}
      className={`
        rounded-[30px] border-2 p-6 md:p-8 
        ${getBackgroundColor(alert.color)} 
        transition-all duration-300
        animate-slideUpFadeIn
      `}
      style={{
        animation: 'slideUpFadeIn 0.6s ease-out'
      }}
    >
      <div className="flex items-start gap-4">
        <div className={`text-2xl ${getIconColor(alert.color)} flex-shrink-0 mt-1`}>
          {alert.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-xl md:text-2xl font-bold mb-3 ${getTextColor(alert.color)}`}>
            {alert.title}
          </h3>
          <p className={`text-base md:text-lg mb-4 leading-relaxed ${getTextColor(alert.color)}`}>
            {alert.message}
          </p>
          
          {alert.recommendations.length > 0 && (
            <div className="space-y-2">
              {alert.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${
                    alert.color === 'green' ? 'bg-green-600' :
                    alert.color === 'yellow' ? 'bg-yellow-600' :
                    alert.color === 'orange' ? 'bg-orange-600' :
                    'bg-red-600'
                  }`} />
                  <p className={`text-sm md:text-base leading-relaxed ${getTextColor(alert.color)} opacity-90`}>
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CreditAlert.displayName = 'CreditAlert';

export default CreditAlert; 