import { jsPDF } from 'jspdf';
import { ClassItem, Student } from '../types';

export interface ExportReportOptions {
  classItem?: ClassItem;
  students: Student[];
  timeframe?: string;
  teacherName?: string;
  schoolName?: string;
  reportTitle?: string;
}

/**
 * Clean string for CSV escaping
 */
const escapeCSV = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Triggers a native browser file download from Blob
 */
const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
};

/**
 * Export Attendance Report as CSV
 */
export const exportAttendanceCSV = (options: ExportReportOptions): void => {
  const {
    classItem,
    students,
    timeframe = 'Current Session',
    teacherName = 'Class Teacher',
    schoolName = 'Crescent Model School',
    reportTitle,
  } = options;

  const className = classItem ? classItem.name : 'All Classes';
  const title = reportTitle || `Attendance Report - ${className}`;
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const lines: string[] = [];

  // Metadata headers
  lines.push(`${escapeCSV(schoolName)}`);
  lines.push(`${escapeCSV(title)}`);
  lines.push(`Timeframe: ${escapeCSV(timeframe)},Date Generated: ${escapeCSV(dateFormatted)},Teacher: ${escapeCSV(teacherName)}`);
  lines.push(''); // blank row

  // Table Columns
  const headers = [
    'Roll No',
    'Student Name',
    'Class',
    'Today Status',
    'Attendance %',
    'Present Days',
    'Absent Days',
    'Late Days',
    'Total Days',
    'Father Name',
    'Contact Phone',
    'Remarks',
  ];
  lines.push(headers.map(escapeCSV).join(','));

  // Table Rows
  students.forEach((s) => {
    const statusMap = {
      P: 'Present',
      A: 'Absent',
      L: 'Late',
      U: 'Unmarked',
    };
    const row = [
      s.rollNo || '-',
      s.name,
      s.className || className,
      statusMap[s.status] || 'Present',
      `${s.attendanceStats?.overallPercentage ?? 85}%`,
      s.attendanceStats?.present ?? 22,
      s.attendanceStats?.absent ?? 2,
      s.attendanceStats?.late ?? 1,
      s.attendanceStats?.totalDays ?? 25,
      s.contact?.fatherName || '-',
      s.contact?.fatherPhone || s.contact?.studentPhone || '-',
      s.performance?.remarks || '-',
    ];
    lines.push(row.map(escapeCSV).join(','));
  });

  // Summary statistics
  const total = students.length;
  const presentCount = students.filter((s) => s.status === 'P').length;
  const absentCount = students.filter((s) => s.status === 'A').length;
  const lateCount = students.filter((s) => s.status === 'L').length;
  const avgAttendance = total > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.attendanceStats?.overallPercentage ?? 80), 0) / total)
    : 0;

  lines.push('');
  lines.push(`SUMMARY STATISTICS`);
  lines.push(`Total Enrolled: ${escapeCSV(total)},Present Today: ${escapeCSV(presentCount)},Absent Today: ${escapeCSV(absentCount)},Late Today: ${escapeCSV(lateCount)},Class Average: ${escapeCSV(avgAttendance + '%')}`);

  const csvContent = '\uFEFF' + lines.join('\r\n'); // UTF-8 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const sanitizedClassName = className.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `EduAttend_${sanitizedClassName}_${now.toISOString().slice(0, 10)}.csv`;

  triggerDownload(blob, filename);
};

/**
 * Export Attendance Report as PDF using jsPDF
 */
