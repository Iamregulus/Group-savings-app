import React from 'react';

const SIZES = {
  small: 'h-5 w-5 border-2',
  medium: 'h-8 w-8 border-2',
  large: 'h-12 w-12 border-[3px]',
};

const Loader = ({ size = 'medium', centered = false }) => {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-emerald-600 dark:border-emerald-400 border-t-transparent ${SIZES[size] || SIZES.medium}`}
      role="status"
      aria-label="Loading"
    />
  );

  if (centered) {
    return <div className="flex items-center justify-center py-8">{spinner}</div>;
  }

  return spinner;
};

export default Loader;
