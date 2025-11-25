import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'easy' | 'good' | 'hard';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  
  const baseStyles = "px-6 py-3 rounded-2xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-pastel-orange text-pastel-dark hover:bg-[#FFC485]",
    secondary: "bg-white border-2 border-pastel-orange text-pastel-dark hover:bg-gray-50",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
    easy: "bg-pastel-yellow text-pastel-dark hover:brightness-95 w-full h-16 text-lg",
    good: "bg-pastel-green text-pastel-dark hover:brightness-95 w-full h-16 text-lg",
    hard: "bg-pastel-pink text-pastel-dark hover:brightness-95 w-full h-16 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">⏳</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
