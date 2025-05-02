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
      case 'small': return 'modal-small';
      case 'large': return 'modal-large';
      case 'full': return 'modal-full';
      default: return 'modal-medium';
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal ${getSizeClass()}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {actions && (
          <div className="modal-footer">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;