import React from 'react';

// Chrome only (background/border/radius/shadow) -- padding is intentionally
// not built in, since every call site's `className` controls its own
// spacing (avoids double-padding when both this component and a caller try
// to add it).
const Card = ({
  children,
  title,
  subtitle,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm ${className}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
