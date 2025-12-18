import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DataContext = createContext();

// Initiale Deadline: 1. März des aktuellen Jahres
const getDefaultDeadline = () => {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-03-01`;
};

// Initiale Saison: April bis Oktober
const getDefaultSeason = () => {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
  return {
    start: `${year}-04-01`,
    end: `${year}-10-31`,
    name: `Saison ${year}`
  };
};

export function DataProvider({ children }) {
  const [events, setEvents] = useLocalStorage('tsc-saisonplanung-events', []);
  const [deadline, setDeadline] = useLocalStorage('tsc-saisonplanung-deadline', getDefaultDeadline());
  const [season, setSeason] = useLocalStorage('tsc-saisonplanung-season', getDefaultSeason());

  // Event hinzufügen
  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      assignedMotorboat: event.requestedMotorboat // Initial: zugewiesen = gewünscht
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  // Event aktualisieren
  const updateEvent = (id, updates) => {
    setEvents(prev => prev.map(event =>
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  // Event löschen
  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  // Events für eine Bootsklasse
  const getEventsByBoatClass = (boatClassId) => {
    return events.filter(event => event.boatClassId === boatClassId);
  };

  // Events für einen Zeitraum
  const getEventsInRange = (startDate, endDate) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      return eventStart <= rangeEnd && eventEnd >= rangeStart;
    });
  };

  // Prüfen ob Eingabefrist abgelaufen
  const isDeadlinePassed = () => {
    return new Date() > new Date(deadline);
  };

  // Motorboot-Zuweisung ändern
  const assignMotorboat = (eventId, motorboatId) => {
    updateEvent(eventId, { assignedMotorboat: motorboatId });
  };

  // Alle Daten zurücksetzen (für Admin)
  const resetAllData = () => {
    setEvents([]);
    setDeadline(getDefaultDeadline());
    setSeason(getDefaultSeason());
  };

  return (
    <DataContext.Provider value={{
      events,
      deadline,
      season,
      setDeadline,
      setSeason,
      addEvent,
      updateEvent,
      deleteEvent,
      getEventsByBoatClass,
      getEventsInRange,
      isDeadlinePassed,
      assignMotorboat,
      resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
