import React from 'react';
import { Database, Plus } from 'lucide-react';

interface MobileHeaderProps {
  activeTab: string;
  studentCount: number;
  assessmentCount: number;
  onNewAssessment: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  onNewAssessment
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Ringkasan & Statistik';
      case 'assessment':
        return 'Asesmen 8 Domain';
      case 'students':
        return 'Data Siswa Terdaftar';
      case 'reports':
        return 'Hasil & Laporan Asesmen';
      case 'guide':
        return 'Panduan & Validasi';
      default:
        return 'Talent Discovery';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#eaded8] px-4 py-2.5 transition-colors no-print">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#70263d] text-[#fff8ee] flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            T
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-[#2c2225] truncate">
                ITDF Mobile
              </h1>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-[#f3e6e0] text-[#70263d]">
                v1.2
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium truncate">
              {getTabTitle(activeTab)}
            </p>
          </div>
        </div>

        {/* Right Action & Cloud Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firestore Aktif</span>
          </div>

          <button
            onClick={onNewAssessment}
            className="flex items-center gap-1.5 bg-[#70263d] hover:bg-[#591b2e] text-white text-xs font-semibold py-1.5 px-3 rounded-xl transition-all shadow-xs active:scale-95"
            title="Mulai asesmen baru"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline">Asesmen Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
