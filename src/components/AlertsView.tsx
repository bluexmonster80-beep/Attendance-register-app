import React, { useState } from 'react';

interface AlertItem {
  id: string;
  type: 'late' | 'absence' | 'reminder' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  icon: string;
  badgeColor: string;
}

interface AlertsViewProps {
  onBack?: () => void;
  onTakeAction?: (alert: AlertItem) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onBack, onTakeAction }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert-1',
      type: 'late',
      title: 'Late Arrival Notified',
      description: 'Usman Ali (Roll 03) arrived 15 mins late due to route traffic. SMS sent to parent.',
      time: '10 mins ago',
      read: false,
      actionLabel: 'Call Parent',
      icon: 'schedule',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'alert-2',
      type: 'absence',
      title: 'Critical Absence Threshold',
      description: 'Ali Raza has exceeded 8 days missed this month (52% overall attendance).',
      time: '1 hour ago',
      read: false,
      actionLabel: 'View Record',
      icon: 'person_alert',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'alert-3',
      type: 'reminder',
      title: 'Register Ready for Submission',
      description: 'Class 10 - A daily attendance register is 100% verified and ready to sync with portal.',
      time: '2 hours ago',
      read: false,
      actionLabel: 'Submit Register',
      icon: 'fact_check',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'alert-4',
      type: 'system',
      title: 'Academic Term 2 Examination',
      description: 'Mid-term score submission portal will close on 30 Sep 2025.',
      time: 'Yesterday',
      read: true,
      icon: 'event',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
  ]);

  const handleMarkAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  const handleDismiss = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col w-full pb-28 space-y-3.5 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#0B1C30] hover:bg-slate-50 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-[18px] font-bold text-[#0B1C30] leading-tight">Notifications &amp; Alerts</h1>
            <p className="text-xs text-[#565E74]">Real-time student &amp; attendance updates</p>
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
        >
          Mark all read
        </button>
      </div>

      {/* Alerts Stack */}
      <div className="flex flex-col gap-3">
        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-[#565E74]">
            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2">notifications_paused</span>
            <p className="text-sm font-semibold">You're all caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No pending alerts or notifications</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl bg-white border transition-all shadow-sm flex flex-col gap-2.5 ${
                !alert.read ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${alert.badgeColor}`}>
                    <span className="material-symbols-outlined text-[20px]">{alert.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0B1C30]">{alert.title}</span>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-[#BA1A1A]" />
                      )}
                    </div>
                    <p className="text-xs text-[#565E74] mt-0.5 leading-relaxed">{alert.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1">{alert.time}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {alert.actionLabel && (
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                  <button
                    onClick={() => onTakeAction && onTakeAction(alert)}
                    className="px-3 py-1.5 rounded-lg bg-[#EFF4FF] hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-colors cursor-pointer"
                  >
                    {alert.actionLabel}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
