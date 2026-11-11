import {
  LayoutDashboard,
  PlusCircle,
  TableProperties,
  Compass,
  Database,
  BookOpen,
  Settings,
  LogOut
} from 'lucide-react';
import { HospitalProfile } from '../types';

export type NavViewKey = 'dashboard' | 'input' | 'data' | 'explorer' | 'database' | 'guide' | 'settings';

interface SidebarProps {
  currentView: NavViewKey;
  onSelectView: (view: NavViewKey) => void;
  recordCount: number;
  yearCount: number;
  catalogCount?: number;
  profile: HospitalProfile;
  currentUser: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  recordCount,
  yearCount,
  catalogCount,
  profile,
  currentUser,
  onLogout
}) => {
  const navItems: { key: NavViewKey; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      key: 'dashboard',
      label: 'Dashboard Grafik',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />
    },
    {
      key: 'input',
      label: 'Input Data Risiko',
      icon: <PlusCircle className="w-4 h-4 shrink-0" />
    },
    {
      key: 'data',
      label: 'Data & Excel',
      icon: <TableProperties className="w-4 h-4 shrink-0" />
    },
    {
      key: 'explorer',
      label: 'Explorer Data',
      icon: <Compass className="w-4 h-4 shrink-0 text-amber-300" />,
      badge: 'Baru'
    },
    {
      key: 'database',
      label: 'Database Sub & Risiko',
      icon: <Database className="w-4 h-4 shrink-0 text-teal-300" />,
      badge: catalogCount
    },
    {
      key: 'guide',
      label: 'Panduan Skor',
      icon: <BookOpen className="w-4 h-4 shrink-0" />
    },
    {
      key: 'settings',
      label: 'Pengaturan & Backup',
      icon: <Settings className="w-4 h-4 shrink-0" />
    }
  ];

  return (
    <aside className="w-64 bg-[#0f4c5c] text-white flex flex-col shrink-0 min-h-screen border-r border-[#0d404e] select-none no-print">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#0f4c5c] font-black flex items-center justify-center text-sm shadow-md tracking-wider">
            ICRA
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm tracking-tight truncate leading-tight text-white">
              Siloam Hospitals
            </h1>
            <p className="text-[11px] text-teal-200/80 truncate">
              Komite PPI &bull; Offline
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map(item => {
          const isActive = currentView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectView(item.key)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-white text-[#0f4c5c] shadow-sm font-bold scale-[1.01]'
                  : 'text-teal-100/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="truncate flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-[#0f4c5c]/10 text-[#0f4c5c]'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Footer */}
      <div className="p-4 border-t border-white/10 bg-[#0c3f4c]/60 text-xs text-teal-100/80 space-y-3">
        {/* Active user badge */}
        <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl">
          <div className="overflow-hidden">
            <div className="text-[10px] text-teal-300 font-semibold uppercase">Pengguna Aktif</div>
            <div className="font-bold text-white truncate text-xs">{currentUser} (Komite PPI)</div>
          </div>
          <button
            onClick={() => {
              if (confirm('Keluar dari aplikasi?')) {
                onLogout();
              }
            }}
            title="Keluar"
            className="p-1.5 hover:bg-white/20 text-teal-200 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Database status */}
        <div className="text-[11px] leading-relaxed pt-1">
          <div className="flex items-center gap-1.5 text-white/90 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span>Database Komputer Ini</span>
          </div>
          <p className="text-teal-200/70 text-[10px] mt-0.5">
            {recordCount} item risiko &bull; {yearCount} tahun penilaian
          </p>
        </div>
      </div>
    </aside>
  );
};
