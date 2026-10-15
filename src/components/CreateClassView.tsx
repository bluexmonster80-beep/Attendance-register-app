import React, { useState } from 'react';
import { ClassItem, SubjectItem } from '../types';

interface CreateClassViewProps {
  onBack: () => void;
  onClassCreated: (newClass: ClassItem) => void;
}

export const CreateClassView: React.FC<CreateClassViewProps> = ({ onBack, onClassCreated }) => {
  const [className, setClassName] = useState('Class 10 - A');
  const [grade, setGrade] = useState('10');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [teacherName, setTeacherName] = useState('Muhammad Asif');

  const [subjects, setSubjects] = useState<SubjectItem[]>([
    { name: 'Mathematics', color: '#2563EB' },
    { name: 'Physics', color: '#10B981' },
    { name: 'Chemistry', color: '#F59E0B' },
    { name: 'English', color: '#EF4444' },
    { name: 'Urdu', color: '#14B8A6' },
    { name: 'Computer Science', color: '#8B5CF6' },
  ]);

  const [days, setDays] = useState('Monday - Friday');
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('09:00 AM');
  const [studentMethod, setStudentMethod] = useState<'manual' | 'excel' | 'later'>('manual');
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [showAddSubjectInput, setShowAddSubjectInput] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('Room 204');
  const [maxCapacity, setMaxCapacity] = useState('35');

  const handleRemoveSubject = (indexToRemove: number) => {
    setSubjects(subjects.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddSubject = () => {
    if (newSubjectInput.trim()) {
      const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#14B8A6', '#8B5CF6', '#EC4899'];
      const randomColor = colors[subjects.length % colors.length];
      setSubjects([...subjects, { name: newSubjectInput.trim(), color: randomColor }]);
      setNewSubjectInput('');
      setShowAddSubjectInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdClass: ClassItem = {
      id: `class-${Date.now()}`,
      name: className || 'New Class',
      grade: grade,
      section: className.split('-')[1]?.trim() || 'A',
      academicYear: academicYear,
      teacherName: teacherName,
      subjects: subjects,
      studentCount: 24,
      todayAttendance: {
        present: 0,
        total: 24,
        percentage: 0,
      },
      schedule: {
        days: days,
        startTime: startTime,
        endTime: endTime,
      },
      categoryIcon: 'school',
      badgeColor: 'bg-blue-100 text-blue-700',
    };

    onClassCreated(createdClass);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full pb-28 select-none space-y-4 pt-1">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#0B1C30] hover:bg-slate-50 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-[18px] font-bold text-[#0B1C30] leading-tight">Create New Class</h1>
            <p className="text-xs text-[#565E74]">Fill in the details to create a new class</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setClassName('Class 10 - B');
            setGrade('10');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-blue-200/60 text-[#004AC6] text-xs font-semibold hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] material-symbols-filled">auto_stories</span>
          <span>Quick Add</span>
        </button>
      </div>

      {/* 1. Basic Class Information */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#DBE1FF] flex items-center justify-center text-[#004AC6]">
            <span className="material-symbols-outlined text-[18px] material-symbols-filled">school</span>
          </div>
          <h2 className="text-[15px] font-bold text-[#0B1C30]">Basic Class Information</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Class Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">
              Class Name <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">school</span>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Class 10 - A"
                className="w-full bg-transparent text-xs font-semibold text-[#0B1C30] focus:outline-none"
              />
            </div>
          </div>

          {/* Grade/Section */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">
              Grade/Section <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB] relative">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">groups</span>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-[#0B1C30] focus:outline-none appearance-none pr-4"
              >
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              <span className="material-symbols-outlined text-[#565E74] text-[16px] absolute right-3 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Academic Year */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">
              Academic Year <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB] relative">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">calendar_today</span>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-[#0B1C30] focus:outline-none appearance-none pr-4"
              >
                <option value="2025 - 2026">2025 - 2026</option>
                <option value="2024 - 2025">2024 - 2025</option>
                <option value="2026 - 2027">2026 - 2027</option>
              </select>
              <span className="material-symbols-outlined text-[#565E74] text-[16px] absolute right-3 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Teacher Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">
              Teacher Name <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB] relative">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">person</span>
              <select
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-[#0B1C30] focus:outline-none appearance-none pr-4 truncate"
              >
                <option value="Muhammad Asif">Muhammad Asif</option>
                <option value="Ayesha Siddiqui">Ayesha Siddiqui</option>
                <option value="Rashid Mehmood">Rashid Mehmood</option>
                <option value="Farah Naz">Farah Naz</option>
              </select>
              <span className="material-symbols-outlined text-[#565E74] text-[16px] absolute right-3 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Subjects */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#0B1C30]">Subjects</h2>
              <p className="text-[11px] text-[#565E74]">Select the subjects for this class</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSubjectInput(!showAddSubjectInput)}
            className="text-xs font-bold text-[#2563EB] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Subject</span>
          </button>
        </div>

        {/* Dynamic add subject input */}
        {showAddSubjectInput && (
          <div className="flex items-center gap-2 p-2 bg-blue-50/60 rounded-xl border border-blue-100">
            <input
              type="text"
              value={newSubjectInput}
              onChange={(e) => setNewSubjectInput(e.target.value)}
              placeholder="e.g. Biology, History, Art"
              className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSubject}
              className="px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-bold hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}

        {/* Selected Subjects Badges Grid */}
        <div className="flex flex-wrap gap-2 pt-1">
          {subjects.map((subj, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-blue-100/80 text-xs font-semibold text-[#0B1C30] shadow-2xs"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subj.color }} />
              <span>{subj.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveSubject(index)}
                className="text-slate-400 hover:text-rose-600 rounded-full flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Class Schedule */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#007D55]">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-[#0B1C30]">Class Schedule</h2>
            <p className="text-[11px] text-[#565E74]">Set the regular class timings</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Days */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#0B1C30]">Days</label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-2.5 relative">
              <span className="material-symbols-outlined text-[#565E74] text-[16px] mr-1.5">calendar_today</span>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full bg-transparent text-[11px] font-semibold text-[#0B1C30] focus:outline-none appearance-none pr-3 truncate"
              >
                <option value="Monday - Friday">Monday - Friday</option>
                <option value="Mon, Wed, Fri">Mon, Wed, Fri</option>
                <option value="Tue, Thu, Sat">Tue, Thu, Sat</option>
                <option value="All Week">All Week</option>
              </select>
              <span className="material-symbols-outlined text-[#565E74] text-[14px] absolute right-2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Start Time */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#0B1C30]">Start Time</label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-2.5 relative">
              <span className="material-symbols-outlined text-[#565E74] text-[16px] mr-1.5">schedule</span>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-transparent text-[11px] font-semibold text-[#0B1C30] focus:outline-none appearance-none pr-3"
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="08:30 AM">08:30 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
              </select>
              <span className="material-symbols-outlined text-[#565E74] text-[14px] absolute right-2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#0B1C30]">End Time</label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-2.5 relative">
              <span className="material-symbols-outlined text-[#565E74] text-[16px] mr-1.5">schedule</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-transparent text-[11px] font-semibold text-[#0B1C30] focus:outline-none appearance-none pr-3"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
              </select>
              <span className="material-symbols-outlined text-[#565E74] text-[14px] absolute right-2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Add Students */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#0B1C30]">Add Students</h2>
              <p className="text-[11px] text-[#565E74]">Add students to this class</p>
            </div>
          </div>

          {/* Student Avatar Illustration */}
          <div className="relative w-12 h-10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-white flex items-center justify-center -mr-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600">person</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-white flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-[18px] text-indigo-600">person</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] flex items-center justify-center font-bold">
              +
            </span>
          </div>
        </div>

        {/* 3 Option Tiles */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setStudentMethod('manual')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studentMethod === 'manual'
                ? 'bg-[#EFF4FF] border-[#2563EB] text-[#2563EB] ring-1 ring-[#2563EB]'
                : 'bg-white border-slate-200 text-[#565E74] hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span className="text-[11px] font-bold leading-tight">Add Manually</span>
          </button>

          <button
            type="button"
            onClick={() => setStudentMethod('excel')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studentMethod === 'excel'
                ? 'bg-[#EFF4FF] border-[#2563EB] text-[#2563EB] ring-1 ring-[#2563EB]'
                : 'bg-white border-slate-200 text-[#565E74] hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            <span className="text-[11px] font-bold leading-tight">Import Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setStudentMethod('later')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studentMethod === 'later'
                ? 'bg-[#EFF4FF] border-[#2563EB] text-[#2563EB] ring-1 ring-[#2563EB]'
                : 'bg-white border-slate-200 text-[#565E74] hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">schedule</span>
            <span className="text-[11px] font-bold leading-tight">Add Later</span>
          </button>
        </div>

        {/* Helper Note */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EFF4FF] text-[#004AC6] text-[11px]">
          <span className="material-symbols-outlined text-[16px] text-[#2563EB] shrink-0">info</span>
          <span>You can add students now or later from the class settings.</span>
        </div>
      </div>

      {/* 5. Additional Settings Accordion */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-[#2563EB]">
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#0B1C30]">Additional Settings</h2>
              <p className="text-[11px] text-[#565E74]">Optional settings for your class</p>
            </div>
          </div>
          <span
            className={`material-symbols-outlined text-[#565E74] text-[20px] transition-transform ${
              isAccordionOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {isAccordionOpen && (
          <div className="p-4 pt-0 border-t border-slate-100 grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0B1C30]">Room Number</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0B1C30]">Capacity</label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary Submit CTA */}
      <button
        type="submit"
        className="w-full h-[52px] rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-[0_6px_20px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        <span>Create Class</span>
      </button>
    </form>
  );
};
