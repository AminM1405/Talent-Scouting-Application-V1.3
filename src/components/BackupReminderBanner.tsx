import React, { useState } from 'react';
import { ShieldAlert, Download, X, Clock, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { AssessmentRecord } from '../lib/firebase';
import { BackupStatus, exportAssessmentsToCSV, snoozeBackupReminder } from '../lib/exportCsv';

interface BackupReminderProps {
  assessments: AssessmentRecord[];
  backupStatus: BackupStatus;
  onBackupCompleted: (count: number, filename: string) => void;
  onDismiss: () => void;
}

export const BackupReminderBanner: React.FC<BackupReminderProps> = ({
  assessments,
  backupStatus,
  onBackupCompleted,
  onDismiss
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!backupStatus.isRecommended) return null;

  const handleDownload = () => {
    setIsExporting(true);
    try {
      const res = exportAssessmentsToCSV(assessments, 'ITDF_Cadangan_Rutin');
      if (res.success) {
        onBackupCompleted(res.count, res.filename);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleSnooze = () => {
    snoozeBackupReminder(24); // Tunda 24 jam
    onDismiss();
  };

  const formattedLastDate = backupStatus.lastBackupTime
    ? new Date(backupStatus.lastBackupTime).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : null;

  return (
    <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-[#fdfbf6] to-amber-50/60 p-4 sm:p-4.5 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 no-print">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                Pengingat Cadangan Data Rutin
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-200/70 text-amber-900 border border-amber-300/60">
                {assessments.length} Data Tersimpan
              </span>
            </div>

            <p className="text-xs text-amber-900/80 leading-relaxed">
              {formattedLastDate ? (
                <>
                  Terakhir dicadangkan pada <b>{formattedLastDate}</b>. Terdapat{' '}
                  <span className="font-semibold text-amber-950">
                    {backupStatus.unbackedCount} data asesmen baru
                  </span>{' '}
                  sejak cadangan sebelumnya. Disarankan mengunduh berkas CSV untuk arsip berkala.
                </>
              ) : (
                <>
                  Anda telah memiliki <b>{assessments.length} data asesmen</b> di sistem.
                  Sangat disarankan mengunduh salinan berkas cadangan (CSV) secara berkala agar arsip sekolah selalu aman di komputer lokal.
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleSnooze}
          className="text-amber-700/60 hover:text-amber-900 hover:bg-amber-100/60 p-1.5 rounded-lg transition-colors shrink-0"
          title="Tutup pengingat (tunda 24 jam)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200/60 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-amber-800/80">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>
            {formattedLastDate
              ? `Terakhir unduh: ${formattedLastDate}`
              : 'Belum pernah diunduh'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSnooze}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-100/70 transition-colors"
          >
            Ingatkan Nanti
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Mengunduh...' : 'Unduh Cadangan CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
