import React, { useEffect } from 'react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'medium',
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'max-w-md';
      case 'large': return 'max-w-2xl';
      case 'full': return 'max-w-4xl';
      default: return 'max-w-lg';
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-70 p-4" onClick={onClose}>
      <div 
        className={`${getSizeClass()} relative w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 dark:border-gray-700 p-4 md:p-5 bg-gray-100 dark:bg-gray-900">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button 
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            onClick={onClose}
          >
            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="p-4 md:p-5 space-y-4 text-gray-800 dark:text-gray-200">
          {children}
        </div>
        {actions && (
          <div className="flex items-center justify-end space-x-2 rounded-b-lg border-t border-gray-200 dark:border-gray-700 p-4 md:p-5 bg-gray-100 dark:bg-gray-900">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;