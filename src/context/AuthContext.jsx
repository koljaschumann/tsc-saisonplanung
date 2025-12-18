import { createContext, useContext, useState, useEffect } from 'react';
import { boatClasses } from '../data/boatClasses';

const AuthContext = createContext();

const ADMIN_PASSWORD = 'tsc2025'; // In Produktion: sicherer speichern

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('tsc-saisonplanung-user');
    return saved ? JSON.parse(saved) : { boatClassId: null, isAdmin: false };
  });

  useEffect(() => {
    localStorage.setItem('tsc-saisonplanung-user', JSON.stringify(currentUser));
  }, [currentUser]);

  const selectBoatClass = (boatClassId) => {
    setCurrentUser(prev => ({ ...prev, boatClassId }));
  };

  const loginAsAdmin = (password) => {
    if (password === ADMIN_PASSWORD) {
      setCurrentUser(prev => ({ ...prev, isAdmin: true }));
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setCurrentUser(prev => ({ ...prev, isAdmin: false }));
  };

  const logout = () => {
    setCurrentUser({ boatClassId: null, isAdmin: false });
  };

  const isLoggedIn = currentUser.boatClassId !== null;

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn,
      selectBoatClass,
      loginAsAdmin,
      logoutAdmin,
      logout,
      boatClasses
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
