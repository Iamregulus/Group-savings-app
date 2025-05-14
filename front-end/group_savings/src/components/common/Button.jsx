import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  onClick,
  disabled = false,
  icon,
  className = '',
}) => {
  const getButtonClasses = () => {
    let classes = 'rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900';
    
    // Variant
    if (variant === 'primary') {
      classes += ' bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400 text-white focus:ring-purple-500';
    } else if (variant === 'outline') {
      classes += ' border border-gray-300 dark:border-purple-400 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-purple-300 focus:ring-purple-500';
    } else if (variant === 'danger') {
      classes += ' bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400 text-white focus:ring-red-500';
    } else if (variant === 'success') {
      classes += ' bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400 text-white focus:ring-green-500';
    }
    
    // Size
    if (size === 'sm' || size === 'small') {
      classes += ' px-2.5 py-1.5 text-xs';
    } else if (size === 'lg' || size === 'large') {
      classes += ' px-6 py-3 text-base';
    } else {
      classes += ' px-4 py-2 text-sm'; // Default medium
    }
    
    // Width
    if (fullWidth) classes += ' w-full';
    
    // Disabled state
    if (disabled) {
      classes += ' opacity-50 cursor-not-allowed';
    } else {
      // Add shadow for better visibility in both modes
      classes += ' shadow-sm hover:shadow dark:shadow-lg dark:shadow-purple-900/30';
    }
    
    return `${classes} ${className}`;
  };
  
  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
