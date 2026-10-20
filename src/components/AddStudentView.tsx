import React, { useState } from 'react';
import { Student } from '../types';

interface AddStudentViewProps {
  currentClassId: string;
  currentClassName: string;
  onBack: () => void;
  onStudentSaved: (newStudent: Student) => void;
}

export const AddStudentView: React.FC<AddStudentViewProps> = ({
  currentClassId,
  currentClassName,
  onBack,
  onStudentSaved,
}) => {
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [admissionDate, setAdmissionDate] = useState('25 Sep 2025');
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAoAwLI9NqodtfpZqVgL-Fv8LNsCffOnurvKOt27k2MtgLsFIdwCafKrbsO4kzUAcidvljWr7w4CugQ3csw-7zsGjC-uj1sto4ICvT1fp_NgY3JMKMvdDD9-7j12DmMoyviwOq7c3xSW-xDsngA-NSdRQUplS8pCDarnVn2uo_mAgtGY22ytq5SsdnoASU12PbtApQimrdjHJi6dECcG2uvtVYE9qVf9Iul7CZxD_NdH-3jZf4YVB0c'
  );

  const sampleAvatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAoAwLI9NqodtfpZqVgL-Fv8LNsCffOnurvKOt27k2MtgLsFIdwCafKrbsO4kzUAcidvljWr7w4CugQ3csw-7zsGjC-uj1sto4ICvT1fp_NgY3JMKMvdDD9-7j12DmMoyviwOq7c3xSW-xDsngA-NSdRQUplS8pCDarnVn2uo_mAgtGY22ytq5SsdnoASU12PbtApQimrdjHJi6dECcG2uvtVYE9qVf9Iul7CZxD_NdH-3jZf4YVB0c',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDMa6Ra4X6wOBwjf21RbCXsqQHZ0FomtT53-3JH_vAr09Mj7K38qSsPsqWpIGMN7oBRbSC86cp3Rn1124PGLVzQnIJUKM6In1zP55_BWEgi9cnvTs5-zvx6G8vQO7c48AiABCj0euKRUxZR9Viojsqg1PJyOfn2by4BEhPqf49UmE37Rno01QwkhxITAbv9P2761n8Bdw5dMYHf4KcUikXA6fylUw-bFSDa6TIoH3pQvkUH1u3vYc5O',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDhbbWfy45xqVaTXSuDR53zT-1Rn2BEYgRvtW5cgSLlzSXxxc2aPjStP05NR22kk5yqT-6u_o5HPyFgV4-Huqwsu5wSR91bw8L4a9J1tVpf56C6DoiGfFdGDANdn_NpWc99oXxtq0LHfH6rq_j8XmdhvUxVkJYXRPEQ49BeLGx6mgC7MS8oaUnc2_kv3vw5yS2vWX-BQ0w0TqtVWVkqAf9o7KODlLlCxVX2-GVKUoU3nFttPpJeSSIV',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDL-G2zASrxLzlxwiDnxqfE0PYO0779bnwU1kYfbjaWdB19xSlKu4SkYwma69fdy0RtVwIJVImjGZgJkoZQ6jmpqvAHg7_QhfYlXpHmDj0-QaXRGz1X1z_vffIj5JP9FRLjcTCaH-mKhzwb75QdEiV5jvuMvNHfc0OHtNgVxqFmoNMx-IJABoLVk8WRZ0A42ySc4sawbyqVfzwAHNq8fYV0oMIIgFBseKZJw9xJ8JeN21oYrifxiB8q',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA8w_SiSjRHclYmx5_3tSo1_a6YTaAWCki8KHLu_Ae6ssC7WxwCUlohekh5Ba6HGscoif-8UxuyMDNGwZJByYQpkwJDmJhms2gz_0fg26Tjm9jofGqR-EHdqcaQ8JbhqC0BlNkyjdCC8XDf4Te-QoD9t4STWzwGLv71MACTlYNQ262y2M4woyoJ6TjkyPFuhIpbxYOK69hlcXHag5bAeyWigCln-Au-JSAw-UtG7ZREDC2ayx5EU19L',
  ];

  const handleCycleAvatar = () => {
    const nextIdx = (sampleAvatars.indexOf(avatarUrl) + 1) % sampleAvatars.length;
    setAvatarUrl(sampleAvatars[nextIdx]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: fullName.trim(),
      rollNo: rollNo.trim() || '12',
      classId: currentClassId,
      className: currentClassName,
      avatarUrl: avatarUrl,
      status: 'P',
      statusText: 'Present today',
      contact: {
        fatherName: fatherName.trim() || 'Parent',
        studentPhone: studentPhone.trim() || '0300 0000000',
        fatherPhone: fatherPhone.trim() || '0300 0000000',
        address: address.trim() || 'Lahore, Pakistan',
      },
      attendanceStats: {
        present: 1,
        absent: 0,
        late: 0,
        totalDays: 1,
        overallPercentage: 100,
        streakDays: 1,
      },
      performance: {
        averageScore: 80,
        classRank: 15,
        totalInClass: 25,
        position: 'Top 50%',
        behavior: 'Good',
        remarks: 'Newly admitted student',
      },
      subjectScores: [
        { name: 'Mathematics', score: null, maxScore: 100, icon: 'calculate' },
        { name: 'Physics', score: null, maxScore: 100, icon: 'blur_on' },
        { name: 'Chemistry', score: null, maxScore: 100, icon: 'science' },
        { name: 'English', score: null, maxScore: 100, icon: 'local_library' },
        { name: 'Urdu', score: null, maxScore: 100, icon: 'translate' },
        { name: 'Computer Science', score: null, maxScore: 100, icon: 'code' },
      ],
      notes: notes.trim(),
      admissionDate: admissionDate,
    };

    onStudentSaved(newStudent);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full pb-28 space-y-4 pt-1">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#0B1C30] hover:bg-slate-50 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <div className="flex flex-col">
          <h1 className="text-[18px] font-bold text-[#0B1C30] leading-tight">Add Student</h1>
          <p className="text-xs text-[#565E74]">Fill in the student details below</p>
        </div>
      </div>

      {/* 1. Student Photo */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-slate-100 shadow-sm ring-2 ring-blue-100 shrink-0">
          <img src={avatarUrl} alt="Student avatar" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleCycleAvatar}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
          </button>
        </div>

        <div className="flex flex-col flex-1">
          <span className="text-xs font-bold text-[#0B1C30]">Student Photo</span>
          <span className="text-[11px] text-[#565E74] mb-2">Add a photo (optional)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCycleAvatar}
              className="px-3 py-1.5 rounded-xl bg-[#EFF4FF] text-[#2563EB] text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>Choose Photo</span>
            </button>
            <button
              type="button"
              onClick={handleCycleAvatar}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[#565E74] text-xs font-semibold flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">gallery_thumbnail</span>
              <span>Gallery</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Recommended size: 1:1 ratio (JPG, PNG)</span>
        </div>
      </div>

      {/* 2. Personal Information */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#DBE1FF] flex items-center justify-center text-[#004AC6]">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
          <h2 className="text-[15px] font-bold text-[#0B1C30]">Personal Information</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">
              Full Name <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB]">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">person</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter student name"
                className="w-full bg-transparent text-xs text-[#0B1C30] focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">
              Roll Number <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB]">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">tag</span>
              <input
                type="text"
                required
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 01"
                className="w-full bg-transparent text-xs text-[#0B1C30] focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">Student Phone (Optional)</label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB]">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">call</span>
              <input
                type="tel"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="e.g. 0300 1234567"
                className="w-full bg-transparent text-xs text-[#0B1C30] focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">Admission Date</label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB]">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">calendar_today</span>
              <input
                type="text"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full bg-transparent text-xs text-[#0B1C30] focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Parent / Guardian Information */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#007D55]">
            <span className="material-symbols-outlined text-[18px]">family_restroom</span>
          </div>
          <h2 className="text-[15px] font-bold text-[#0B1C30]">Parent / Guardian Information</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">
              Father's Name <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB]">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">person</span>
              <input
                type="text"
                required
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Enter father's name"
                className="w-full bg-transparent text-xs text-[#0B1C30] focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1C30]">
              Father's Phone <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB]">
              <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">call</span>
              <input
                type="tel"
                required
                value={fatherPhone}
                onChange={(e) => setFatherPhone(e.target.value)}
                placeholder="e.g. 0300 1234567"
                className="w-full bg-transparent text-xs text-[#0B1C30] focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Address */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
          </div>
          <h2 className="text-[15px] font-bold text-[#0B1C30]">Address</h2>
        </div>

        <div className="flex items-center h-12 bg-white border border-slate-200 rounded-xl px-3 focus-within:border-[#2563EB]">
          <span className="material-symbols-outlined text-[#565E74] text-[18px] mr-2">home</span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter complete address"
            className="w-full bg-transparent text-xs text-[#0B1C30] focus:outline-none font-medium"
          />
        </div>
      </div>

      {/* 5. Additional Information */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <span className="material-symbols-outlined text-[18px]">description</span>
          </div>
          <h2 className="text-[15px] font-bold text-[#0B1C30]">Additional Information</h2>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes or special information (optional)"
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-[#0B1C30] placeholder:text-[#737686] focus:outline-none focus:border-[#2563EB] resize-none"
          />
          <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">
            {notes.length}/500
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="submit"
          className="w-full h-[52px] rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-[0_6px_20px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          <span>Save Student</span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full h-12 rounded-2xl bg-white border border-slate-200 text-[#565E74] hover:bg-slate-50 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          <span>Cancel</span>
        </button>
      </div>
    </form>
  );
};
