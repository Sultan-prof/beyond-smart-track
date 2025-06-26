import React, { createContext, useContext, useState, useEffect } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialUsers } from '@/lib/data';

    const AuthContext = createContext();

    export const useAuth = () => {
      return useContext(AuthContext);
    };

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [users, setUsers] = useLocalStorage('users', initialUsers);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const loggedInUser = localStorage.getItem('bst-auth-user');
        if (loggedInUser) {
          setUser(JSON.parse(loggedInUser));
        }
        setLoading(false);
      }, []);

      const login = (email, password) => {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('bst-auth-user', JSON.stringify(foundUser));
          return foundUser;
        }
        return null;
      };

      const logout = () => {
        setUser(null);
        localStorage.removeItem('bst-auth-user');
      };

      const value = {
        user,
        users,
        setUsers,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      };

      return (
        <AuthContext.Provider value={value}>
          {!loading && children}
        </AuthContext.Provider>
      );
    };