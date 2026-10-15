import React, { useState } from 'react';
import { Student } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  type: 'call' | 'message';
  student: Student | null;
  onClose: () => void;
  onConfirm: (message?: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  type,
  student,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !student) return null;

  const [messageText, setMessageText] = useState(
    `Dear ${student.contact.fatherName},\nThis is an official update from Crescent Model Higher Secondary School regarding ${student.name} (Roll No: ${student.rollNo}, Class 10 - A). Current attendance: ${student.attendanceStats.overallPercentage}%.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                type === 'call' ? 'bg-emerald-100 text-[#007D55]' : 'bg-blue-100 text-[#2563EB]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {type === 'call' ? 'call' : 'chat'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1C30]">
                {type === 'call' ? 'Call Parent / Guardian' : 'Send Message to Parent'}
              </h3>
              <p className="text-xs text-[#565E74]">{student.contact.fatherName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {type === 'call' ? (
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-[#EFF4FF] rounded-2xl text-center">
              <span className="text-xs text-[#565E74]">Father's Registered Number</span>
              <p className="text-base font-bold text-[#2563EB] mt-0.5">{student.contact.fatherPhone}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <a
                href={`tel:${student.contact.fatherPhone}`}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#007D55] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-800"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                Dial Now
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0B1C30]">SMS / WhatsApp Message</label>
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-[#EFF4FF] border border-blue-200/80 rounded-2xl p-3 text-xs text-[#0B1C30] focus:outline-none focus:border-[#2563EB] resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm(messageText);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Send SMS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopied: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onCopied }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-[#2563EB]">
              <span className="material-symbols-outlined text-[22px]">share</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1C30]">Share Attendance Report</h3>
              <p className="text-xs text-[#565E74]">Class 10 - A • Sep 2025</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs text-[#565E74] leading-relaxed">
          Export this monthly report directly to school principal, parents council, or download spreadsheet.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onCopied();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#EFF4FF] hover:bg-blue-100 text-[#2563EB] text-xs font-bold flex items-center justify-center gap-2 border border-blue-200/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            <span>Copy Direct Portal Link</span>
          </button>

          <button
            onClick={() => {
              onCopied();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#007D55] hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Share via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