export const exportAttendancePDF = (options: ExportReportOptions): void => {
  const {
    classItem,
    students,
    timeframe = 'Current Session',
    teacherName = 'Class Teacher',
    schoolName = 'Crescent Model Higher Secondary School',
    reportTitle,
  } = options;

  const className = classItem ? classItem.name : 'All Classes';
  const title = reportTitle || `Attendance & Performance Register`;
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36; // 0.5 inch margin

  // Primary branding bar
  doc.setFillColor(37, 99, 235); // #2563EB primary blue
  doc.rect(0, 0, pageWidth, 52, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EduAttend School Management', margin, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Academic Year 2025 - 2026', pageWidth - margin, 28, { align: 'right' });
  doc.text(schoolName, margin, 42);
  doc.text(`Generated: ${dateFormatted}`, pageWidth - margin, 42, { align: 'right' });

  // Document Sub-header Box
  let y = 72;
  doc.setFillColor(248, 250, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 54, 6, 6, 'FD');

  doc.setTextColor(11, 28, 48);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, margin + 14, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Class: ${className}   |   Timeframe: ${timeframe}   |   Instructor: ${teacherName}`, margin + 14, y + 38);

  // Summary Stat Metric Pills
  y += 66;
  const total = students.length;
  const presentCount = students.filter((s) => s.status === 'P').length;
  const absentCount = students.filter((s) => s.status === 'A').length;
  const lateCount = students.filter((s) => s.status === 'L').length;
  const avgAttendance = total > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.attendanceStats?.overallPercentage ?? 80), 0) / total)
    : 0;

  const statBoxes = [
    { label: 'Total Students', value: `${total}`, color: [37, 99, 235] },
    { label: 'Present Today', value: `${presentCount}`, color: [0, 125, 85] },
    { label: 'Absent Today', value: `${absentCount}`, color: [186, 26, 26] },
    { label: 'Late Today', value: `${lateCount}`, color: [217, 119, 6] },
    { label: 'Average Rate', value: `${avgAttendance}%`, color: [37, 99, 235] },
  ];

  const statWidth = (pageWidth - margin * 2 - (statBoxes.length - 1) * 8) / statBoxes.length;
  statBoxes.forEach((stat, idx) => {
    const boxX = margin + idx * (statWidth + 8);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(boxX, y, statWidth, 38, 4, 4, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(stat.label, boxX + 6, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(stat.value, boxX + 6, y + 30);
  });

  // Students Attendance Table
  y += 50;

  // Table Header
  const colRollX = margin + 8;
  const colNameX = margin + 46;
  const colStatusX = margin + 200;
  const colPercentX = margin + 270;
  const colMissedX = margin + 340;
  const colContactX = margin + 410;

  doc.setFillColor(239, 246, 255);
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.line(margin, y + 22, pageWidth - margin, y + 22);

  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('ROLL', colRollX, y + 14);
  doc.text('STUDENT NAME', colNameX, y + 14);
  doc.text('STATUS', colStatusX, y + 14);
  doc.text('ATTENDANCE', colPercentX, y + 14);
  doc.text('ABSENT DAYS', colMissedX, y + 14);
  doc.text('PARENT CONTACT', colContactX, y + 14);

  y += 24;

  const rowHeight = 20;
  students.forEach((student, index) => {
    // Check if new page is needed
    if (y + rowHeight > pageHeight - 55) {
      doc.addPage();
      y = 40;

      // Repeat Table Header on next page
      doc.setFillColor(239, 246, 255);
      doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('ROLL', colRollX, y + 14);
      doc.text('STUDENT NAME', colNameX, y + 14);
      doc.text('STATUS', colStatusX, y + 14);
      doc.text('ATTENDANCE', colPercentX, y + 14);
      doc.text('ABSENT DAYS', colMissedX, y + 14);
      doc.text('PARENT CONTACT', colContactX, y + 14);
      y += 24;
    }

    // Zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
    }

    // Border line between rows
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(11, 28, 48);

    // Roll No
    doc.setFont('helvetica', 'bold');
    doc.text(student.rollNo || `${index + 1}`, colRollX, y + 13);

    // Student Name
    doc.setFont('helvetica', 'normal');
    const nameStr = student.name.length > 26 ? student.name.substring(0, 24) + '...' : student.name;
    doc.text(nameStr, colNameX, y + 13);

    // Status Pill
    if (student.status === 'P') {
      doc.setTextColor(0, 125, 85);
      doc.setFont('helvetica', 'bold');
      doc.text('Present', colStatusX, y + 13);
    } else if (student.status === 'A') {
      doc.setTextColor(186, 26, 26);
      doc.setFont('helvetica', 'bold');
      doc.text('Absent', colStatusX, y + 13);
    } else if (student.status === 'L') {
      doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text('Late', colStatusX, y + 13);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('Unmarked', colStatusX, y + 13);
    }

    // Attendance percentage
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 28, 48);
    const pct = student.attendanceStats?.overallPercentage ?? 85;
    doc.text(`${pct}%`, colPercentX, y + 13);

    // Absent Days
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const absentDays = student.attendanceStats?.absent ?? 0;
    doc.text(`${absentDays} days`, colMissedX, y + 13);

    // Parent Contact
    const phone = student.contact?.fatherPhone || student.contact?.studentPhone || 'N/A';
    doc.text(phone, colContactX, y + 13);

    y += rowHeight;
  });

  // Signature Block & Footer
  y += 24;
  if (y + 40 > pageHeight - 30) {
    doc.addPage();
    y = pageHeight - 70;
  }

  // Teacher signature line
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - margin - 150, y + 15, pageWidth - margin, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Class Teacher Signature', pageWidth - margin - 150, y + 26);

  // Bottom footer page count
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `EduAttend Portal • Official Academic Document • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 16,
      { align: 'center' }
    );
  }

  const sanitizedClassName = className.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `EduAttend_${sanitizedClassName}_${now.toISOString().slice(0, 10)}.pdf`;

  doc.save(filename);
};
