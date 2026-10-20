import React, { useState, useRef } from 'react';
import { ClassItem, Student } from '../types';
import { parseRosterCSV, downloadRosterTemplate, SAMPLE_CSV_ROSTER, ParsedRosterResult } from '../utils/csvImporter';
import { soundFX } from '../utils/audio';

interface ImportRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  selectedClassId: string;
  existingStudents: Student[];
  onImportStudents: (students: Student[], targetClassId: string) => void;
  onToast?: (message: string) => void;
}

export const ImportRosterModal: React.FC<ImportRosterModalProps> = ({
  isOpen,
  onClose,
  classes,
  selectedClassId,
  existingStudents,
  onImportStudents,
  onToast,
}) => {
  const [targetClassId, setTargetClassId] = useState<string>(selectedClassId || classes[0]?.id || '');
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<ParsedRosterResult | null>(null);
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetClass = classes.find((c) => c.id === targetClassId) || classes[0];

  const handleProcessCSV = (text: string, sourceName: string) => {
    setCsvRawText(text);
    setFileName(sourceName);
    if (!targetClass) return;

    const result = parseRosterCSV(text, targetClass, existingStudents);
    setParsedResult(result);

    // Default select all valid rows
    const validIdxs = new Set(result.validRows.map((r) => r.index));
    setSelectedRowIndexes(validIdxs);
    soundFX.triggerHaptic('light');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessCSV(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      if (onToast) onToast('Please upload a standard .csv or .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessCSV(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    soundFX.triggerHaptic('light');
    handleProcessCSV(SAMPLE_CSV_ROSTER, 'Sample_Roster_Demo.csv');
    if (onToast) onToast('Loaded 6 demo student records for testing');
  };

  const handleDownloadTemplate = () => {
    soundFX.triggerHaptic('light');
    downloadRosterTemplate(targetClass?.name || 'Class');
    if (onToast) onToast('Roster template downloaded (.csv)');
  };

  const toggleSelectAll = () => {
    if (!parsedResult) return;
    if (selectedRowIndexes.size === parsedResult.validRows.length) {
      setSelectedRowIndexes(new Set());
    } else {
      setSelectedRowIndexes(new Set(parsedResult.validRows.map((r) => r.index)));
    }
  };

  const toggleRow = (idx: number) => {
    const next = new Set(selectedRowIndexes);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedRowIndexes(next);
  };

  const handleConfirmImport = () => {
    if (!parsedResult || selectedRowIndexes.size === 0 || !targetClass) return;

    setIsSubmitting(true);
    soundFX.triggerHaptic('success');
    soundFX.playAttendanceTone('P');

    const studentsToImport: Student[] = parsedResult.validRows
      .filter((r) => selectedRowIndexes.has(r.index) && r.student)
      .map((r) => ({
        ...r.student!,
        classId: targetClass.id,
        className: targetClass.name,
      }));

    onImportStudents(studentsToImport, targetClass.id);

    const msg = `Successfully imported ${studentsToImport.length} students into ${targetClass.name}!`;
    if (onToast) onToast(msg);

    setIsSubmitting(false);
    onClose();
  };

  const selectedCount = selectedRowIndexes.size;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#007D55] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">upload_file</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold text-[#0B1C30]">Import Student Roster</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#007D55] border border-emerald-200">
                  CSV Support
                </span>
              </div>
              <p className="text-xs text-[#565E74]">Bulk enroll students into classroom register with 1 click</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Target Classroom Selection & Template Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFF] p-3.5 rounded-2xl border border-blue-100/60">
            <div>
              <label className="text-[11px] font-bold text-[#565E74] block mb-1">Target Classroom</label>
              <div className="relative">
                <select
                  value={targetClassId}
                  onChange={(e) => {
                    setTargetClassId(e.target.value);
                    if (csvRawText && targetClass) {
                      const newTarget = classes.find((c) => c.id === e.target.value) || targetClass;
                      const res = parseRosterCSV(csvRawText, newTarget, existingStudents);
                      setParsedResult(res);
                      setSelectedRowIndexes(new Set(res.validRows.map((r) => r.index)));
                    }
                  }}
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-[#0B1C30] outline-none focus:border-blue-500 cursor-pointer appearance-none pr-8 shadow-2xs"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.studentCount} existing students)
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="text-[11px] font-bold text-[#565E74] block mb-1">Quick Actions</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-blue-50 text-[#004AC6] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Download standard CSV spreadsheet template"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  <span>Template</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[#007D55] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Load 6 sample students for quick testing"
                >
                  <span className="material-symbols-outlined text-[15px]">play_circle</span>
                  <span>Sample Roster</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Switcher: Upload File vs Paste Raw CSV */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1 p-0.5 bg-[#EFF4FF] rounded-xl border border-blue-100/60">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'upload' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#565E74]'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'manual' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#565E74]'
                }`}
              >
                Paste CSV Text
              </button>
            </div>

            {fileName && (
              <span className="text-xs text-[#565E74] font-medium flex items-center gap-1 truncate max-w-[200px]">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                <span className="truncate">{fileName}</span>
              </span>
            )}
          </div>

          {/* Upload Drop Zone */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2 shadow-xs">
                <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#0B1C30]">
                Click to browse or drag and drop your CSV roster file here
              </p>
              <p className="text-[11px] text-[#565E74] mt-1">
                Supports column headers: Roll No, Student Name, Father Name, Contact Phone, Status
              </p>
            </div>
          )}

          {/* Manual CSV Paste Area */}
          {activeTab === 'manual' && (
            <div className="space-y-1.5">
              <textarea
                value={csvRawText}
                onChange={(e) => handleProcessCSV(e.target.value, 'Pasted_Data.csv')}
                rows={5}
                placeholder="Paste CSV contents here... e.g.&#10;Roll No,Student Name,Father Name,Father Phone&#10;01,Ahmed Raza,Raza Khan,0300 1234567"
                className="w-full bg-[#F8FAFF] border border-slate-200/90 rounded-2xl p-3 text-xs font-mono text-[#0B1C30] outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-[10px] text-[#565E74]">
                Paste comma-separated rows. The first row must contain column headers.
              </p>
            </div>
          )}

          {/* Validation & Preview Section */}
          {parsedResult && (
            <div className="space-y-3 pt-1">
              {/* Metric Badges Strip */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col items-center text-center">
                  <span className="text-[10px] text-[#565E74] font-medium">Total Rows</span>
                  <span className="text-base font-bold text-[#0B1C30] tabular-nums">
                    {parsedResult.totalRows}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col items-center text-center">
                  <span className="text-[10px] text-[#007D55] font-medium">Valid to Import</span>
                  <span className="text-base font-bold text-[#007D55] tabular-nums">
                    {parsedResult.validRows.length}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex flex-col items-center text-center">
                  <span className="text-[10px] text-amber-700 font-medium">Duplicates / Warnings</span>
                  <span className="text-base font-bold text-amber-800 tabular-nums">
                    {parsedResult.duplicatesCount + parsedResult.invalidRows.length}
                  </span>
                </div>
              </div>

              {/* Table Controls */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {selectedRowIndexes.size === parsedResult.validRows.length ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span>{selectedRowIndexes.size === parsedResult.validRows.length ? 'Deselect All' : 'Select All Valid'}</span>
                </button>
                <span className="text-[#565E74] font-semibold">
                  {selectedCount} of {parsedResult.validRows.length} students selected
                </span>
              </div>

              {/* Students Preview Table */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 sticky top-0 z-10 text-[#565E74] font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3 w-8">#</th>
                      <th className="py-2 px-2.5">Roll</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3 hidden sm:table-cell">Father Name</th>
                      <th className="py-2 px-3 hidden sm:table-cell">Contact</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedResult.validRows.map((row) => {
                      const isSelected = selectedRowIndexes.has(row.index);
                      return (
                        <tr
                          key={row.index}
                          onClick={() => toggleRow(row.index)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'opacity-60 hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(row.index)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-2.5 font-bold text-[#0B1C30]">{row.rollNo}</td>
                          <td className="py-2 px-3 font-semibold text-[#0B1C30]">
                            <div className="flex flex-col">
                              <span>{row.name}</span>
                              {row.warnings.length > 0 && (
                                <span className="text-[9px] text-amber-700 font-medium">
                                  {row.warnings[0]}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-[#565E74] hidden sm:table-cell">{row.fatherName}</td>
                          <td className="py-2 px-3 text-[#565E74] hidden sm:table-cell font-mono text-[11px]">
                            {row.fatherPhone || row.studentPhone}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#007D55]">
                              Ready
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {parsedResult.invalidRows.map((row) => (
                      <tr key={`invalid-${row.index}`} className="bg-red-50/30 text-rose-800">
                        <td className="py-2 px-3">
                          <span className="material-symbols-outlined text-[16px] text-rose-500">error</span>
                        </td>
                        <td className="py-2 px-2.5 font-bold">{row.rollNo || '-'}</td>
                        <td className="py-2 px-3 font-medium">
                          <span>{row.name || '(Missing Name)'}</span>
                          <span className="block text-[9px] text-rose-600 font-bold">{row.errors.join(', ')}</span>
                        </td>
                        <td className="py-2 px-3 hidden sm:table-cell text-slate-400">{row.fatherName}</td>
                        <td className="py-2 px-3 hidden sm:table-cell text-slate-400">-</td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            Skipped
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-[#565E74] hover:bg-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parsedResult || selectedCount === 0 || isSubmitting}
            onClick={handleConfirmImport}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              !parsedResult || selectedCount === 0 || isSubmitting
                ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'
                : 'bg-[#007D55] hover:bg-[#006645] shadow-emerald-500/25'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group_add</span>
            <span>
              {isSubmitting
                ? 'Importing...'
                : `Import ${selectedCount} Students into ${targetClass ? targetClass.name : 'Class'}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
