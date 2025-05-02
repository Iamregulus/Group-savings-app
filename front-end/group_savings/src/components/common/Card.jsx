import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  onClick,
  noPadding = false,
}) => {
  return (
    <div 
      className={`card ${noPadding ? 'no-padding' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;