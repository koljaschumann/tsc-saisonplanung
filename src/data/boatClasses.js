export const boatClasses = [
  { id: 'opti-c', name: 'Opti C', color: '#22c55e' },  // Grün
  { id: 'opti-b', name: 'Opti B', color: '#3b82f6' },  // Blau
  { id: 'opti-a', name: 'Opti A', color: '#8b5cf6' },  // Violett
  { id: '29er', name: '29er', color: '#f59e0b' },      // Orange
  { id: 'pirat', name: 'Pirat', color: '#ec4899' },    // Pink
  { id: 'j70', name: 'J70', color: '#06b6d4' }         // Cyan
];

export const getBoatClass = (id) => boatClasses.find(bc => bc.id === id);
export const getBoatClassName = (id) => getBoatClass(id)?.name || id;
export const getBoatClassColor = (id) => getBoatClass(id)?.color || '#6b7280';
