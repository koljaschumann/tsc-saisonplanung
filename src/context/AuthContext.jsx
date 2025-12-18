import { createContext, useContext, useState, useEffect } from 'react';
import { boatClasses } from '../data/boatClasses';

const AuthContext = createContext();

const ADMIN_PASSWORD = 'tsc2025'; // In Produktion: sicherer speichern

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('tsc-saisonplanung-user');
    return saved ? JSON.parse(saved) : {
      name: '',
      boatClassIds: [], // Mehrere Bootsklassen
      selectedBoatClassId: null, // Aktuell ausgewählte Klasse für Eingaben
      isAdmin: false
    };
  });

  useEffect(() => {
    localStorage.setItem('tsc-saisonplanung-user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Trainer mit Name und Bootsklassen registrieren
  const registerTrainer = (name, boatClassIds) => {
    setCurrentUser(prev => ({
      ...prev,
      name,
      boatClassIds,
      selectedBoatClassId: boatClassIds[0] || null
    }));
  };

  // Aktive Bootsklasse für Eingaben wechseln
  const selectBoatClass = (boatClassId) => {
    if (currentUser.boatClassIds.includes(boatClassId) || currentUser.isAdmin) {
      setCurrentUser(prev => ({ ...prev, selectedBoatClassId: boatClassId }));
    }
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
    setCurrentUser({
      name: '',
      boatClassIds: [],
      selectedBoatClassId: null,
      isAdmin: false
    });
  };

  // Kompatibilität: boatClassId = selectedBoatClassId
  const isLoggedIn = currentUser.name !== '' && currentUser.boatClassIds.length > 0;

  return (
    <AuthContext.Provider value={{
      currentUser: {
        ...currentUser,
        // Kompatibilität mit altem Code
        boatClassId: currentUser.selectedBoatClassId
      },
      isLoggedIn,
      registerTrainer,
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
