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

  // Demo-Daten generieren (mit Konflikten) - STRESSTEST VERSION
  const loadDemoData = () => {
    const year = new Date().getFullYear();
    const demoEvents = [
      // =============================================
      // APRIL - 5 Events, 2 Konflikte
      // =============================================
      // Trainingslager 1: Opti B Ostercamp
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
      // KONFLIKT 1: Opti C + Opti A am selben Wochenende mit Zodiac
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Frühjahrspokal Wannsee',
        organizer: 'Verein Seglerhaus',
        boatClassId: 'opti-c',
        startDate: `${year}-04-26`,
        endDate: `${year}-04-27`,
        motorboatLoadingTime: `${year}-04-25T08:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti A Auftaktregatta',
        organizer: 'Berliner Yacht-Club',
        boatClassId: 'opti-a',
        startDate: `${year}-04-26`,
        endDate: `${year}-04-27`,
        motorboatLoadingTime: `${year}-04-25T09:00`,
        requestedMotorboat: 'zodiac', // KONFLIKT mit Opti C!
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 2: 29er + J70 beide wollen Tornado rot
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: '29er Frühjahrsregatta',
        organizer: 'Potsdamer YC',
        boatClassId: '29er',
        startDate: `${year}-04-19`,
        endDate: `${year}-04-21`,
        motorboatLoadingTime: `${year}-04-18T07:00`,
        requestedMotorboat: 'tornado-rot',
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'J70 Saisonauftakt',
        organizer: 'TSC Berlin',
        boatClassId: 'j70',
        startDate: `${year}-04-19`,
        endDate: `${year}-04-20`,
        motorboatLoadingTime: `${year}-04-18T08:00`,
        requestedMotorboat: 'tornado-rot', // KONFLIKT mit 29er!
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },

      // =============================================
      // MAI - 7 Events, 3 Konflikte
      // =============================================
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Berliner Jugendpokal',
        organizer: 'Berliner Yacht-Club',
        boatClassId: 'opti-c',
        startDate: `${year}-05-03`,
        endDate: `${year}-05-04`,
        motorboatLoadingTime: `${year}-05-02T08:00`,
        requestedMotorboat: 'narwhal',
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 3: Opti B + Pirat wollen Narwhal
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti B Pfingstregatta',
        organizer: 'SC Tegeler See',
        boatClassId: 'opti-b',
        startDate: `${year}-05-10`,
        endDate: `${year}-05-12`,
        motorboatLoadingTime: `${year}-05-09T06:00`,
        requestedMotorboat: 'narwhal',
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Piraten Pfingstcup',
        organizer: 'Müggelsee YC',
        boatClassId: 'pirat',
        startDate: `${year}-05-10`,
        endDate: `${year}-05-12`,
        motorboatLoadingTime: `${year}-05-09T07:00`,
        requestedMotorboat: 'narwhal', // KONFLIKT mit Opti B!
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 4+5: Dreifach-Konflikt - 29er, J70, Opti A wollen Tornado rot
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: '29er Bundesliga Auftakt',
        organizer: 'Hamburger SC',
        boatClassId: '29er',
        startDate: `${year}-05-17`,
        endDate: `${year}-05-18`,
        motorboatLoadingTime: `${year}-05-16T05:00`,
        requestedMotorboat: 'tornado-rot',
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'J70 Nordcup 1',
        organizer: 'Kieler YC',
        boatClassId: 'j70',
        startDate: `${year}-05-17`,
        endDate: `${year}-05-19`,
        motorboatLoadingTime: `${year}-05-16T06:00`,
        requestedMotorboat: 'tornado-rot', // KONFLIKT!
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti A Landesmeisterschaft',
        organizer: 'Brandenburger SV',
        boatClassId: 'opti-a',
        startDate: `${year}-05-17`,
        endDate: `${year}-05-18`,
        motorboatLoadingTime: `${year}-05-16T07:00`,
        requestedMotorboat: 'tornado-rot', // KONFLIKT!
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti C Müggelseepokal',
        organizer: 'Köpenicker SC',
        boatClassId: 'opti-c',
        startDate: `${year}-05-24`,
        endDate: `${year}-05-25`,
        motorboatLoadingTime: `${year}-05-23T08:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },

      // =============================================
      // JUNI - 8 Events, 3 Konflikte
      // =============================================
      // Trainingslager 2: 29er Sommercamp
      {
        id: crypto.randomUUID(),
        type: 'trainingslager',
        name: 'Sommertrainingslager Travemünde',
        location: 'Travemünde',
        boatClassId: '29er',
        startDate: `${year}-06-01`,
        endDate: `${year}-06-07`,
        motorboatLoadingTime: `${year}-05-31T06:00`,
        requestedMotorboat: 'tornado-grau',
        assignedMotorboat: 'tornado-grau',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 6: J70 TL + 29er TL überschneiden sich mit Tornado grau
      {
        id: crypto.randomUUID(),
        type: 'trainingslager',
        name: 'J70 Intensivwoche',
        location: 'Warnemünde',
        boatClassId: 'j70',
        startDate: `${year}-06-05`,
        endDate: `${year}-06-10`,
        motorboatLoadingTime: `${year}-06-04T07:00`,
        requestedMotorboat: 'tornado-grau', // KONFLIKT mit 29er TL!
        assignedMotorboat: 'tornado-grau',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti A IDJüM Qualifikation',
        organizer: 'Flensburger SC',
        boatClassId: 'opti-a',
        startDate: `${year}-06-14`,
        endDate: `${year}-06-15`,
        motorboatLoadingTime: `${year}-06-13T05:00`,
        requestedMotorboat: 'tornado-rot',
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 7: Opti B + Opti C wollen Narwhal
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti B Sommerpokal',
        organizer: 'Wannsee YC',
        boatClassId: 'opti-b',
        startDate: `${year}-06-21`,
        endDate: `${year}-06-22`,
        motorboatLoadingTime: `${year}-06-20T08:00`,
        requestedMotorboat: 'narwhal',
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti C Tegeler Cup',
        organizer: 'TSC Berlin',
        boatClassId: 'opti-c',
        startDate: `${year}-06-21`,
        endDate: `${year}-06-22`,
        motorboatLoadingTime: `${year}-06-20T09:00`,
        requestedMotorboat: 'narwhal', // KONFLIKT mit Opti B!
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 8: Pirat + Opti A wollen Zodiac
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Piraten Sommerregatta',
        organizer: 'Spandauer YC',
        boatClassId: 'pirat',
        startDate: `${year}-06-28`,
        endDate: `${year}-06-29`,
        motorboatLoadingTime: `${year}-06-27T07:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti A Wannseepokal',
        organizer: 'Verein Seglerhaus',
        boatClassId: 'opti-a',
        startDate: `${year}-06-28`,
        endDate: `${year}-06-29`,
        motorboatLoadingTime: `${year}-06-27T08:00`,
        requestedMotorboat: 'zodiac', // KONFLIKT mit Pirat!
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'J70 Nordcup 2',
        organizer: 'Lübecker YC',
        boatClassId: 'j70',
        startDate: `${year}-06-28`,
        endDate: `${year}-06-30`,
        motorboatLoadingTime: `${year}-06-27T05:00`,
        requestedMotorboat: 'tornado-rot',
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },

      // =============================================
      // JULI - 8 Events, 3 Konflikte
      // =============================================
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti C Ferienregatta',
        organizer: 'Köpenicker SC',
        boatClassId: 'opti-c',
        startDate: `${year}-07-05`,
        endDate: `${year}-07-06`,
        motorboatLoadingTime: `${year}-07-04T08:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 9+10: 29er, J70, Pirat alle wollen Tornado rot
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: '29er Euro Cup',
        organizer: 'Warnemünder Woche',
        boatClassId: '29er',
        startDate: `${year}-07-12`,
        endDate: `${year}-07-15`,
        motorboatLoadingTime: `${year}-07-11T06:00`,
        requestedMotorboat: 'tornado-rot',
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'J70 Deutsche Meisterschaft',
        organizer: 'Kieler Woche',
        boatClassId: 'j70',
        startDate: `${year}-07-12`,
        endDate: `${year}-07-16`,
        motorboatLoadingTime: `${year}-07-11T07:00`,
        requestedMotorboat: 'tornado-rot', // KONFLIKT mit 29er!
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Piraten Norddeutsche',
        organizer: 'Travemünder YC',
        boatClassId: 'pirat',
        startDate: `${year}-07-13`,
        endDate: `${year}-07-14`,
        motorboatLoadingTime: `${year}-07-12T05:00`,
        requestedMotorboat: 'tornado-rot', // KONFLIKT mit 29er + J70!
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti B Ferienpokal',
        organizer: 'Berliner SC',
        boatClassId: 'opti-b',
        startDate: `${year}-07-19`,
        endDate: `${year}-07-20`,
        motorboatLoadingTime: `${year}-07-18T08:00`,
        requestedMotorboat: 'narwhal',
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 11: Opti A + Opti C wollen Zodiac
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti A Sommermeisterschaft',
        organizer: 'Müggelsee YC',
        boatClassId: 'opti-a',
        startDate: `${year}-07-26`,
        endDate: `${year}-07-27`,
        motorboatLoadingTime: `${year}-07-25T07:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti C Sommerpreis',
        organizer: 'Spandauer YC',
        boatClassId: 'opti-c',
        startDate: `${year}-07-26`,
        endDate: `${year}-07-27`,
        motorboatLoadingTime: `${year}-07-25T08:00`,
        requestedMotorboat: 'zodiac', // KONFLIKT mit Opti A!
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: '29er Bundesliga 2',
        organizer: 'Hamburger SC',
        boatClassId: '29er',
        startDate: `${year}-07-26`,
        endDate: `${year}-07-27`,
        motorboatLoadingTime: `${year}-07-25T05:00`,
        requestedMotorboat: 'tornado-grau',
        assignedMotorboat: 'tornado-grau',
        createdAt: new Date().toISOString()
      },

      // =============================================
      // AUGUST - 6 Events, 2 Konflikte
      // =============================================
      // Trainingslager 3: Pirat Sommercamp
      {
        id: crypto.randomUUID(),
        type: 'trainingslager',
        name: 'Piraten Sommercamp Kühlungsborn',
        location: 'Kühlungsborn',
        boatClassId: 'pirat',
        startDate: `${year}-08-02`,
        endDate: `${year}-08-08`,
        motorboatLoadingTime: `${year}-08-01T07:00`,
        requestedMotorboat: 'narwhal',
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 12: Opti B TL überschneidet sich mit Piraten TL - beide wollen Narwhal
      {
        id: crypto.randomUUID(),
        type: 'trainingslager',
        name: 'Opti B Intensivwoche',
        location: 'Stralsund',
        boatClassId: 'opti-b',
        startDate: `${year}-08-05`,
        endDate: `${year}-08-10`,
        motorboatLoadingTime: `${year}-08-04T08:00`,
        requestedMotorboat: 'narwhal', // KONFLIKT mit Pirat TL!
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti C Augustpokal',
        organizer: 'Wannsee YC',
        boatClassId: 'opti-c',
        startDate: `${year}-08-16`,
        endDate: `${year}-08-17`,
        motorboatLoadingTime: `${year}-08-15T08:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 13: 29er + J70 wollen Tornado rot
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: '29er Norddeutsche Meisterschaft',
        organizer: 'Lübecker YC',
        boatClassId: '29er',
        startDate: `${year}-08-23`,
        endDate: `${year}-08-25`,
        motorboatLoadingTime: `${year}-08-22T06:00`,
        requestedMotorboat: 'tornado-rot',
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'J70 Nordcup 3',
        organizer: 'Flensburger SC',
        boatClassId: 'j70',
        startDate: `${year}-08-23`,
        endDate: `${year}-08-24`,
        motorboatLoadingTime: `${year}-08-22T07:00`,
        requestedMotorboat: 'tornado-rot', // KONFLIKT mit 29er!
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti A IDJüM Vorbereitung',
        organizer: 'Berliner YC',
        boatClassId: 'opti-a',
        startDate: `${year}-08-30`,
        endDate: `${year}-08-31`,
        motorboatLoadingTime: `${year}-08-29T07:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },

      // =============================================
      // SEPTEMBER - 7 Events, 2 Konflikte
      // =============================================
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti B Herbstauftakt',
        organizer: 'Köpenicker SC',
        boatClassId: 'opti-b',
        startDate: `${year}-09-06`,
        endDate: `${year}-09-07`,
        motorboatLoadingTime: `${year}-09-05T08:00`,
        requestedMotorboat: 'narwhal',
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 14: Opti A + Pirat wollen Zodiac
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti A Herbstpreis Wannsee',
        organizer: 'Verein Seglerhaus',
        boatClassId: 'opti-a',
        startDate: `${year}-09-13`,
        endDate: `${year}-09-14`,
        motorboatLoadingTime: `${year}-09-12T08:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Piraten Herbstcup',
        organizer: 'SC Tegeler See',
        boatClassId: 'pirat',
        startDate: `${year}-09-13`,
        endDate: `${year}-09-15`,
        motorboatLoadingTime: `${year}-09-12T09:00`,
        requestedMotorboat: 'zodiac', // KONFLIKT mit Opti A!
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 15: 29er + J70 + Opti C - Dreifachkonflikt
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: '29er Bundesliga Finale',
        organizer: 'Berliner SC',
        boatClassId: '29er',
        startDate: `${year}-09-20`,
        endDate: `${year}-09-21`,
        motorboatLoadingTime: `${year}-09-19T06:00`,
        requestedMotorboat: 'tornado-grau',
        assignedMotorboat: 'tornado-grau',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'J70 Herbstmeisterschaft',
        organizer: 'Warnemünder YC',
        boatClassId: 'j70',
        startDate: `${year}-09-20`,
        endDate: `${year}-09-22`,
        motorboatLoadingTime: `${year}-09-19T07:00`,
        requestedMotorboat: 'tornado-grau', // KONFLIKT mit 29er!
        assignedMotorboat: 'tornado-grau',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti C Herbstpokal',
        organizer: 'Spandauer YC',
        boatClassId: 'opti-c',
        startDate: `${year}-09-20`,
        endDate: `${year}-09-21`,
        motorboatLoadingTime: `${year}-09-19T08:00`,
        requestedMotorboat: 'tornado-grau', // KONFLIKT mit 29er + J70!
        assignedMotorboat: 'tornado-grau',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti B Saisonabschluss',
        organizer: 'Müggelsee YC',
        boatClassId: 'opti-b',
        startDate: `${year}-09-27`,
        endDate: `${year}-09-28`,
        motorboatLoadingTime: `${year}-09-26T08:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },

      // =============================================
      // OKTOBER - 5 Events, 1 Konflikt
      // =============================================
      // Trainingslager 4: Opti A Herbstcamp
      {
        id: crypto.randomUUID(),
        type: 'trainingslager',
        name: 'Opti A Herbst-Intensivcamp',
        location: 'Steinhuder Meer',
        boatClassId: 'opti-a',
        startDate: `${year}-10-04`,
        endDate: `${year}-10-10`,
        motorboatLoadingTime: `${year}-10-03T07:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Piraten Saisonfinale',
        organizer: 'Berliner YC',
        boatClassId: 'pirat',
        startDate: `${year}-10-11`,
        endDate: `${year}-10-12`,
        motorboatLoadingTime: `${year}-10-10T08:00`,
        requestedMotorboat: 'narwhal',
        assignedMotorboat: 'narwhal',
        createdAt: new Date().toISOString()
      },
      // KONFLIKT 16: 29er + J70 Saisonfinale
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: '29er Saisonabschluss',
        organizer: 'Hamburger SC',
        boatClassId: '29er',
        startDate: `${year}-10-18`,
        endDate: `${year}-10-19`,
        motorboatLoadingTime: `${year}-10-17T06:00`,
        requestedMotorboat: 'tornado-rot',
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'J70 Saisonfinale',
        organizer: 'Kieler YC',
        boatClassId: 'j70',
        startDate: `${year}-10-18`,
        endDate: `${year}-10-20`,
        motorboatLoadingTime: `${year}-10-17T07:00`,
        requestedMotorboat: 'tornado-rot', // KONFLIKT mit 29er!
        assignedMotorboat: 'tornado-rot',
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'regatta',
        name: 'Opti C Abschlussregatta',
        organizer: 'TSC Berlin',
        boatClassId: 'opti-c',
        startDate: `${year}-10-25`,
        endDate: `${year}-10-26`,
        motorboatLoadingTime: `${year}-10-24T08:00`,
        requestedMotorboat: 'zodiac',
        assignedMotorboat: 'zodiac',
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
