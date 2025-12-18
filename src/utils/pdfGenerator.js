import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { boatClasses, getBoatClassName, getBoatClassColor } from '../data/boatClasses';
import { motorboats, getMotorboatName } from '../data/motorboats';
import { formatDate, formatDateRange, getMonthsInRange } from './dateUtils';

/**
 * Generiert das Saisonkalender-PDF
 */
export function generateSeasonCalendarPDF(events, season) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

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

  boatClasses.forEach(bc => {
    const color = hexToRgb(bc.color);
    doc.setFillColor(color.r, color.g, color.b);
    doc.circle(legendX + 3, legendY, 3, 'F');
    doc.setTextColor(30, 41, 59);
    doc.text(bc.name, legendX + 8, legendY + 1);
    legendX += 35;
  });

  // Events Tabelle pro Bootsklasse
  let yOffset = 55;

  boatClasses.forEach(bc => {
    const classEvents = events
      .filter(e => e.boatClassId === bc.id)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    if (classEvents.length === 0) return;

    // Bootsklassen-Header
    const color = hexToRgb(bc.color);
    doc.setFillColor(color.r, color.g, color.b);
    doc.rect(15, yOffset, pageWidth - 30, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(bc.name, 18, yOffset + 5);

    yOffset += 10;

    // Events für diese Klasse
    const tableData = classEvents.map(e => [
      e.type === 'regatta' ? 'Regatta' : 'TL',
      e.name,
      e.organizer || e.location || '-',
      formatDateRange(e.startDate, e.endDate),
      getMotorboatName(e.assignedMotorboat || e.requestedMotorboat)
    ]);

    doc.autoTable({
      startY: yOffset,
      head: [['Typ', 'Name', 'Ort/Veranstalter', 'Zeitraum', 'Motorboot']],
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
        0: { cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { cellWidth: 45 },
        3: { cellWidth: 50 },
        4: { cellWidth: 30 }
      },
      margin: { left: 15, right: 15 }
    });

    yOffset = doc.lastAutoTable.finalY + 10;

    // Neue Seite wenn nötig
    if (yOffset > pageHeight - 30) {
      doc.addPage();
      yOffset = 20;
    }
  });

  // Footer
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

      doc.autoTable({
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
