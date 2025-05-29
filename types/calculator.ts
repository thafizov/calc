// Общие типы для всех калькуляторов
export interface BaseCalculatorProps {
  className?: string;
}

export interface InputFieldProps extends BaseCalculatorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'number';
  suffix?: React.ReactNode;
}

export interface SelectFieldProps extends BaseCalculatorProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export interface CheckboxFieldProps extends BaseCalculatorProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface ButtonProps extends BaseCalculatorProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export interface CalculatorLayoutProps {
  title: string;
  subtitle: string;
  heroImage?: string;
  children: React.ReactNode;
  badge?: string;
}

export interface FormContainerProps extends BaseCalculatorProps {
  children: React.ReactNode;
}

export interface ResultsBlockProps extends BaseCalculatorProps {
  results: Array<{
    label: string;
    value: string;
    highlight?: boolean;
  }>;
  onActionClick?: () => void;
  actionLabel?: string;
} 