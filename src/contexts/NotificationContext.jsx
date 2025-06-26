import React, { createContext, useContext } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialNotifications } from '@/lib/data';
    import { useAuth } from './AuthContext';
    
    const NotificationContext = createContext();
    
    export const useNotifications = () => {
        return useContext(NotificationContext);
    };
    
    export const NotificationsProvider = ({ children }) => {
        const [notifications, setNotifications] = useLocalStorage('notifications', initialNotifications);
        const { user, users } = useAuth();
    
        const addNotification = (notification) => {
            const newNotification = {
                id: `notif-${Date.now()}`,
                ...notification,
                date: new Date().toISOString(),
                read: false,
            };
            setNotifications(prev => [newNotification, ...prev]);
        };

        const addNotificationForRoles = ({ roles, message, link }) => {
            const targetUsers = users.filter(u => roles.includes(u.role));
            targetUsers.forEach(targetUser => {
                addNotification({
                    userId: targetUser.id,
                    message,
                    link
                });
            });
        };
    
        const markAsRead = (id) => {
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, read: true } : n))
            );
        };
    
        const markAllAsRead = () => {
            setNotifications(prev =>
                prev.map(n => (n.userId === user?.id && !n.read ? { ...n, read: true } : n))
            );
        };
    
        const userNotifications = notifications.filter(n => n.userId === user?.id || (user?.role === 'Admin' && n.userId === 'all'));
    
        const value = {
            notifications: userNotifications,
            allNotifications: notifications,
            addNotification,
            addNotificationForRoles,
            markAsRead,
            markAllAsRead
        };
    
        return (
            <NotificationContext.Provider value={value}>
                {children}
            </NotificationContext.Provider>
        );
    };