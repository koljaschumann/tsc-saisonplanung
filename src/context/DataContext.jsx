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

  // Demo-Daten generieren (mit Konflikten)
  const loadDemoData = () => {
    const year = new Date().getFullYear();
    const demoEvents = [
      // Opti C Events
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Berliner Jugendpokal',
        organizer: 'Berliner Yacht-Club',
        boatClassId: 'opti-c',
        startDate: `${year}-05-10`,
        endDate: `${year}-05-12`,
        motorboatLoadingTime: `${year}-05-09T08:00`,
        requestedMotorboat: 'narwhal',
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      // Opti B Events
      {
        id: crypto.randomUUID(),
        type: 'trainingslager',
        name: 'Ostertrainingslager Greifswald',
        location: 'Greifswald',
        boatClassId: 'opti-b',
        startDate: `${year}-04-12`,
        endDate: `${year}-04-18`,
        motorboatLoadingTime: `${year}-04-11T14:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      // Opti A Events
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Norddeutsche Meisterschaft',
        organizer: 'Kieler Yacht-Club',
        boatClassId: 'opti-a',
        startDate: `${year}-06-20`,
        endDate: `${year}-06-23`,
        motorboatLoadingTime: `${year}-06-19T06:00`,
        requestedMotorboat: 'tornado-rot',
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      // 29er Events - KONFLIKT mit J70!
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: '29er Euro Cup',
        organizer: 'TSC Berlin',
        boatClassId: '29er',
        startDate: `${year}-07-15`,
        endDate: `${year}-07-18`,
        motorboatLoadingTime: `${year}-07-14T08:00`,
        requestedMotorboat: 'tornado-rot',
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      // J70 Events - KONFLIKT mit 29er!
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'J70 Deutsche Meisterschaft',
        organizer: 'Warnemünder Woche',
        boatClassId: 'j70',
        startDate: `${year}-07-16`,
        endDate: `${year}-07-20`,
        motorboatLoadingTime: `${year}-07-15T10:00`,
        requestedMotorboat: 'tornado-rot', // Gleicher Boot = KONFLIKT!
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      // Pirat Events
      {
        id: crypto.randomUUID(),
        type: 'trainingslager',
        name: 'Sommertrainingslager Kühlungsborn',
        location: 'Kühlungsborn',
        boatClassId: 'pirat',
        startDate: `${year}-08-01`,
        endDate: `${year}-08-07`,
        motorboatLoadingTime: `${year}-07-31T16:00`,
        requestedMotorboat: 'narwhal',
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      // Weiterer Konflikt: Opti A und Pirat
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Herbstpreis Wannsee',
        organizer: 'Verein Seglerhaus',
        boatClassId: 'opti-a',
        startDate: `${year}-09-14`,
        endDate: `${year}-09-15`,
        motorboatLoadingTime: `${year}-09-13T08:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Piraten-Herbstcup',
        organizer: 'SC Tegeler See',
        boatClassId: 'pirat',
        startDate: `${year}-09-14`,
        endDate: `${year}-09-16`,
        motorboatLoadingTime: `${year}-09-13T09:00`,
        requestedMotorboat: 'zodiac', // Gleicher Boot = KONFLIKT!
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      // 29er weiteres Event
      {
        id: crypto.randomUUID(),
        type: 'trainingslager',
        name: 'Herbst-Intensivtraining',
        location: 'Steinhuder Meer',
        boatClassId: '29er',
        startDate: `${year}-10-05`,
        endDate: `${year}-10-10`,
        motorboatLoadingTime: `${year}-10-04T07:00`,
        requestedMotorboat: 'tornado-grau',
        assignedMotorboat: 'tornado-grau',
        createdAt: new Date().toISOString()
      }
    ];

    setEvents(demoEvents);

    // Saison anpassen
    setSeason({
      start: `${year}-04-01`,
      end: `${year}-10-31`,
      name: `Saison ${year}`
    });

    // Deadline in die Zukunft setzen
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    setDeadline(futureDate.toISOString().split('T')[0]);

    return demoEvents.length;
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
      resetAllData,
      loadDemoData
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
