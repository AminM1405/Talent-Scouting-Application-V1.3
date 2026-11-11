import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Eye,
  Calendar,
  Award,
  ArrowUpDown,
  X,
  FileDown,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { AssessmentRecord } from '../lib/firebase';
import { DOMAINS } from '../data/domains';
import { exportAssessmentsToCSV, getBackupStatus } from '../lib/exportCsv';

interface ReportListProps {
  assessments: AssessmentRecord[];
  onSelectAssessment: (assessment: AssessmentRecord) => void;
  onPrintAssessment: (assessment: AssessmentRecord) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  onBackupCompleted?: () => void;
}

export const ReportListView: React.FC<ReportListProps> = ({
  assessments,
  onSelectAssessment,
  onPrintAssessment,
  showToast,
  onBackupCompleted
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'HIGHEST_SCORE' | 'NAME_ASC'>('NEWEST');

  const backupStatus = getBackupStatus(assessments.length);

  // Filter & Search Logic
  const filteredAssessments = useMemo(() => {
    return assessments
      .filter((a) => {
        const query = searchQuery.toLowerCase();
        const matchSearch =
          searchQuery === '' ||
          a.student_name.toLowerCase().includes(query) ||
          a.student_code.toLowerCase().includes(query) ||
          (a.school && a.school.toLowerCase().includes(query)) ||
          (a.top_domain && a.top_domain.toLowerCase().includes(query));

        const matchGrade = selectedGrade === 'ALL' || a.grade === selectedGrade;

        const matchDomain = selectedDomain === 'ALL' || a.top_domain === selectedDomain;

        return matchSearch && matchGrade && matchDomain;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        }
        if (sortBy === 'HIGHEST_SCORE') {
          return (b.top_score || 0) - (a.top_score || 0);
        }
        if (sortBy === 'NAME_ASC') {
          return a.student_name.localeCompare(b.student_name);
        }
        return 0;
      });
  }, [assessments, searchQuery, selectedGrade, selectedDomain, sortBy]);

  // Real-Time CSV Export
  const handleExportCSV = (onlyFiltered = false) => {
    const dataToExport = onlyFiltered ? filteredAssessments : assessments;

    if (dataToExport.length === 0) {
      showToast('Tidak ada data asesmen untuk diekspor ke CSV.', 'error', 'Ekspor Gagal');
      return;
    }

    const res = exportAssessmentsToCSV(
      dataToExport,
      onlyFiltered ? 'ITDF_Hasil_Terfilter' : 'ITDF_Cadangan_Lengkap'
    );

    if (res.success) {
      showToast(
        `Berhasil mengekspor ${res.count} data asesmen ke ${res.filename}.`,
        'success',
        'Cadangan CSV Berhasil'
      );
      onBackupCompleted?.();
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto">
      {/* Header & Export Actions */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-stone-900">Hasil &amp; Laporan Asesmen</h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Kelola arsip eksplorasi bakat siswa dan ekspor data real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportCSV(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
            title="Unduh seluruh rekaman dalam format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Status Cadangan Berkala */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-3.5 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            backupStatus.isRecommended
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {backupStatus.isRecommended ? (
              <Clock className="w-4 h-4 text-amber-700" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            )}
          </div>

          <div className="min-w-0 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-stone-900">Arsip Cadangan CSV</span>
              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                backupStatus.isRecommended
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {backupStatus.isRecommended ? 'Disarankan Unduh' : 'Terkini'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {backupStatus.lastBackupTime ? (
                <>
                  Terakhir:{' '}
                  {new Date(backupStatus.lastBackupTime).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}{' '}
                  ({backupStatus.unbackedCount > 0 ? `${backupStatus.unbackedCount} data baru` : 'Semua tersimpan'})
                </>
              ) : (
                'Belum pernah diunduh'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleExportCSV(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-stone-500" />
          <span>Cadangkan Sekarang</span>
        </button>
      </div>

      {/* Filter & Pencarian Bar */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-4 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, kode, sekolah, atau domain..."
            className="w-full pl-10 pr-8 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm outline-hidden focus:border-[#70263d] focus:ring-2 focus:ring-[#70263d]/20 bg-stone-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Filter Jenjang */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Jenjang Kelas
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-200 bg-white font-medium text-xs outline-hidden focus:border-[#70263d]"
            >
              <option value="ALL">Semua Kelas</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
          </div>

          {/* Filter Domain */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Domain Tertinggi
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-200 bg-white font-medium text-xs outline-hidden focus:border-[#70263d]"
            >
              <option value="ALL">Semua Domain</option>
              {DOMAINS.map((d) => (
                <option key={d.key} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 mb-1">
              Urutkan Data
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 rounded-xl border border-stone-200 bg-white font-medium text-xs outline-hidden focus:border-[#70263d]"
            >
              <option value="NEWEST">Terbaru</option>
              <option value="OLDEST">Terlama</option>
              <option value="HIGHEST_SCORE">Skor Tertinggi</option>
              <option value="NAME_ASC">Nama (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Info filter aktif */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
          <span>
            Ditemukan <b>{filteredAssessments.length}</b> dari {assessments.length} asesmen
          </span>
          {(searchQuery || selectedGrade !== 'ALL' || selectedDomain !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGrade('ALL');
                setSelectedDomain('ALL');
                setSortBy('NEWEST');
              }}
              className="text-[#70263d] font-semibold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* List Kartu Hasil Asesmen */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eaded8] p-8 text-center text-stone-500 space-y-2">
          <FileSpreadsheet className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-xs">
            {assessments.length === 0
              ? 'Belum ada data asesmen yang masuk. Mulai asesmen siswa terlebih dahulu.'
              : 'Tidak ada hasil yang sesuai dengan kriteria filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssessments.map((item) => {
            const formattedDate = item.created_at
              ? new Date(item.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : '—';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#eaded8] p-4 shadow-xs hover:border-[#70263d]/30 transition-all space-y-3"
              >
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 truncate">
                        {item.student_name}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-[#70263d] bg-[#f3e6e0] px-1.5 py-0.2 rounded">
                        {item.student_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                      <span>Kelas {item.grade}</span>
                      {item.school && (
                        <>
                          <span>·</span>
                          <span className="truncate">{item.school}</span>
                        </>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Skor Tertinggi */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-600 block">Skor Teratas</span>
                    <span className="text-base font-bold font-mono text-emerald-700">
                      {item.top_score?.toFixed(2) || '—'}
                      <span className="text-[10px] text-stone-500 font-sans">/5</span>
                    </span>
                  </div>
                </div>

                {/* Domain Unggulan Badge */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-stone-500 text-[11px] shrink-0">Domain Utama:</span>
                    <span className="font-bold text-stone-800 truncate">
                      {item.top_domain || '—'}
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onPrintAssessment(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5 text-stone-500" />
                    <span>Cetak / PDF</span>
                  </button>

                  <button
                    onClick={() => onSelectAssessment(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#70263d] hover:bg-[#591b2e] text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Buka Rincian</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
