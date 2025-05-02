import React from 'react';

const Loader = ({ size = 'medium', centered = false }) => {
  const getLoaderClasses = () => {
    let classes = 'loader';
    
    // Size
    if (size === 'small') classes += ' loader-sm';
    else if (size === 'large') classes += ' loader-lg';
    
    // Centered
    if (centered) classes += ' loader-centered';
    
    return classes;
  };
  
  return (
    <div className={getLoaderClasses()}>
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;