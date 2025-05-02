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
    let classes = 'btn';
    
    // Variant
    if (variant === 'primary') classes += ' btn-primary';
    else if (variant === 'outline') classes += ' btn-outline';
    else if (variant === 'danger') classes += ' btn-danger';
    else if (variant === 'success') classes += ' btn-success';
    
    // Size
    if (size === 'small') classes += ' btn-sm';
    else if (size === 'large') classes += ' btn-lg';
    
    // Width
    if (fullWidth) classes += ' btn-full-width';
    
    return `${classes} ${className}`;
  };
  
  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
