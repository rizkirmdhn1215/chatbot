"use client";

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type, duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseClasses = "fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300";
  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white"
  };

  return isVisible ? (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex items-center">
        <span>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="ml-3 hover:opacity-75"
        >
          ✕
        </button>
      </div>
    </div>
  ) : null;
};

export default Toast; 