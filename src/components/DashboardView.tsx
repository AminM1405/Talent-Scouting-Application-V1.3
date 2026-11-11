import React from 'react';
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { StudentRecord, AssessmentRecord } from '../lib/firebase';
import { DOMAINS } from '../data/domains';
import { TalentTrendLineChart } from './TalentTrendLineChart';

interface DashboardProps {
  students: StudentRecord[];
  assessments: AssessmentRecord[];
  onStartAssessment: () => void;
  onViewReports: () => void;
  onViewStudents: () => void;
  onSelectAssessment: (assessment: AssessmentRecord) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  students,
  assessments,
  onStartAssessment,
  onViewReports,
  onViewStudents,
  onSelectAssessment
}) => {
  // Hitung rata-rata keseluruhan
  const allScores = assessments.flatMap((a) => Object.values(a.scores || {}));
  const overallAvg = allScores.length
    ? (allScores.reduce((acc, cur) => acc + Number(cur || 0), 0) / allScores.length).toFixed(2)
    : '—';

  // Hitung rata-rata per domain
  const domainAverages = DOMAINS.map((d) => {
    if (assessments.length === 0) return { ...d, average: 0 };
    const total = assessments.reduce((sum, a) => sum + Number(a.scores?.[d.key] || 0), 0);
    return {
      ...d,
      average: Number((total / assessments.length).toFixed(2))
    };
  });

  // Cari domain dengan rata-rata tertinggi
  const topDomain = domainAverages.length > 0 && assessments.length > 0
    ? [...domainAverages].sort((a, b) => b.average - a.average)[0]
    : null;

  // Sebaran Jenjang Kelas
  const gradeDistribution = {
    X: assessments.filter((a) => a.grade === 'X').length,
    XI: assessments.filter((a) => a.grade === 'XI').length,
    XII: assessments.filter((a) => a.grade === 'XII').length
  };

  const recentAssessments = assessments.slice(0, 5);

  return (
    <div className="space-y-5 pb-24">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#70263d] via-[#852f4a] to-[#591b2e] text-[#fff8ee] p-5 sm:p-6 shadow-md border border-[#852f4a]">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-semibold tracking-wider uppercase text-[#f7d5dc]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Eksplorasi Minat &amp; Bakat Usia 15–18 Tahun
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            Kenali Potensi Siswa.<br />Rancang Arah Masa Depan.
          </h2>

          <p className="text-xs sm:text-sm text-[#f5dede] max-w-lg leading-relaxed">
            Satukan minat, logika berpikir, kemampuan praktis, kreativitas, dan refleksi diri menjadi rencana pengembangan karier yang terukur dan aplikatif.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={onStartAssessment}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#fff8ee] text-[#70263d] font-bold text-xs sm:text-sm shadow-sm hover:bg-white active:scale-95 transition-all"
            >
              <span>Mulai Asesmen Siswa</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewReports}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Lihat Rekap Data</span>
            </button>
          </div>
        </div>

        {/* Decorative Watermark / Circle */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-white/10 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-white/15 flex items-center justify-center">
            <Compass className="w-16 h-16 text-white/10 stroke-[1]" />
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Stat 1 */}
        <div
          onClick={onViewStudents}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#eaded8] shadow-xs cursor-pointer hover:border-[#70263d]/40 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-stone-600 mb-1">
            <span className="text-[11px] font-medium">Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-[#70263d]" />
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {students.length}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Database Firestore</p>
        </div>

        {/* Stat 2 */}
        <div
          onClick={onViewReports}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#eaded8] shadow-xs cursor-pointer hover:border-[#70263d]/40 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-stone-600 mb-1">
            <span className="text-[11px] font-medium">Asesmen Masuk</span>
            <ClipboardCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {assessments.length}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">48 butir tuntas</p>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#eaded8] shadow-xs">
          <div className="flex items-center justify-between text-stone-600 mb-1">
            <span className="text-[11px] font-medium">Rata-rata Skor</span>
            <TrendingUp className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {overallAvg}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Skala respons 1–5</p>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#eaded8] shadow-xs">
          <div className="flex items-center justify-between text-stone-600 mb-1">
            <span className="text-[11px] font-medium">Domain Tertinggi</span>
            <Award className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-sm font-bold text-stone-900 truncate mt-1">
            {topDomain ? topDomain.name : '—'}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {topDomain ? `Skor rerata: ${topDomain.average}` : 'Menunggu data'}
          </p>
        </div>
      </div>

      {/* Line Chart Tren Potensi Siswa 30 Hari Terakhir */}
      <TalentTrendLineChart assessments={assessments} />

      {/* Rata-Rata 8 Domain ITDF */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              Profil Rerata 8 Domain Asesmen
            </h3>
            <p className="text-[11px] text-stone-600">
              Distribusi respons dari {assessments.length} asesmen yang tersimpan
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
            Skala 1.00 – 5.00
          </span>
        </div>

        {assessments.length === 0 ? (
          <div className="text-center py-8 text-stone-600 space-y-2">
            <div className="w-12 h-12 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-600">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <p className="text-xs">Belum ada asesmen yang disimpan ke database.</p>
            <button
              onClick={onStartAssessment}
              className="text-xs text-[#70263d] font-bold underline"
            >
              Mulai asesmen pertama sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            {domainAverages.map((domain, index) => {
              const pct = (domain.average / 5) * 100;
              return (
                <div key={domain.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-700 truncate max-w-[200px] sm:max-w-xs">
                      {index + 1}. {domain.name}
                    </span>
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      {domain.average > 0 ? domain.average.toFixed(2) : '—'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#70263d] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Sebaran Kelas & Alur Kerja ITDF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Sebaran Jenjang */}
        <div className="bg-white rounded-2xl border border-[#eaded8] p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Sebaran Jenjang Siswa
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(['X', 'XI', 'XII'] as const).map((grade) => {
              const count = gradeDistribution[grade];
              const pct = assessments.length > 0 ? Math.round((count / assessments.length) * 100) : 0;
              return (
                <div
                  key={grade}
                  className="p-3 rounded-xl bg-[#fcf9f7] border border-[#eaded8] text-center"
                >
                  <span className="text-[10px] font-bold text-stone-500">Kelas {grade}</span>
                  <div className="text-xl font-bold text-[#70263d] tabular-nums my-0.5">
                    {count}
                  </div>
                  <span className="text-[10px] text-stone-400">{pct}% total</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Pilar Alur ITDF */}
        <div className="bg-white rounded-2xl border border-[#eaded8] p-4 shadow-xs space-y-2.5">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Alur Implementasi ITDF
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
              <span className="font-bold text-[#70263d]">1. Discover</span>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                Eksplorasi minat &amp; aspirasi siswa.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
              <span className="font-bold text-[#70263d]">2. Assess</span>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                Refleksi 48 butir &amp; skor 8 domain.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
              <span className="font-bold text-[#70263d]">3. Validate</span>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                Diskusi bukti karya bersama guru BK.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
              <span className="font-bold text-[#70263d]">4. Develop</span>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                Target rencana karier &amp; monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aktivitas Terbaru */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              Aktivitas Asesmen Terbaru
            </h3>
            <p className="text-[11px] text-stone-600">
              Data yang baru saja masuk ke sistem
            </p>
          </div>
          <button
            onClick={onViewReports}
            className="text-xs text-[#70263d] font-bold flex items-center gap-1 hover:underline"
          >
            <span>Lihat semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAssessments.length === 0 ? (
          <p className="text-xs text-stone-600 py-4 text-center">
            Belum ada asesmen yang terekam.
          </p>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentAssessments.map((a) => (
              <div
                key={a.id}
                onClick={() => onSelectAssessment(a)}
                className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50 px-2 rounded-xl transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      {a.student_name}
                    </span>
                    <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.2 rounded">
                      {a.student_code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                    <span>Kelas {a.grade}</span>
                    <span>·</span>
                    <span className="truncate">{a.top_domain || 'Asesmen 8 Domain'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                    {a.top_score?.toFixed(2) || '—'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
