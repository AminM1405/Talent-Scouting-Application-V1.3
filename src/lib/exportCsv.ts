import { AssessmentRecord } from './firebase';
import { DOMAINS } from '../data/domains';

const LAST_BACKUP_TIME_KEY = 'itdf_last_backup_time';
const LAST_BACKUP_COUNT_KEY = 'itdf_last_backup_count';
const BACKUP_SNOOZE_KEY = 'itdf_backup_snooze_until';

// Ambang batas jumlah data untuk memicu pengingat (misal: minimal 5 asesmen)
export const BACKUP_THRESHOLD_MIN_ITEMS = 5;
// Jeda jumlah data baru sebelum diingatkan kembali (misal: setiap 5 data baru)
export const BACKUP_INTERVAL_ITEMS = 5;
// Jeda waktu maksimal sebelum diingatkan kembali (misal: 7 hari dalam milidetik)
export const BACKUP_MAX_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface BackupStatus {
  lastBackupTime: string | null;
  lastBackupCount: number;
  unbackedCount: number;
  isRecommended: boolean;
  isSnoozed: boolean;
}

export function getBackupStatus(totalAssessments: number): BackupStatus {
  try {
    const lastTime = localStorage.getItem(LAST_BACKUP_TIME_KEY);
    const lastCount = Number(localStorage.getItem(LAST_BACKUP_COUNT_KEY) || 0);
    const snoozeUntil = Number(localStorage.getItem(BACKUP_SNOOZE_KEY) || 0);

    const isSnoozed = Date.now() < snoozeUntil;
    const unbackedCount = Math.max(0, totalAssessments - lastCount);

    let isRecommended = false;
    if (totalAssessments >= BACKUP_THRESHOLD_MIN_ITEMS) {
      if (!lastTime) {
        // Belum pernah dicadangkan sama sekali dan data sudah >= 5
        isRecommended = true;
      } else {
        const timeDiff = Date.now() - new Date(lastTime).getTime();
        // Rekomendasi jika ada >= 5 data baru ATAU sudah lebih dari 7 hari
        if (unbackedCount >= BACKUP_INTERVAL_ITEMS || timeDiff > BACKUP_MAX_DAYS_MS) {
          isRecommended = true;
        }
      }
    }

    return {
      lastBackupTime: lastTime,
      lastBackupCount: lastCount,
      unbackedCount,
      isRecommended: isRecommended && !isSnoozed,
      isSnoozed
    };
  } catch {
    return {
      lastBackupTime: null,
      lastBackupCount: 0,
      unbackedCount: totalAssessments,
      isRecommended: totalAssessments >= BACKUP_THRESHOLD_MIN_ITEMS,
      isSnoozed: false
    };
  }
}

export function snoozeBackupReminder(hours = 24) {
  try {
    const until = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem(BACKUP_SNOOZE_KEY, String(until));
  } catch {}
}

export function recordBackupSuccess(totalCount: number) {
  try {
    const nowIso = new Date().toISOString();
    localStorage.setItem(LAST_BACKUP_TIME_KEY, nowIso);
    localStorage.setItem(LAST_BACKUP_COUNT_KEY, String(totalCount));
    localStorage.removeItem(BACKUP_SNOOZE_KEY);
  } catch {}
}

/**
 * Mengekspor daftar asesmen ke file CSV dengan format UTF-8 BOM
 */
export function exportAssessmentsToCSV(
  assessments: AssessmentRecord[],
  filenamePrefix = 'ITDF_Cadangan_Asesmen'
): { success: boolean; count: number; filename: string } {
  if (assessments.length === 0) {
    return { success: false, count: 0, filename: '' };
  }

  const headers = [
    'Nama Siswa',
    'Kode Siswa',
    'Sekolah',
    'Kelas',
    'Aspirasi',
    'Tanggal Asesmen',
    'Domain Tertinggi',
    'Skor Tertinggi',
    ...DOMAINS.map((d) => d.name),
    'Ringkasan'
  ];

  const rows = assessments.map((a) => {
    const dateStr = a.created_at
      ? new Date(a.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : '—';

    const domainScoreValues = DOMAINS.map((d) => {
      const val = a.scores?.[d.key];
      return val !== undefined ? Number(val).toFixed(2) : '—';
    });

    return [
      a.student_name,
      a.student_code,
      a.school || '—',
      a.grade || '—',
      a.aspiration || '—',
      dateStr,
      a.top_domain || '—',
      a.top_score ? a.top_score.toFixed(2) : '—',
      ...domainScoreValues,
      a.summary || '—'
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((item) => `"${String(item).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\r\n');

  // Menggunakan BOM UTF-8 (\ufeff) untuk kompatibilitas penuh Microsoft Excel
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  const filename = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;

  downloadLink.href = url;
  downloadLink.setAttribute('download', filename);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  // Catat riwayat backup berhasil
  recordBackupSuccess(assessments.length);

  return { success: true, count: assessments.length, filename };
}
