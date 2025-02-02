import React, { useState, useEffect, createContext, useContext } from 'react';
import { Check, AlertCircle, X, Info } from 'lucide-react';

const NotificationContext = createContext(null);

const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-[#001a0d] border-green-500 text-green-500',
    error: 'bg-[#1a0d0d] border-red-500 text-red-500',
    info: 'bg-[#0d1a1a] border-cyan-500 text-cyan-500'
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        flex items-center gap-3 p-4 rounded-lg backdrop-blur-xl
        border ${colors[type]} min-w-[300px]
      `}>
        <div className="shrink-0">
          {icons[type]}
        </div>
        <p className="flex-1 text-white">{message}</p>
        <button 
          onClick={() => {
            setIsVisible(false);
            if (onClose) setTimeout(onClose, 300);
          }}
          className="shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      {notifications.map(({ id, ...props }) => (
        <Notification
          key={id}
          {...props}
          onClose={() => removeNotification(id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};