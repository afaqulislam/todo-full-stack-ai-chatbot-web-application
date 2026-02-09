'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((type: NotificationType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { id, type, message, duration };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    setTimeout(() => {
      hideNotification(id);
    }, duration);
  }, [hideNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[1000] space-y-2 w-full max-w-sm px-4">
        {notifications.map((notification) => {
          let bgColor = '';
          let borderColor = '';
          let textColor = '';
          // let icon = null;

          switch (notification.type) {
            case 'success':
              bgColor = 'bg-white border border-green-200';
              borderColor = 'border-green-200';
              textColor = 'text-green-700';
              break;
            case 'error':
              bgColor = 'bg-white border border-red-200';
              borderColor = 'border-red-200';
              textColor = 'text-red-700';
              break;
            case 'warning':
              bgColor = 'bg-white border border-yellow-200';
              borderColor = 'border-yellow-200';
              textColor = 'text-yellow-700';
              break;
            case 'info':
              bgColor = 'bg-white border border-blue-200';
              borderColor = 'border-blue-200';
              textColor = 'text-blue-700';
              break;
          }

          return (
            <div
              key={notification.id}
              className={`p-4 rounded-xl shadow-lg flex items-start justify-between animate-slide-down transition-all duration-300 max-w-sm w-full ${bgColor} ${textColor}`}
            >
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-sm font-medium flex-1">
                  {notification.message}
                </span>
              </div>
              <button
                onClick={() => hideNotification(notification.id)}
                className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}