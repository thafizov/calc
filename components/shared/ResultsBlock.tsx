import React from 'react';
import { ResultsBlockProps } from '../../types/calculator';
import Button from './Button';

const ResultsBlock: React.FC<ResultsBlockProps> = ({
  results,
  onActionClick,
  actionLabel = 'График начислений',
  className = ''
}) => {
  return (
    <div className={`bg-accent-blue text-white rounded-[32px] p-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {results.map((result, index) => (
          <div key={index} className={result.highlight ? 'md:col-span-2' : ''}>
            <div className="text-sm opacity-80">{result.label}</div>
            <div className="text-2xl font-bold">{result.value}</div>
          </div>
        ))}
        
        {onActionClick && (
          <div className="text-center md:text-right">
            <Button
              onClick={onActionClick}
              variant="primary"
              className="w-full md:w-auto"
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsBlock; 