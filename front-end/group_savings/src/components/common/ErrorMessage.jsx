import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 mb-5">
      <div>{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="self-end rounded-md border border-red-400 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
