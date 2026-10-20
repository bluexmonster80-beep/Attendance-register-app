import { Student, ClassItem } from '../types';

export interface ParsedRosterRow {
  index: number;
  rollNo: string;
  name: string;
  fatherName: string;
  studentPhone: string;
  fatherPhone: string;
  address: string;
  status: 'P' | 'A' | 'L' | 'U';
  notes: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  student?: Student;
}

export interface ParsedRosterResult {
  totalRows: number;
  validRows: ParsedRosterRow[];
  invalidRows: ParsedRosterRow[];
  headersFound: string[];
  duplicatesCount: number;
}

/**
 * Standard CSV line parser handling quotes, commas, and escapes
 */
export const parseCSVText = (text: string): string[][] => {
  const cleanText = text.replace(/^\uFEFF/, '').trim(); // Remove UTF-8 BOM
  if (!cleanText) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
};

/**
 * Normalizes column header names to match standard fields
 */
const normalizeHeader = (header: string): string => {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Parses and validates CSV content for classroom roster import
 */
export const parseRosterCSV = (
  csvContent: string,
  targetClass: ClassItem,
  existingStudents: Student[] = []
): ParsedRosterResult => {
  const rows = parseCSVText(csvContent);
  if (rows.length === 0) {
    return {
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      headersFound: [],
      duplicatesCount: 0,
    };
  }

  const rawHeaders = rows[0];
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  // Column index resolvers with synonyms
  const findColIndex = (...candidates: string[]): number => {
    for (const cand of candidates) {
      const idx = normalizedHeaders.findIndex((h) => h === cand || h.includes(cand));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const colRoll = findColIndex('rollno', 'roll', 'rollnumber', 'id', 'studentid');
  const colName = findColIndex('studentname', 'name', 'fullname', 'student');
  const colFather = findColIndex('fathername', 'father', 'parentname', 'parent', 'guardian');
  const colPhone = findColIndex('studentphone', 'phone', 'mobile', 'cell', 'studentmobile');
  const colFatherPhone = findColIndex('fatherphone', 'parentphone', 'guardianphone', 'emergencynumber');
  const colAddress = findColIndex('address', 'city', 'location', 'residence');
  const colStatus = findColIndex('status', 'todaystatus', 'attendance');
  const colNotes = findColIndex('notes', 'remarks', 'comment');

  const existingRolls = new Set(
    existingStudents
      .filter((s) => s.classId === targetClass.id)
      .map((s) => s.rollNo.toLowerCase().trim())
  );

  const seenFileRolls = new Set<string>();
  const validRows: ParsedRosterRow[] = [];
  const invalidRows: ParsedRosterRow[] = [];
  let duplicatesCount = 0;

  const dataRows = rows.slice(1);
  const now = Date.now();

  dataRows.forEach((row, idx) => {
    if (row.length === 0 || row.every((c) => !c.trim())) return; // skip empty line

    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract student name
    const rawName = colName !== -1 && row[colName] ? row[colName].trim() : '';
    if (!rawName) {
      errors.push('Student name is required');
    }

    // Extract or auto-assign roll number
    let rawRoll = colRoll !== -1 && row[colRoll] ? row[colRoll].trim() : '';
    if (!rawRoll) {
      const autoNum = existingStudents.length + validRows.length + 1;
      rawRoll = autoNum < 10 ? `0${autoNum}` : `${autoNum}`;
      warnings.push(`Roll no auto-assigned: ${rawRoll}`);
    }

    // Check duplicate roll number
    const rollKey = rawRoll.toLowerCase();
    if (seenFileRolls.has(rollKey)) {
      duplicatesCount++;
      warnings.push(`Duplicate roll no in file (${rawRoll})`);
    } else if (existingRolls.has(rollKey)) {
      duplicatesCount++;
      warnings.push(`Roll no (${rawRoll}) already exists in ${targetClass.name}`);
    }
    seenFileRolls.add(rollKey);

    // Father Name & Contacts
    const fatherName = colFather !== -1 && row[colFather] ? row[colFather].trim() : 'Parent / Guardian';
    const studentPhone = colPhone !== -1 && row[colPhone] ? row[colPhone].trim() : '';
    const fatherPhone = colFatherPhone !== -1 && row[colFatherPhone] ? row[colFatherPhone].trim() : studentPhone || '0300 1234567';
    const address = colAddress !== -1 && row[colAddress] ? row[colAddress].trim() : 'Lahore, Pakistan';
    const notes = colNotes !== -1 && row[colNotes] ? row[colNotes].trim() : 'Enrolled via CSV Roster Import';

    // Attendance Status
    let status: 'P' | 'A' | 'L' | 'U' = 'P';
    if (colStatus !== -1 && row[colStatus]) {
      const s = row[colStatus].trim().toUpperCase();
      if (s === 'P' || s === 'PRESENT') status = 'P';
      else if (s === 'A' || s === 'ABSENT') status = 'A';
      else if (s === 'L' || s === 'LATE') status = 'L';
      else if (s === 'U' || s === 'UNMARKED') status = 'U';
    }

    const isValid = errors.length === 0;

    const studentObj: Student = {
      id: `student-csv-${now}-${idx + 1}`,
      name: rawName,
      rollNo: rawRoll,
      classId: targetClass.id,
      className: targetClass.name,
      avatarUrl: '',
      status,
      statusText: status === 'P' ? 'Present today' : status === 'A' ? 'Absent today' : status === 'L' ? 'Late today' : 'Not marked',
      contact: {
        fatherName,
        studentPhone: studentPhone || fatherPhone,
        fatherPhone,
        address,
      },
      attendanceStats: {
        present: 20,
        absent: 0,
        late: 0,
        totalDays: 20,
        overallPercentage: 100,
        streakDays: 5,
      },
      performance: {
        averageScore: 80,
        classRank: existingStudents.length + validRows.length + 1,
        totalInClass: existingStudents.length + dataRows.length,
        position: 'Top 25%',
        behavior: 'Good',
        remarks: 'Roster import',
      },
      subjectScores: targetClass.subjects.map((subj) => ({
        name: subj.name,
        score: Math.floor(Math.random() * 20) + 75,
        maxScore: 100,
        icon: 'menu_book',
      })),
      notes,
      admissionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    const parsedRow: ParsedRosterRow = {
      index: idx + 1,
      rollNo: rawRoll,
      name: rawName,
      fatherName,
      studentPhone,
      fatherPhone,
      address,
      status,
      notes,
      isValid,
      errors,
      warnings,
      student: isValid ? studentObj : undefined,
    };

    if (isValid) {
      validRows.push(parsedRow);
    } else {
      invalidRows.push(parsedRow);
    }
  });

  return {
    totalRows: dataRows.length,
    validRows,
    invalidRows,
    headersFound: rawHeaders,
    duplicatesCount,
  };
};

/**
 * Downloads a standardized CSV Roster Template for teachers
 */
export const downloadRosterTemplate = (className: string = 'Class Roster'): void => {
  const headers = [
    'Roll No',
    'Student Name',
    'Father Name',
    'Father Phone',
    'Student Phone',
    'Address',
    'Status',
    'Notes',
  ];

  const sampleRows = [
    ['01', 'Hamza Tariq', 'Tariq Mahmood', '0300 1122334', '0312 9988771', 'Model Town, Lahore', 'P', 'Active in class science projects'],
    ['02', 'Aiman Bilal', 'Bilal Ahmed', '0301 2233445', '0313 8877662', 'DHA Phase 5, Lahore', 'P', 'Top student in English speech'],
    ['03', 'Zubair Farooq', 'Farooq Sheikh', '0302 3344556', '0314 7766553', 'Johar Town, Lahore', 'P', 'Transferred from crescent branch'],
    ['04', 'Maryam Siddiqui', 'Siddiqui Rehman', '0303 4455667', '0315 6655444', 'Gulberg II, Lahore', 'P', 'Regular attendee'],
    ['05', 'Danyal Haider', 'Haider Ali', '0304 5566778', '0316 5544335', 'Wapda Town, Lahore', 'P', 'Excels in computer science'],
  ];

  const csvLines = [
    headers.join(','),
    ...sampleRows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ];

  const content = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sanitized = className.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `EduAttend_${sanitized}_Roster_Template.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
};

/**
 * Built-in sample CSV data for instant demo testing
 */
export const SAMPLE_CSV_ROSTER = `Roll No,Student Name,Father Name,Father Phone,Student Phone,Address,Status,Notes
01,Hamza Tariq,Tariq Mahmood,0300 1122334,0312 9988771,Model Town, Lahore,P,Active in class science projects
02,Aiman Bilal,Bilal Ahmed,0301 2233445,0313 8877662,DHA Phase 5, Lahore,P,Top student in English speech
03,Zubair Farooq,Farooq Sheikh,0302 3344556,0314 7766553,Johar Town, Lahore,P,Transferred from crescent branch
04,Maryam Siddiqui,Siddiqui Rehman,0303 4455667,0315 6655444,Gulberg II, Lahore,P,Regular attendee
05,Danyal Haider,Haider Ali,0304 5566778,0316 5544335,Wapda Town, Lahore,P,Excels in computer science
06,Sadia Noor,Noor Hassan,0305 6677889,0317 4433226,Cantt, Lahore,P,Dedicated class monitor`;
