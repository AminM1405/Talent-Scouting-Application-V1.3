import React from 'react';
import { X, Printer, Calendar, Award, GraduationCap, Building2, CheckCircle, FileText } from 'lucide-react';
import { AssessmentRecord } from '../lib/firebase';
import { DOMAINS, getScoreInterpretation } from '../data/domains';

interface ReportDetailModalProps {
  assessment: AssessmentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (assessment: AssessmentRecord) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onPrint
}) => {
  if (!isOpen || !assessment) return null;

  const formattedDate = assessment.created_at
    ? new Date(assessment.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#eaded8] flex items-center justify-between bg-[#fcf9f7]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#70263d]">
              Laporan Profil Individual
            </span>
            <h3 className="text-base font-bold text-stone-900 mt-0.5">
              {assessment.student_name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Biodata Box */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
            <div>
              <span className="text-stone-400 block text-[10px]">Kode Siswa</span>
              <span className="font-mono font-bold text-stone-800">{assessment.student_code}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Jenjang Kelas</span>
              <span className="font-semibold text-stone-800">Kelas {assessment.grade || '—'}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Sekolah</span>
              <span className="font-medium text-stone-800 truncate block">
                {assessment.school || '—'}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Tanggal Asesmen</span>
              <span className="font-medium text-stone-800">{formattedDate}</span>
            </div>
          </div>

          {/* Aspirasi jika ada */}
          {assessment.aspiration && (
            <div className="p-3 rounded-xl bg-[#fdfbf9] border border-[#eaded8]">
              <span className="text-[10px] font-bold text-[#70263d] uppercase tracking-wider block mb-0.5">
                Aspirasi Siswa
              </span>
              <p className="text-stone-700 leading-relaxed">{assessment.aspiration}</p>
            </div>
          )}

          {/* Skor 8 Domain */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Peta Skor 8 Domain ITDF
            </h4>

            <div className="space-y-2">
              {DOMAINS.map((domain, index) => {
                const score = assessment.scores?.[domain.key] || 0;
                const interp = getScoreInterpretation(score);
                const pct = (score / 5) * 100;

                return (
                  <div
                    key={domain.key}
                    className="p-2.5 rounded-xl border border-stone-100 bg-stone-50/70 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-800 truncate max-w-[200px]">
                        {index + 1}. {domain.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${interp.badgeClass}`}>
                          {interp.label}
                        </span>
                        <span className="font-mono font-bold text-stone-900">
                          {score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#70263d]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rekomendasi 3 Domain Teratas */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              Prioritas Eksplorasi Awal
            </h4>

            <div className="space-y-2">
              {DOMAINS.map((d) => ({
                domain: d,
                score: assessment.scores?.[d.key] || 0
              }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((item, idx) => (
                  <div
                    key={item.domain.key}
                    className="p-3 rounded-xl bg-[#fdfbf9] border border-[#eaded8] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">
                        {idx + 1}. {item.domain.name}
                      </span>
                      <span className="font-mono font-bold text-[#70263d]">
                        {item.score.toFixed(2)} / 5
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      <b>Saran:</b> {item.domain.tips[0]}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#eaded8] bg-[#fcf9f7] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-100"
          >
            Tutup
          </button>

          <button
            onClick={() => onPrint(assessment)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#70263d] hover:bg-[#591b2e] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Ekspor PDF Resmi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
