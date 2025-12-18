import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { boatClasses, getBoatClassName, getBoatClassColor } from '../data/boatClasses';
import { motorboats, getMotorboatName } from '../data/motorboats';
import { formatDate, formatDateRange, getMonthsInRange } from './dateUtils';

/**
 * Generiert das Saisonkalender-PDF - Monatsweise chronologisch sortiert
 */
export function generateSeasonCalendarPDF(events, season) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Monatsnamen auf Deutsch
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // Events nach Monat gruppieren und chronologisch sortieren
  const eventsByMonth = {};
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  sortedEvents.forEach(event => {
    const date = new Date(event.startDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }
    eventsByMonth[monthKey].push(event);
  });

  // Sortierte Monatsliste erstellen
  const sortedMonths = Object.keys(eventsByMonth).sort();

  // Header
  doc.setFillColor(10, 22, 40); // Navy-900
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setTextColor(250, 248, 245); // Cream
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TSC Jugend - Saisonkalender', 15, 16);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(season.name, pageWidth - 15, 16, { align: 'right' });

  // Subtitle
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.text(`Erstellt am ${formatDate(new Date().toISOString())}`, 15, 35);

  // Legende
  let legendX = 15;
  const legendY = 42;
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Gruppen:', legendX, legendY + 1);
  legendX += 22;

  boatClasses.forEach(bc => {
    const color = hexToRgb(bc.color);
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(legendX, legendY - 3, 6, 6, 1, 1, 'F');
    doc.setTextColor(30, 41, 59);
    doc.text(bc.name, legendX + 9, legendY + 1);
    legendX += 32;
  });

  let yOffset = 55;

  // Events pro Monat darstellen
  sortedMonths.forEach(monthKey => {
    const [year, month] = monthKey.split('-');
    const monthName = `${monthNames[parseInt(month) - 1]} ${year}`;
    const monthEvents = eventsByMonth[monthKey];

    // Prüfen ob neue Seite nötig
    if (yOffset > pageHeight - 50) {
      doc.addPage();
      yOffset = 20;
    }

    // Monats-Header
    doc.setFillColor(22, 45, 84);
    doc.rect(15, yOffset, pageWidth - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(monthName, 18, yOffset + 5.5);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${monthEvents.length} Veranstaltung${monthEvents.length > 1 ? 'en' : ''}`, pageWidth - 18, yOffset + 5.5, { align: 'right' });

    yOffset += 11;

    // Tabelle für diesen Monat
    const tableData = monthEvents.map(e => {
      const bc = boatClasses.find(b => b.id === e.boatClassId);
      return [
        getBoatClassName(e.boatClassId),
        e.type === 'regatta' ? 'Regatta' : 'TL',
        e.name,
        e.organizer || e.location || '-',
        formatDateRange(e.startDate, e.endDate),
        getMotorboatName(e.assignedMotorboat || e.requestedMotorboat)
      ];
    });

    autoTable(doc, {
      startY: yOffset,
      head: [['Gruppe', 'Typ', 'Name', 'Ort/Veranstalter', 'Zeitraum', 'Motorboot']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 33, 64],
        textColor: [250, 248, 245],
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 18 },
        2: { cellWidth: 55 },
        3: { cellWidth: 45 },
        4: { cellWidth: 40 },
        5: { cellWidth: 28 }
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        // Farbige Markierung für Bootsklasse in der ersten Spalte
        if (data.section === 'body' && data.column.index === 0) {
          const event = monthEvents[data.row.index];
          if (event) {
            const bc = boatClasses.find(b => b.id === event.boatClassId);
            if (bc) {
              const color = hexToRgb(bc.color);
              data.cell.styles.fillColor = [color.r, color.g, color.b];
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      }
    });

    yOffset = doc.lastAutoTable.finalY + 8;
  });

  // Footer mit Seitenzahlen
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Seite ${i} von ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Generiert das Motorboot-Einsatzplan-PDF
 */
export function generateMotorboatPlanPDF(events, season) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setTextColor(250, 248, 245);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TSC Jugend - Motorboot-Einsatzplan', 15, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(season.name, pageWidth - 15, 16, { align: 'right' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.text(`Erstellt am ${formatDate(new Date().toISOString())}`, 15, 35);

  let yOffset = 45;

  // Pro Motorboot eine Tabelle
  motorboats.forEach(mb => {
    const boatEvents = events
      .filter(e => (e.assignedMotorboat || e.requestedMotorboat) === mb.id)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Motorboot-Header
    doc.setFillColor(22, 45, 84);
    doc.rect(15, yOffset, pageWidth - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${mb.name}`, 18, yOffset + 5.5);

    if (mb.priority.length > 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Priorität: ${mb.priority.map(id => getBoatClassName(id)).join(', ')}`,
        pageWidth - 18,
        yOffset + 5.5,
        { align: 'right' }
      );
    }

    yOffset += 12;

    if (boatEvents.length > 0) {
      const tableData = boatEvents.map(e => {
        const loadingDate = e.motorboatLoadingTime?.split('T')[0];
        const loadingTime = e.motorboatLoadingTime?.split('T')[1]?.slice(0, 5);
        return [
          getBoatClassName(e.boatClassId),
          e.name,
          formatDateRange(e.startDate, e.endDate),
          loadingDate ? `${formatDate(loadingDate)} ${loadingTime || ''}` : '-'
        ];
      });

      autoTable(doc, {
        startY: yOffset,
        head: [['Gruppe', 'Veranstaltung', 'Zeitraum', 'Verladung']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [15, 33, 64],
          textColor: [250, 248, 245],
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [30, 41, 59]
        },
        margin: { left: 15, right: 15 }
      });

      yOffset = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setTextColor(150);
      doc.setFontSize(9);
      doc.text('Keine Einsätze geplant', 18, yOffset + 3);
      yOffset += 12;
    }

    // Neue Seite wenn nötig
    if (yOffset > 260) {
      doc.addPage();
      yOffset = 20;
    }
  });

  // Footer mit Seitenzahlen
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Seite ${i} von ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Hilfsfunktion: Hex zu RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 100, g: 100, b: 100 };
}

/**
 * PDF speichern
 */
export function savePDF(doc, filename) {
  doc.save(filename);
}
