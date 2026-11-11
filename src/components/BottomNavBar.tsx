import React from 'react';
import { LayoutDashboard, ClipboardCheck, Users, FileSpreadsheet, BookOpen } from 'lucide-react';

export type NavigationTab = 'dashboard' | 'assessment' | 'students' | 'reports' | 'guide';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  studentCount: number;
  assessmentCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  studentCount,
  assessmentCount
}) => {
  const tabs = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Ringkasan',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'assessment' as NavigationTab,
      label: 'Asesmen',
      icon: ClipboardCheck,
      badge: null
    },
    {
      id: 'students' as NavigationTab,
      label: 'Siswa',
      icon: Users,
      badge: studentCount > 0 ? studentCount : null
    },
    {
      id: 'reports' as NavigationTab,
      label: 'Hasil',
      icon: FileSpreadsheet,
      badge: assessmentCount > 0 ? assessmentCount : null
    },
    {
      id: 'guide' as NavigationTab,
      label: 'Panduan',
      icon: BookOpen,
      badge: null
    }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#eaded8] shadow-[0_-4px_16px_rgba(44,34,37,0.06)] no-print pb-safe"
      role="navigation"
      aria-label="Navigasi Utama"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full w-full relative transition-all duration-150 touch-manipulation min-h-[44px] ${
                isActive
                  ? 'text-[#70263d] font-bold'
                  : 'text-stone-600 hover:text-stone-900 font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#f3e6e0] scale-110' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>

                {tab.badge !== null && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-[#70263d] text-white tabular-nums border border-white">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {tab.label}
              </span>

              {/* Active Dot */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#70263d] mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
