import { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';

export default function NotificationModal() {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getUnread();
      if (response.data.notifications.length > 0) {
        setNotifications(response.data.notifications);
        setShow(true);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleClose = async () => {
    try {
      await notificationAPI.markAsRead();
      setShow(false);
      setNotifications([]);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  if (!show || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ⚠️ Notificaciones Importantes
          </h2>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded"
              >
                <p className="text-gray-800 font-medium">{notification.message}</p>
                {notification.nombre_grupo && (
                  <p className="text-sm text-gray-600 mt-2">
                    Grupo: {notification.nombre_grupo}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.created_at).toLocaleString('es-ES')}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
