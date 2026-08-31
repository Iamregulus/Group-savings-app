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
  ...rest
}) => {
  const getButtonClasses = () => {
    let classes = 'rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 inline-flex items-center justify-center';

    if (variant === 'primary') {
      classes += ' bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white focus:ring-emerald-500';
    } else if (variant === 'outline') {
      classes += ' border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-emerald-500';
    } else if (variant === 'danger') {
      classes += ' bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400 text-white focus:ring-red-500';
    } else if (variant === 'success') {
      classes += ' bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400 text-white focus:ring-green-500';
    }

    if (size === 'sm' || size === 'small') {
      classes += ' px-2.5 py-1.5 text-xs';
    } else if (size === 'lg' || size === 'large') {
      classes += ' px-6 py-3 text-base';
    } else {
      classes += ' px-4 py-2 text-sm';
    }

    if (fullWidth) classes += ' w-full';

    if (disabled) {
      classes += ' opacity-50 cursor-not-allowed';
    } else {
      classes += ' shadow-sm hover:shadow';
    }

    return `${classes} ${className}`;
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
