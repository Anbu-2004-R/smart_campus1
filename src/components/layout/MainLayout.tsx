import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  CalendarDays,
  LifeBuoy,
} from 'lucide-react';

interface MainLayoutProps {
  currentView: string;
  onSelectView: (view: string) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentView,
  onSelectView,
  children,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { currentRole } = useAuth();

  const studentMobileBottomNav = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'student-results', label: 'Results', icon: GraduationCap },
    { id: 'student-timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'student-complaints', label: 'Complaints', icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={onSelectView}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          currentView={currentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto ${currentRole === 'STUDENT' ? 'pb-24 sm:pb-8' : ''}`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation for Students (Section 8.4: Below 640px) */}
      {currentRole === 'STUDENT' && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {studentMobileBottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
