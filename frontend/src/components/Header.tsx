import { Bell, Sparkles, Building2, Home, PlusCircle, CheckCircle2, UserCircle } from 'lucide-react';
import { View, UserProfile } from '../types';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  user: UserProfile | null;
}

export default function Header({ currentView, setCurrentView, user }: HeaderProps) {
  if (!user) return null;

  return (
    <header id="top-app-bar" className="bg-white/85 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40 shadow-sm transition-all select-none">
      <div className="flex justify-between items-center w-full px-4 md:px-16 py-4 max-w-[1280px] mx-auto">
        {/* Brand */}
        <div 
          onClick={() => setCurrentView('CITIZEN_HOME')} 
          className="text-2xl font-bold text-blue-600 flex items-center gap-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
        >
          <Building2 className="w-6 h-6 stroke-[2.5] text-blue-600 fill-blue-100" />
          <span className="tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent font-black">CivicLens AI</span>
        </div>

        {/* Navigation Links for Desktop */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setCurrentView('CITIZEN_HOME')}
            className={`font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'CITIZEN_HOME' 
                ? 'text-blue-700 bg-blue-50 border border-blue-100/50 shadow-sm shadow-blue-500/5' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('CITIZEN_REPORT')}
            className={`font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'CITIZEN_REPORT' 
                ? 'text-blue-700 bg-blue-50 border border-blue-100/50 shadow-sm shadow-blue-500/5' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue</span>
          </button>

          <button
            onClick={() => setCurrentView('CITIZEN_VERIFY')}
            className={`font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'CITIZEN_VERIFY' 
                ? 'text-blue-700 bg-blue-50 border border-blue-100/50 shadow-sm shadow-blue-500/5' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify Feed</span>
          </button>

          <button
            onClick={() => setCurrentView('CITIZEN_PROFILE')}
            className={`font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'CITIZEN_PROFILE' 
                ? 'text-blue-700 bg-blue-50 border border-blue-100/50 shadow-sm shadow-blue-500/5' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <UserCircle className="w-4 h-4" />
            <span>My Profile</span>
          </button>
        </nav>

        {/* Trailing Icons */}
        <div className="flex items-center gap-4 text-blue-600">
          <div className="hidden sm:flex items-center gap-1.5 bg-blue-50/60 border border-blue-100/50 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black text-blue-700 tracking-wider uppercase">{user.points} XP</span>
          </div>

          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer group active:scale-90">
            <Bell className="w-5 h-5 text-blue-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full group-hover:scale-125 transition-transform animate-pulse"></span>
          </button>
          
          <button 
            onClick={() => setCurrentView('CITIZEN_PROFILE')}
            className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all active:scale-90 shrink-0"
          >
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </header>
  );
}
