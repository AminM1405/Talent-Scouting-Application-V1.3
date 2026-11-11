import React from 'react';
import { CheckCircle2, FileDown, Eye, PlusCircle, X, Award } from 'lucide-react';
import { AssessmentRecord } from '../lib/firebase';

interface SuccessModalProps {
  assessment: AssessmentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintPdf: () => void;
  onViewReports: () => void;
  onNewAssessment: () => void;
}

export const SuccessSaveModal: React.FC<SuccessModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onPrintPdf,
  onViewReports,
  onNewAssessment
}) => {
  if (!isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">Data Berhasil Disimpan!</h3>
          <p className="text-xs text-stone-600 mt-1 max-w-xs">
            Hasil asesmen telah tersinkronisasi ke Firebase Firestore secara aman.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-[#fbf7f4] border border-[#eaded8] rounded-xl p-4 mb-5 space-y-2.5">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-[#eaded8]/60">
            <span className="text-stone-500">Nama Siswa:</span>
            <span className="font-semibold text-stone-900">{assessment.student_name}</span>
          </div>
          <div className="flex justify-between items-center text-xs pb-2 border-b border-[#eaded8]/60">
            <span className="text-stone-500">Kode Siswa:</span>
            <span className="font-mono font-medium text-[#70263d]">{assessment.student_code}</span>
          </div>
          <div className="flex justify-between items-center text-xs pb-2 border-b border-[#eaded8]/60">
            <span className="text-stone-500">Domain Teratas:</span>
            <span className="font-medium text-stone-800 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              {assessment.top_domain}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-500">Skor Rata-rata Tertinggi:</span>
            <span className="font-bold text-emerald-700">{assessment.top_score?.toFixed(2) || '—'} / 5.00</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onPrintPdf}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#70263d] hover:bg-[#591b2e] text-white font-semibold text-sm transition-colors shadow-sm active:scale-[0.99]"
          >
            <FileDown className="w-4 h-4" />
            Cetak / Ekspor PDF Resmi
          </button>

          <button
            onClick={onViewReports}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs transition-colors"
          >
            <Eye className="w-4 h-4 text-stone-600" />
            Buka Daftar Laporan Siswa
          </button>

          <button
            onClick={onNewAssessment}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-stone-500 hover:text-stone-800 font-medium text-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Mulai Asesmen Siswa Lain
          </button>
        </div>
      </div>
    </div>
  );
};
