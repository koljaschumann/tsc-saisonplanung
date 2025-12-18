import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ToastProvider, useToast } from './components/common/Toast';
import { GlassCard } from './components/common/GlassCard';
import { Button } from './components/common/Button';
import { Modal } from './components/common/Modal';
import { IconBadge } from './components/common/IconBadge';
import { Icons } from './components/common/Icons';
import { boatClasses, getBoatClassName, getBoatClassColor } from './data/boatClasses';
import { getMotorboatName } from './data/motorboats';
import { formatDate, formatDateRange } from './utils/dateUtils';
import { EventForm } from './components/forms/EventForm';
import { SeasonTimeline } from './components/calendar/SeasonTimeline';
import { findConflicts, getMotorboatUsage, applySuggestion } from './utils/conflictResolver';
import { motorboats } from './data/motorboats';
import { generateSeasonCalendarPDF, generateMotorboatPlanPDF, savePDF } from './utils/pdfGenerator';

// ============================================
// LOGIN SCREEN
// ============================================
function LoginScreen() {
  const { isDark } = useTheme();
  const { registerTrainer, loginAsAdmin } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [selectedBoatClassIds, setSelectedBoatClassIds] = useState([]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginAsAdmin(adminPassword)) {
      setShowAdminLogin(false);
      setAdminPassword('');
      setError('');
    } else {
      setError('Falsches Passwort');
    }
  };

  const toggleBoatClass = (boatClassId) => {
    setSelectedBoatClassIds(prev =>
      prev.includes(boatClassId)
        ? prev.filter(id => id !== boatClassId)
        : [...prev, boatClassId]
    );
  };

  const handleTrainerLogin = () => {
    if (!trainerName.trim()) {
      setError('Bitte Namen eingeben');
      return;
    }
    if (selectedBoatClassIds.length === 0) {
      setError('Bitte mindestens eine Trainingsgruppe auswählen');
      return;
    }
    registerTrainer(trainerName.trim(), selectedBoatClassIds);
  };

  const inputClass = `
    w-full px-3 py-2 rounded-lg border
    ${isDark
      ? 'bg-navy-700 border-navy-600 text-cream placeholder-cream/40'
      : 'bg-white border-light-border text-light-text placeholder-light-muted'}
    focus:outline-none focus:ring-2
    ${isDark ? 'focus:ring-gold-400' : 'focus:ring-teal-400'}
  `;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <IconBadge icon={Icons.sailboat} color="gold" size="lg" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
            TSC Jugend
          </h1>
          <p className={`text-lg ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
            Saisonplanung
          </p>
        </div>

        <GlassCard>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-cream' : 'text-light-text'}`}>
            Trainer-Anmeldung
          </h2>

          {/* Trainer Name Input */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-cream/80' : 'text-light-muted'}`}>
              Dein Name *
            </label>
            <input
              type="text"
              value={trainerName}
              onChange={(e) => { setTrainerName(e.target.value); setError(''); }}
              className={inputClass}
              placeholder="z.B. Max Mustermann"
            />
          </div>

          {/* Boat Class Multi-Select */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-cream/80' : 'text-light-muted'}`}>
              Deine Trainingsgruppe(n) *
            </label>
            <p className={`text-xs mb-3 ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
              Wähle alle Gruppen, die du betreust
            </p>
            <div className="grid grid-cols-2 gap-3">
              {boatClasses.map(bc => {
                const isSelected = selectedBoatClassIds.includes(bc.id);
                return (
                  <button
                    key={bc.id}
                    type="button"
                    onClick={() => { toggleBoatClass(bc.id); setError(''); }}
                    className={`
                      p-3 rounded-xl border-2 transition-all
                      ${isSelected
                        ? isDark
                          ? 'bg-gold-400/20 border-gold-400'
                          : 'bg-teal-100 border-teal-400'
                        : isDark
                          ? 'bg-navy-800/50 border-navy-600 hover:border-gold-400/50'
                          : 'bg-white border-light-border hover:border-teal-400'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: bc.color }}
                      />
                      <span className={`text-sm font-medium ${isDark ? 'text-cream' : 'text-light-text'}`}>
                        {bc.name}
                      </span>
                      {isSelected && (
                        <span className={`ml-auto w-4 h-4 ${isDark ? 'text-gold-400' : 'text-teal-600'}`}>
                          {Icons.check}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm text-coral">{error}</p>
          )}

          <Button onClick={handleTrainerLogin} className="w-full mb-4">
            Anmelden
          </Button>

          <div className={`border-t pt-4 ${isDark ? 'border-navy-700' : 'border-light-border'}`}>
            <Button
              variant="ghost"
              onClick={() => setShowAdminLogin(true)}
              icon={Icons.lock}
              className="w-full"
            >
              Als Admin anmelden
            </Button>
          </div>
        </GlassCard>

        {/* Admin Login Modal */}
        <Modal
          isOpen={showAdminLogin}
          onClose={() => {
            setShowAdminLogin(false);
            setAdminPassword('');
            setError('');
          }}
          title="Admin-Anmeldung"
          size="sm"
        >
          <form onSubmit={handleAdminLogin}>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-cream/80' : 'text-light-muted'}`}>
                Passwort
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className={inputClass}
                placeholder="Admin-Passwort eingeben"
                autoFocus
              />
              {error && showAdminLogin && (
                <p className="mt-2 text-sm text-coral">{error}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPassword('');
                  setError('');
                }}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button type="submit" className="flex-1">
                Anmelden
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

// ============================================
// NAVIGATION
// ============================================
function Navigation({ currentPage, setCurrentPage }) {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout, logoutAdmin, selectBoatClass, boatClasses: authBoatClasses } = useAuth();
  const { isDeadlinePassed } = useData();
  const [showBoatClassMenu, setShowBoatClassMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.home },
    { id: 'events', label: 'Veranstaltungen', icon: Icons.calendar },
    { id: 'overview', label: 'Saisonübersicht', icon: Icons.trophy },
    { id: 'boats', label: 'Motorboote', icon: Icons.boat },
  ];

  if (currentUser.isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Icons.settings });
  }

  // Trainer's assigned boat classes
  const trainerBoatClasses = boatClasses.filter(bc =>
    currentUser.boatClassIds?.includes(bc.id)
  );

  return (
    <nav className={`
      sticky top-0 z-40 border-b backdrop-blur-xl
      ${isDark ? 'bg-navy-900/80 border-navy-700' : 'bg-white/80 border-light-border'}
    `}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <IconBadge icon={Icons.sailboat} color="gold" size="sm" />
            <span className={`font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
              TSC Saisonplanung
            </span>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  flex items-center gap-2
                  ${currentPage === item.id
                    ? isDark
                      ? 'bg-navy-700 text-cream'
                      : 'bg-white text-light-text shadow-sm'
                    : isDark
                      ? 'text-cream/60 hover:text-cream hover:bg-navy-800/50'
                      : 'text-light-muted hover:text-light-text hover:bg-light-border/50'}
                `}
              >
                <span className="w-4 h-4">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center
                ${isDark
                  ? 'text-cream/60 hover:text-cream hover:bg-navy-800'
                  : 'text-light-muted hover:text-light-text hover:bg-light-border'}
              `}
            >
              <span className="w-5 h-5">
                {isDark ? Icons.sun : Icons.moon}
              </span>
            </button>

            {/* User Info with Boat Class Switcher */}
            <div className="relative">
              <button
                onClick={() => trainerBoatClasses.length > 1 && setShowBoatClassMenu(!showBoatClassMenu)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full
                  ${isDark ? 'bg-navy-800' : 'bg-light-border/50'}
                  ${trainerBoatClasses.length > 1 ? 'cursor-pointer hover:ring-2 ring-gold-400/50' : ''}
                `}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getBoatClassColor(currentUser.boatClassId) }}
                />
                <span className={`text-sm ${isDark ? 'text-cream' : 'text-light-text'}`}>
                  {currentUser.name || getBoatClassName(currentUser.boatClassId)}
                </span>
                {trainerBoatClasses.length > 1 && (
                  <span className={`w-3 h-3 ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                    {Icons.chevronDown}
                  </span>
                )}
                {currentUser.isAdmin && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-gold-400/20 text-gold-400' : 'bg-teal-100 text-teal-600'}`}>
                    Admin
                  </span>
                )}
              </button>

              {/* Boat Class Dropdown */}
              {showBoatClassMenu && trainerBoatClasses.length > 1 && (
                <div className={`
                  absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl z-50 overflow-hidden
                  ${isDark ? 'bg-navy-800 border border-navy-700' : 'bg-white border border-light-border'}
                `}>
                  <div className={`px-3 py-2 border-b ${isDark ? 'border-navy-700' : 'border-light-border'}`}>
                    <p className={`text-xs font-medium ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                      Aktive Trainingsgruppe
                    </p>
                  </div>
                  {trainerBoatClasses.map(bc => (
                    <button
                      key={bc.id}
                      onClick={() => {
                        selectBoatClass(bc.id);
                        setShowBoatClassMenu(false);
                      }}
                      className={`
                        w-full px-3 py-2 flex items-center gap-2 text-sm transition-colors
                        ${currentUser.boatClassId === bc.id
                          ? isDark ? 'bg-gold-400/20 text-gold-400' : 'bg-teal-100 text-teal-700'
                          : isDark ? 'text-cream hover:bg-navy-700' : 'text-light-text hover:bg-gray-50'}
                      `}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: bc.color }}
                      />
                      {bc.name}
                      {currentUser.boatClassId === bc.id && (
                        <span className="ml-auto w-4 h-4">{Icons.check}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={currentUser.isAdmin ? logoutAdmin : logout}
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center
                ${isDark
                  ? 'text-cream/60 hover:text-coral hover:bg-navy-800'
                  : 'text-light-muted hover:text-red-500 hover:bg-light-border'}
              `}
              title={currentUser.isAdmin ? 'Admin abmelden' : 'Abmelden'}
            >
              <span className="w-5 h-5">{Icons.x}</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                flex items-center gap-1.5
                ${currentPage === item.id
                  ? isDark
                    ? 'bg-navy-700 text-cream'
                    : 'bg-white text-light-text shadow-sm'
                  : isDark
                    ? 'text-cream/60 hover:text-cream'
                    : 'text-light-muted hover:text-light-text'}
              `}
            >
              <span className="w-3.5 h-3.5">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showBoatClassMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowBoatClassMenu(false)}
        />
      )}
    </nav>
  );
}

// ============================================
// DASHBOARD PAGE
// ============================================
function DashboardPage({ setCurrentPage }) {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const { events, deadline, season, isDeadlinePassed } = useData();

  const myEvents = events.filter(e => e.boatClassId === currentUser.boatClassId);
  const deadlinePassed = isDeadlinePassed();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
          Willkommen, {currentUser.name || getBoatClassName(currentUser.boatClassId)}!
        </h1>
        <p className={isDark ? 'text-cream/60' : 'text-light-muted'}>
          {season.name} - Plane deine Regatten und Trainingslager
          {currentUser.boatClassId && (
            <span className="ml-2 inline-flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getBoatClassColor(currentUser.boatClassId) }}
              />
              {getBoatClassName(currentUser.boatClassId)}
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Deadline Card */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-3">
            <IconBadge icon={Icons.clock} color={deadlinePassed ? 'red' : 'gold'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>Eingabefrist</p>
              <p className={`font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {formatDate(deadline)}
              </p>
            </div>
          </div>
          {deadlinePassed ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-coral">
              <span className="w-3 h-3">{Icons.lock}</span>
              Abgelaufen
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isDark ? 'bg-success/20 text-success' : 'bg-green-100 text-green-600'}`}>
              <span className="w-3 h-3">{Icons.unlock}</span>
              Eingabe möglich
            </span>
          )}
        </GlassCard>

        {/* Events Count */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-3">
            <IconBadge icon={Icons.calendar} color="purple" />
            <div>
              <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>Meine Veranstaltungen</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {myEvents.length}
              </p>
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
            {myEvents.filter(e => e.type === 'regatta').length} Regatten, {myEvents.filter(e => e.type === 'trainingslager').length} Trainingslager
          </p>
        </GlassCard>

        {/* Total Events */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-3">
            <IconBadge icon={Icons.users} color="cyan" />
            <div>
              <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>Alle Veranstaltungen</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {events.length}
              </p>
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
            Von allen Trainingsgruppen
          </p>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="mb-8">
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-cream' : 'text-light-text'}`}>
          Schnellaktionen
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setCurrentPage('events')}
            icon={Icons.plus}
            disabled={deadlinePassed && !currentUser.isAdmin}
          >
            Veranstaltung hinzufügen
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCurrentPage('overview')}
            icon={Icons.calendar}
          >
            Saisonübersicht
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCurrentPage('boats')}
            icon={Icons.boat}
          >
            Motorboot-Plan
          </Button>
        </div>
      </GlassCard>

      {/* My Events List */}
      {myEvents.length > 0 && (
        <GlassCard>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-cream' : 'text-light-text'}`}>
            Meine Veranstaltungen
          </h2>
          <div className="space-y-3">
            {myEvents.slice(0, 5).map(event => (
              <div
                key={event.id}
                className={`
                  flex items-center gap-4 p-3 rounded-xl
                  ${isDark ? 'bg-navy-800/50' : 'bg-light-border/30'}
                `}
              >
                <IconBadge
                  icon={event.type === 'regatta' ? Icons.trophy : Icons.mapPin}
                  color={event.type === 'regatta' ? 'amber' : 'emerald'}
                  size="sm"
                />
                <div className="flex-1">
                  <p className={`font-medium ${isDark ? 'text-cream' : 'text-light-text'}`}>
                    {event.name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ============================================
// EVENTS PAGE
// ============================================
function EventsPage() {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const { events, deleteEvent, isDeadlinePassed } = useData();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const myEvents = events.filter(e => e.boatClassId === currentUser.boatClassId);
  const deadlinePassed = isDeadlinePassed();
  const canEdit = !deadlinePassed || currentUser.isAdmin;

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = (event) => {
    if (confirm(`"${event.name}" wirklich löschen?`)) {
      deleteEvent(event.id);
      addToast('Veranstaltung gelöscht', 'success');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-cream' : 'text-light-text'}`}>
            Meine Veranstaltungen
          </h1>
          <p className={isDark ? 'text-cream/60' : 'text-light-muted'}>
            Regatten und Trainingslager für {getBoatClassName(currentUser.boatClassId)}
          </p>
        </div>
        <Button
          onClick={() => { setEditingEvent(null); setShowForm(true); }}
          icon={Icons.plus}
          disabled={!canEdit}
        >
          Hinzufügen
        </Button>
      </div>

      {/* Events List */}
      {myEvents.length === 0 ? (
        <GlassCard className="text-center py-12">
          <div className="flex justify-center mb-4">
            <IconBadge icon={Icons.calendar} color="slate" size="lg" />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
            Noch keine Veranstaltungen
          </h3>
          <p className={`mb-4 ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
            Füge deine erste Regatta oder dein erstes Trainingslager hinzu.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            icon={Icons.plus}
            disabled={!canEdit}
          >
            Veranstaltung hinzufügen
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {myEvents.map(event => (
            <GlassCard key={event.id} className="p-4">
              <div className="flex items-start gap-4">
                <IconBadge
                  icon={event.type === 'regatta' ? Icons.trophy : Icons.mapPin}
                  color={event.type === 'regatta' ? 'amber' : 'emerald'}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                        {event.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                        {event.type === 'regatta' ? event.organizer : event.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(event)}
                        disabled={!canEdit}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${canEdit
                            ? isDark
                              ? 'text-cream/60 hover:text-cream hover:bg-navy-700'
                              : 'text-light-muted hover:text-light-text hover:bg-light-border'
                            : 'opacity-50 cursor-not-allowed'}
                        `}
                      >
                        <span className="w-4 h-4">{Icons.edit}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        disabled={!canEdit}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${canEdit
                            ? isDark
                              ? 'text-cream/60 hover:text-coral hover:bg-navy-700'
                              : 'text-light-muted hover:text-red-500 hover:bg-light-border'
                            : 'opacity-50 cursor-not-allowed'}
                        `}
                      >
                        <span className="w-4 h-4">{Icons.trash}</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-cream/80' : 'text-light-text'}`}>
                      <span className="w-4 h-4">{Icons.calendar}</span>
                      {formatDateRange(event.startDate, event.endDate)}
                    </div>
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-cream/80' : 'text-light-text'}`}>
                      <span className="w-4 h-4">{Icons.boat}</span>
                      {getMotorboatName(event.requestedMotorboat)}
                    </div>
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                      <span className="w-4 h-4">{Icons.clock}</span>
                      Verladung: {formatDate(event.motorboatLoadingTime?.split('T')[0])}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingEvent(null); }}
        title={editingEvent ? 'Veranstaltung bearbeiten' : 'Neue Veranstaltung'}
        size="md"
      >
        <EventForm
          onSuccess={handleFormSuccess}
          editEvent={editingEvent}
        />
      </Modal>
    </div>
  );
}

// ============================================
// OVERVIEW PAGE (GANTT CALENDAR)
// ============================================
function OverviewPage() {
  const { isDark } = useTheme();
  const { events, season } = useData();
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-cream' : 'text-light-text'}`}>
          Saisonübersicht
        </h1>
        <p className={isDark ? 'text-cream/60' : 'text-light-muted'}>
          {season.name} - Alle Veranstaltungen im Überblick
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {boatClasses.map(bc => {
          const count = events.filter(e => e.boatClassId === bc.id).length;
          return (
            <div
              key={bc.id}
              className={`
                p-3 rounded-xl border flex items-center gap-3
                ${isDark ? 'bg-navy-800/50 border-navy-700' : 'bg-white border-light-border'}
              `}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: bc.color }}
              >
                {count}
              </div>
              <span className={`text-sm ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {bc.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      {events.length > 0 ? (
        <SeasonTimeline
          events={events}
          season={season}
          onEventClick={setSelectedEvent}
        />
      ) : (
        <GlassCard className="text-center py-12">
          <div className="flex justify-center mb-4">
            <IconBadge icon={Icons.calendar} color="slate" size="lg" />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
            Noch keine Veranstaltungen
          </h3>
          <p className={isDark ? 'text-cream/60' : 'text-light-muted'}>
            Sobald Trainer Veranstaltungen hinzufügen, werden sie hier angezeigt.
          </p>
        </GlassCard>
      )}

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Veranstaltungsdetails"
        size="sm"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getBoatClassColor(selectedEvent.boatClassId) }}
              />
              <span className={`font-medium ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {getBoatClassName(selectedEvent.boatClassId)}
              </span>
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                selectedEvent.type === 'regatta'
                  ? isDark ? 'bg-amber-400/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                  : isDark ? 'bg-emerald-400/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedEvent.type === 'regatta' ? 'Regatta' : 'Trainingslager'}
              </span>
            </div>

            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {selectedEvent.name}
              </h3>
              {(selectedEvent.organizer || selectedEvent.location) && (
                <p className={isDark ? 'text-cream/60' : 'text-light-muted'}>
                  {selectedEvent.organizer || selectedEvent.location}
                </p>
              )}
            </div>

            <div className={`p-3 rounded-lg space-y-2 ${isDark ? 'bg-navy-800' : 'bg-light-border/30'}`}>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>{Icons.calendar}</span>
                <span className={isDark ? 'text-cream' : 'text-light-text'}>
                  {formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>{Icons.boat}</span>
                <span className={isDark ? 'text-cream' : 'text-light-text'}>
                  {getMotorboatName(selectedEvent.requestedMotorboat)}
                  {selectedEvent.assignedMotorboat && selectedEvent.assignedMotorboat !== selectedEvent.requestedMotorboat && (
                    <span className="text-coral ml-1">
                      (zugewiesen: {getMotorboatName(selectedEvent.assignedMotorboat)})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>{Icons.clock}</span>
                <span className={isDark ? 'text-cream/80' : 'text-light-text'}>
                  Verladung: {formatDate(selectedEvent.motorboatLoadingTime?.split('T')[0])}
                </span>
              </div>
            </div>

            <Button onClick={() => setSelectedEvent(null)} className="w-full">
              Schließen
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============================================
// BOATS PAGE (MOTORBOAT PLANNING)
// ============================================
function BoatsPage() {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const { events, assignMotorboat } = useData();
  const { addToast } = useToast();

  const conflicts = findConflicts(events);
  const usage = getMotorboatUsage(events);

  const handleResolveConflict = (conflict) => {
    if (applySuggestion(events, conflict, (id, updates) => assignMotorboat(id, updates.assignedMotorboat))) {
      addToast('Konflikt wurde aufgelöst', 'success');
    }
  };

  const handleChangeAssignment = (eventId, newMotorboatId) => {
    assignMotorboat(eventId, newMotorboatId);
    addToast('Motorboot-Zuweisung geändert', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-cream' : 'text-light-text'}`}>
          Motorboot-Einsatzplan
        </h1>
        <p className={isDark ? 'text-cream/60' : 'text-light-muted'}>
          Übersicht und Konfliktauflösung
        </p>
      </div>

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <GlassCard className={`mb-6 border-2 ${isDark ? 'border-coral/50' : 'border-red-300'}`}>
          <div className="flex items-center gap-3 mb-4">
            <IconBadge icon={Icons.alertTriangle} color="red" />
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {conflicts.length} Konflikt{conflicts.length > 1 ? 'e' : ''} gefunden
              </h3>
              <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                Mehrere Gruppen benötigen das gleiche Motorboot zur gleichen Zeit
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {conflicts.map(conflict => (
              <div
                key={conflict.id}
                className={`p-4 rounded-xl ${isDark ? 'bg-navy-800' : 'bg-red-50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`font-medium mb-1 ${isDark ? 'text-cream' : 'text-light-text'}`}>
                      {getMotorboatName(conflict.motorboatId)} - Überschneidung
                    </p>
                    <div className="space-y-1">
                      {conflict.events.map(event => (
                        <div key={event.id} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getBoatClassColor(event.boatClassId) }}
                          />
                          <span className={isDark ? 'text-cream/80' : 'text-light-text'}>
                            {getBoatClassName(event.boatClassId)}: {event.name}
                          </span>
                          <span className={isDark ? 'text-cream/60' : 'text-light-muted'}>
                            ({formatDateRange(event.startDate, event.endDate)})
                          </span>
                        </div>
                      ))}
                    </div>
                    {conflict.suggestion && (
                      <p className={`mt-2 text-sm ${isDark ? 'text-gold-400' : 'text-teal-600'}`}>
                        Vorschlag: {conflict.suggestion.reason}
                      </p>
                    )}
                  </div>
                  {currentUser.isAdmin && conflict.suggestion?.newMotorboat && (
                    <Button
                      size="sm"
                      onClick={() => handleResolveConflict(conflict)}
                    >
                      Auflösen
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Motorboat Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {motorboats.map(mb => {
          const boatUsage = usage[mb.id];
          const hasConflict = conflicts.some(c => c.motorboatId === mb.id);

          return (
            <GlassCard
              key={mb.id}
              className={hasConflict ? `border-2 ${isDark ? 'border-coral/30' : 'border-red-200'}` : ''}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Icons.boat} color={hasConflict ? 'red' : 'gold'} />
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                      {mb.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                      {mb.description}
                    </p>
                  </div>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${boatUsage?.count > 0
                    ? isDark ? 'bg-gold-400/20 text-gold-400' : 'bg-teal-100 text-teal-600'
                    : isDark ? 'bg-navy-700 text-cream/60' : 'bg-gray-100 text-light-muted'}
                `}>
                  {boatUsage?.count || 0} Einsätze
                </span>
              </div>

              {mb.priority.length > 0 && (
                <p className={`text-xs mb-3 ${isDark ? 'text-gold-400/80' : 'text-teal-600'}`}>
                  Priorität: {mb.priority.map(id => getBoatClassName(id)).join(', ')}
                </p>
              )}

              {boatUsage?.events.length > 0 ? (
                <div className="space-y-2">
                  {boatUsage.events.map(event => (
                    <div
                      key={event.id}
                      className={`
                        flex items-center justify-between p-2 rounded-lg
                        ${isDark ? 'bg-navy-800/50' : 'bg-light-border/30'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getBoatClassColor(event.boatClassId) }}
                        />
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-cream' : 'text-light-text'}`}>
                            {event.name}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                            {formatDateRange(event.startDate, event.endDate)}
                          </p>
                        </div>
                      </div>
                      {currentUser.isAdmin && (
                        <select
                          value={event.assignedMotorboat}
                          onChange={(e) => handleChangeAssignment(event.id, e.target.value)}
                          className={`
                            text-xs px-2 py-1 rounded border
                            ${isDark
                              ? 'bg-navy-700 border-navy-600 text-cream'
                              : 'bg-white border-light-border text-light-text'}
                          `}
                        >
                          {motorboats.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm text-center py-4 ${isDark ? 'text-cream/40' : 'text-light-muted'}`}>
                  Keine Einsätze geplant
                </p>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// ADMIN PAGE
// ============================================
function AdminPage() {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const { events, deadline, season, setDeadline, setSeason, resetAllData, loadDemoData } = useData();
  const { addToast } = useToast();

  const [newDeadline, setNewDeadline] = useState(deadline);
  const [newSeasonStart, setNewSeasonStart] = useState(season.start);
  const [newSeasonEnd, setNewSeasonEnd] = useState(season.end);
  const [newSeasonName, setNewSeasonName] = useState(season.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackStep, setFeedbackStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    title: '',
    description: '',
    steps: '',
    expected: '',
    actual: '',
    browser: navigator.userAgent.includes('Chrome') ? 'Chrome' :
             navigator.userAgent.includes('Firefox') ? 'Firefox' :
             navigator.userAgent.includes('Safari') ? 'Safari' : 'Unbekannt'
  });

  if (!currentUser.isAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <GlassCard className="text-center py-12">
          <IconBadge icon={Icons.lock} color="red" size="lg" className="mx-auto mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
            Zugriff verweigert
          </h2>
          <p className={isDark ? 'text-cream/60' : 'text-light-muted'}>
            Nur Administratoren können auf diesen Bereich zugreifen.
          </p>
        </GlassCard>
      </div>
    );
  }

  const handleSaveDeadline = () => {
    setDeadline(newDeadline);
    addToast('Eingabefrist aktualisiert', 'success');
  };

  const handleSaveSeason = () => {
    setSeason({
      start: newSeasonStart,
      end: newSeasonEnd,
      name: newSeasonName
    });
    addToast('Saison-Einstellungen aktualisiert', 'success');
  };

  const handleExportSeasonPDF = () => {
    try {
      const doc = generateSeasonCalendarPDF(events, season);
      savePDF(doc, `TSC_Saisonkalender_${season.name.replace(/\s/g, '_')}.pdf`);
      addToast('Saisonkalender-PDF erstellt', 'success');
    } catch (error) {
      addToast('Fehler beim PDF-Export', 'error');
      console.error(error);
    }
  };

  const handleExportMotorboatPDF = () => {
    try {
      const doc = generateMotorboatPlanPDF(events, season);
      savePDF(doc, `TSC_Motorbootplan_${season.name.replace(/\s/g, '_')}.pdf`);
      addToast('Motorboot-Plan-PDF erstellt', 'success');
    } catch (error) {
      addToast('Fehler beim PDF-Export', 'error');
      console.error(error);
    }
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    addToast('Alle Daten wurden zurückgesetzt', 'warning');
  };

  const handleLoadDemoData = () => {
    const count = loadDemoData();
    addToast(`${count} Demo-Veranstaltungen geladen (inkl. Konflikte)`, 'success');
  };

  const openFeedbackModal = (type) => {
    setFeedbackType(type);
    setFeedbackStep(1);
    setFeedbackData({
      title: '',
      description: '',
      steps: '',
      expected: '',
      actual: '',
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' :
               navigator.userAgent.includes('Firefox') ? 'Firefox' :
               navigator.userAgent.includes('Safari') ? 'Safari' : 'Unbekannt'
    });
    setShowFeedbackModal(true);
  };

  const nextFeedbackStep = () => {
    if (feedbackStep === 1 && !feedbackData.title.trim()) {
      addToast('Bitte gib einen Titel ein', 'warning');
      return;
    }
    if (feedbackStep === 2 && !feedbackData.description.trim()) {
      addToast('Bitte beschreibe dein Anliegen', 'warning');
      return;
    }
    const maxSteps = feedbackType === 'bug' ? 4 : 2;
    if (feedbackStep < maxSteps) {
      setFeedbackStep(prev => prev + 1);
    } else {
      submitFeedback();
    }
  };

  const prevFeedbackStep = () => {
    if (feedbackStep > 1) {
      setFeedbackStep(prev => prev - 1);
    }
  };

  const submitFeedback = async () => {
    setIsSubmitting(true);

    const prefix = feedbackType === 'bug' ? '[Bug]' : '[Feature]';
    let body = `## Beschreibung\n${feedbackData.description}\n`;

    if (feedbackType === 'bug') {
      if (feedbackData.steps) {
        body += `\n## Schritte zum Reproduzieren\n${feedbackData.steps}\n`;
      }
      if (feedbackData.expected) {
        body += `\n## Erwartetes Verhalten\n${feedbackData.expected}\n`;
      }
      if (feedbackData.actual) {
        body += `\n## Aktuelles Verhalten\n${feedbackData.actual}\n`;
      }
      body += `\n## Browser / Gerät\n- Browser: ${feedbackData.browser}\n- Gerät: ${/Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobil' : 'Desktop'}\n`;
    }

    body += `\n---\n*Gesendet von TSC Saisonplanung App*`;

    try {
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${prefix} ${feedbackData.title}`,
          body,
          labels: [feedbackType === 'bug' ? 'bug' : 'enhancement']
        })
      });

      const result = await response.json();

      if (response.ok) {
        setShowFeedbackModal(false);
        setFeedbackStep(1);
        addToast(`Feedback erfolgreich gesendet! (Issue #${result.issueNumber})`, 'success');
      } else {
        // Fallback: Open GitHub directly if API fails
        console.error('API Error:', result);
        const baseUrl = 'https://github.com/koljaschumann/tsc-saisonplanung/issues/new';
        const labels = feedbackType === 'bug' ? 'bug' : 'enhancement';
        const url = `${baseUrl}?labels=${labels}&title=${encodeURIComponent(`${prefix} ${feedbackData.title}`)}&body=${encodeURIComponent(body)}`;
        window.open(url, '_blank');
        setShowFeedbackModal(false);
        addToast('Feedback wird in GitHub geöffnet (bitte dort absenden)', 'info');
      }
    } catch (error) {
      console.error('Network Error:', error);
      // Fallback: Open GitHub directly
      const baseUrl = 'https://github.com/koljaschumann/tsc-saisonplanung/issues/new';
      const labels = feedbackType === 'bug' ? 'bug' : 'enhancement';
      const url = `${baseUrl}?labels=${labels}&title=${encodeURIComponent(`${prefix} ${feedbackData.title}`)}&body=${encodeURIComponent(body)}`;
      window.open(url, '_blank');
      setShowFeedbackModal(false);
      addToast('Feedback wird in GitHub geöffnet (bitte dort absenden)', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `
    w-full px-3 py-2 rounded-lg border text-sm
    ${isDark
      ? 'bg-navy-700 border-navy-600 text-cream'
      : 'bg-white border-light-border text-light-text'}
    focus:outline-none focus:ring-2
    ${isDark ? 'focus:ring-gold-400' : 'focus:ring-teal-400'}
  `;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-cream' : 'text-light-text'}`}>
          Admin-Bereich
        </h1>
        <p className={isDark ? 'text-cream/60' : 'text-light-muted'}>
          Einstellungen und Verwaltung
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deadline Settings */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <IconBadge icon={Icons.clock} color="gold" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
              Eingabefrist
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-cream/80' : 'text-light-muted'}`}>
                Frist für Trainer-Eingaben
              </label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className={inputClass}
              />
              <p className={`mt-1 text-xs ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                Nach diesem Datum können Trainer keine Änderungen mehr vornehmen
              </p>
            </div>
            <Button onClick={handleSaveDeadline}>
              Frist speichern
            </Button>
          </div>
        </GlassCard>

        {/* Season Settings */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <IconBadge icon={Icons.calendar} color="purple" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
              Saison-Einstellungen
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-cream/80' : 'text-light-muted'}`}>
                Saisonname
              </label>
              <input
                type="text"
                value={newSeasonName}
                onChange={(e) => setNewSeasonName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-cream/80' : 'text-light-muted'}`}>
                  Start
                </label>
                <input
                  type="date"
                  value={newSeasonStart}
                  onChange={(e) => setNewSeasonStart(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-cream/80' : 'text-light-muted'}`}>
                  Ende
                </label>
                <input
                  type="date"
                  value={newSeasonEnd}
                  onChange={(e) => setNewSeasonEnd(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <Button onClick={handleSaveSeason}>
              Saison speichern
            </Button>
          </div>
        </GlassCard>

        {/* PDF Export */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <IconBadge icon={Icons.download} color="cyan" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
              PDF-Export
            </h2>
          </div>

          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={handleExportSeasonPDF}
              icon={Icons.calendar}
              className="w-full justify-start"
              disabled={events.length === 0}
            >
              Saisonkalender exportieren
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportMotorboatPDF}
              icon={Icons.boat}
              className="w-full justify-start"
              disabled={events.length === 0}
            >
              Motorboot-Einsatzplan exportieren
            </Button>
            {events.length === 0 && (
              <p className={`text-xs ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                Noch keine Veranstaltungen zum Exportieren vorhanden
              </p>
            )}
          </div>
        </GlassCard>

        {/* Statistics */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <IconBadge icon={Icons.info} color="emerald" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
              Statistiken
            </h2>
          </div>

          <div className="space-y-3">
            <div className={`flex justify-between p-3 rounded-lg ${isDark ? 'bg-navy-800/50' : 'bg-light-border/30'}`}>
              <span className={isDark ? 'text-cream/80' : 'text-light-text'}>Gesamte Veranstaltungen</span>
              <span className={`font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>{events.length}</span>
            </div>
            <div className={`flex justify-between p-3 rounded-lg ${isDark ? 'bg-navy-800/50' : 'bg-light-border/30'}`}>
              <span className={isDark ? 'text-cream/80' : 'text-light-text'}>Regatten</span>
              <span className={`font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {events.filter(e => e.type === 'regatta').length}
              </span>
            </div>
            <div className={`flex justify-between p-3 rounded-lg ${isDark ? 'bg-navy-800/50' : 'bg-light-border/30'}`}>
              <span className={isDark ? 'text-cream/80' : 'text-light-text'}>Trainingslager</span>
              <span className={`font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {events.filter(e => e.type === 'trainingslager').length}
              </span>
            </div>
            <div className={`flex justify-between p-3 rounded-lg ${isDark ? 'bg-navy-800/50' : 'bg-light-border/30'}`}>
              <span className={isDark ? 'text-cream/80' : 'text-light-text'}>Aktive Bootsklassen</span>
              <span className={`font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
                {new Set(events.map(e => e.boatClassId)).size}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Demo Data */}
        <GlassCard className={`border-2 ${isDark ? 'border-gold-400/30' : 'border-amber-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <IconBadge icon={Icons.plus} color="amber" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
              Demo-Daten
            </h2>
          </div>

          <div className="space-y-3">
            <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
              Lade Beispieldaten mit vorgefertigten Konflikten zum Testen der Konfliktauflösung.
            </p>
            <Button
              onClick={handleLoadDemoData}
              icon={Icons.download}
              className="w-full"
            >
              Demo-Daten laden
            </Button>
            <p className={`text-xs ${isDark ? 'text-gold-400/80' : 'text-amber-600'}`}>
              Enthält 10 Veranstaltungen mit 2 Motorboot-Konflikten
            </p>
          </div>
        </GlassCard>

        {/* Feedback */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <IconBadge icon={Icons.info} color="purple" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
              Feedback
            </h2>
          </div>

          <div className="space-y-3">
            <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
              Hilf uns, die App zu verbessern! Melde Bugs oder schlage neue Funktionen vor.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => openFeedbackModal('bug')}
                icon={Icons.alertTriangle}
                className="flex-1"
              >
                Bug melden
              </Button>
              <Button
                variant="secondary"
                onClick={() => openFeedbackModal('feature')}
                icon={Icons.plus}
                className="flex-1"
              >
                Idee vorschlagen
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className={`lg:col-span-2 border-2 ${isDark ? 'border-coral/30' : 'border-red-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <IconBadge icon={Icons.alertTriangle} color="red" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-cream' : 'text-light-text'}`}>
              Gefahrenzone
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${isDark ? 'text-cream' : 'text-light-text'}`}>
                Alle Daten zurücksetzen
              </p>
              <p className={`text-sm ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                Löscht alle Veranstaltungen und setzt Einstellungen zurück
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowResetConfirm(true)}
            >
              Zurücksetzen
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Daten zurücksetzen?"
        size="sm"
      >
        <div className="space-y-4">
          <p className={isDark ? 'text-cream/80' : 'text-light-text'}>
            Bist du sicher, dass du <strong>alle Daten löschen</strong> möchtest?
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              variant="danger"
              onClick={handleReset}
              className="flex-1"
            >
              Ja, alles löschen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal - Step by Step Wizard */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => { setShowFeedbackModal(false); setFeedbackStep(1); }}
        title={feedbackType === 'bug' ? '🐛 Bug melden' : '💡 Idee vorschlagen'}
        size="md"
      >
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {Array.from({ length: feedbackType === 'bug' ? 4 : 2 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i + 1 <= feedbackStep
                    ? isDark ? 'bg-gold-400' : 'bg-teal-500'
                    : isDark ? 'bg-navy-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Title */}
          {feedbackStep === 1 && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gold-400/10 border border-gold-400/20' : 'bg-teal-50 border border-teal-200'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className={`font-medium mb-1 ${isDark ? 'text-gold-400' : 'text-teal-700'}`}>
                      Schritt 1: {feedbackType === 'bug' ? 'Das Problem benennen' : 'Deine Idee benennen'}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-cream/70' : 'text-teal-600'}`}>
                      {feedbackType === 'bug'
                        ? 'Beschreibe das Problem in einem kurzen Satz. Was funktioniert nicht wie erwartet?'
                        : 'Gib deiner Idee einen kurzen, aussagekräftigen Namen.'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
                  {feedbackType === 'bug' ? 'Was ist das Problem?' : 'Wie heißt deine Idee?'}
                </label>
                <input
                  type="text"
                  value={feedbackData.title}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, title: e.target.value }))}
                  className={`${inputClass} text-lg`}
                  placeholder={feedbackType === 'bug' ? 'z.B. PDF-Export zeigt leere Seite' : 'z.B. Kalender als iCal exportieren'}
                  autoFocus
                />
              </div>

              <div className={`p-3 rounded-lg ${isDark ? 'bg-navy-800/50' : 'bg-gray-50'}`}>
                <p className={`text-xs ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                  💡 <strong>Tipp:</strong> {feedbackType === 'bug'
                    ? 'Sei spezifisch! "PDF-Export zeigt leere Seite" ist besser als "PDF funktioniert nicht".'
                    : 'Ein guter Titel fasst die Idee in 3-7 Wörtern zusammen.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {feedbackStep === 2 && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gold-400/10 border border-gold-400/20' : 'bg-teal-50 border border-teal-200'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className={`font-medium mb-1 ${isDark ? 'text-gold-400' : 'text-teal-700'}`}>
                      Schritt 2: Details beschreiben
                    </p>
                    <p className={`text-sm ${isDark ? 'text-cream/70' : 'text-teal-600'}`}>
                      {feedbackType === 'bug'
                        ? 'Beschreibe genauer, was passiert ist. Wann tritt der Fehler auf? Was hast du vorher gemacht?'
                        : 'Erkläre deine Idee genauer. Welches Problem löst sie? Wie würde sie funktionieren?'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-navy-800' : 'bg-gray-100'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-cream' : 'text-light-text'}`}>
                  📝 "{feedbackData.title}"
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
                  Beschreibung
                </label>
                <textarea
                  value={feedbackData.description}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, description: e.target.value }))}
                  rows={5}
                  className={inputClass}
                  placeholder={feedbackType === 'bug'
                    ? 'Beschreibe was passiert ist...\n\nz.B. "Wenn ich im Admin-Bereich auf PDF-Export klicke und dann Saisonkalender wähle, öffnet sich das PDF, aber es ist komplett leer."'
                    : 'Beschreibe deine Idee...\n\nz.B. "Es wäre toll, wenn man den Kalender als iCal-Datei exportieren könnte, um die Termine direkt in Google Calendar oder Outlook zu importieren."'}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 3: Steps to Reproduce (Bug only) */}
          {feedbackStep === 3 && feedbackType === 'bug' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gold-400/10 border border-gold-400/20' : 'bg-teal-50 border border-teal-200'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className={`font-medium mb-1 ${isDark ? 'text-gold-400' : 'text-teal-700'}`}>
                      Schritt 3: Wie kann ich den Fehler nachstellen?
                    </p>
                    <p className={`text-sm ${isDark ? 'text-cream/70' : 'text-teal-600'}`}>
                      Beschreibe die Schritte, die zum Fehler führen. Das hilft uns, das Problem zu finden und zu beheben.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
                  Schritte zum Reproduzieren
                </label>
                <textarea
                  value={feedbackData.steps}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, steps: e.target.value }))}
                  rows={5}
                  className={inputClass}
                  placeholder="1. Melde dich als Admin an&#10;2. Gehe zum Admin-Bereich&#10;3. Klicke auf 'Demo-Daten laden'&#10;4. Klicke auf 'Saisonkalender exportieren'&#10;5. Das PDF ist leer"
                  autoFocus
                />
              </div>

              <div className={`p-3 rounded-lg ${isDark ? 'bg-navy-800/50' : 'bg-gray-50'}`}>
                <p className={`text-xs ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                  💡 <strong>Tipp:</strong> Nummeriere die Schritte (1., 2., 3., ...) - das macht es einfacher zu folgen!
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Expected vs Actual (Bug only) */}
          {feedbackStep === 4 && feedbackType === 'bug' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gold-400/10 border border-gold-400/20' : 'bg-teal-50 border border-teal-200'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className={`font-medium mb-1 ${isDark ? 'text-gold-400' : 'text-teal-700'}`}>
                      Schritt 4: Erwartet vs. Tatsächlich
                    </p>
                    <p className={`text-sm ${isDark ? 'text-cream/70' : 'text-teal-600'}`}>
                      Fast geschafft! Beschreibe kurz, was passieren sollte und was stattdessen passiert.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
                    ✅ Was sollte passieren?
                  </label>
                  <textarea
                    value={feedbackData.expected}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, expected: e.target.value }))}
                    rows={2}
                    className={inputClass}
                    placeholder="z.B. Das PDF sollte alle Veranstaltungen anzeigen"
                    autoFocus
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-cream' : 'text-light-text'}`}>
                    ❌ Was passiert stattdessen?
                  </label>
                  <textarea
                    value={feedbackData.actual}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, actual: e.target.value }))}
                    rows={2}
                    className={inputClass}
                    placeholder="z.B. Das PDF ist komplett leer"
                  />
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDark ? 'bg-navy-800/50' : 'bg-gray-50'}`}>
                <p className={`text-xs ${isDark ? 'text-cream/60' : 'text-light-muted'}`}>
                  📱 <strong>System:</strong> {feedbackData.browser} auf {/Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobilgerät' : 'Desktop'} (wird automatisch mitgesendet)
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            {feedbackStep > 1 ? (
              <Button
                variant="secondary"
                onClick={prevFeedbackStep}
                className="flex-1"
              >
                ← Zurück
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => { setShowFeedbackModal(false); setFeedbackStep(1); }}
                className="flex-1"
              >
                Abbrechen
              </Button>
            )}
            <Button
              onClick={nextFeedbackStep}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Wird gesendet...'
              ) : feedbackStep === (feedbackType === 'bug' ? 4 : 2) ? (
                '✓ Absenden'
              ) : (
                'Weiter →'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
function AppContent() {
  const { isLoggedIn } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage setCurrentPage={setCurrentPage} />;
      case 'events':
        return <EventsPage />;
      case 'overview':
        return <OverviewPage />;
      case 'boats':
        return <BoatsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
