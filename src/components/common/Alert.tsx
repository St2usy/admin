import React from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', message, onClose }) => {
  const typeStyles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };

  return (
    <div
      className={`border rounded-md p-4 mb-4 ${typeStyles[type]} flex items-center justify-between`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      )}
    </div>
  );
};
