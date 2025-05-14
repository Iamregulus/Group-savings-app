import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label block mb-2 text-gray-900 dark:text-white font-medium">
          {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300
        ${error ? 'border-red-500 dark:border-red-400' : ''}`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        {...props}
      />
      {error && <div className="form-error mt-1 text-red-500 dark:text-red-400 text-sm">{error}</div>}
    </div>
  );
};

export default Input;