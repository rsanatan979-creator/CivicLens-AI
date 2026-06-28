import { LayoutDashboard, ListTodo, BarChart3, LogOut, Megaphone, ShieldAlert, Cpu } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
  onNewBroadcast?: () => void;
}

export default function Sidebar({ currentView, setCurrentView, onLogout, onNewBroadcast }: SidebarProps) {
  return (
    <aside className="h-screen w-64 left-4 top-4 fixed bg-slate-900 text-slate-300 flex flex-col p-6 gap-6 z-40 my-4 rounded-3xl shadow-xl border border-slate-800 select-none">
      {/* Brand & Profile */}
      <div className="pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/15">
            <ShieldAlert className="w-5 h-5 text-white stroke-[2]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight leading-none">CivicLens AI</h1>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 block">Officer Command</span>
          </div>
        </div>
      </div>

      {/* Broadcast dispatch button */}
      <button 
        onClick={onNewBroadcast}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer text-xs transition-all active:scale-97"
      >
        <Megaphone className="w-4 h-4 fill-white/10" />
        <span>Push System Broadcast</span>
      </button>

      {/* Navigation tabs */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Main Control</span>
        
        <button
          onClick={() => setCurrentView('OFFICIAL_DASHBOARD')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left cursor-pointer ${
            currentView === 'OFFICIAL_DASHBOARD'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/10'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentView('OFFICIAL_COMPLAINTS')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left cursor-pointer ${
            currentView === 'OFFICIAL_COMPLAINTS'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/10'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Complaints Registry</span>
        </button>

        <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 pt-6 mb-2">Intelligence</span>

        <button
          onClick={() => setCurrentView('OFFICIAL_ANALYTICS')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left cursor-pointer ${
            currentView === 'OFFICIAL_ANALYTICS'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/10'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Live Analytics</span>
        </button>

        <button
          onClick={() => setCurrentView('OFFICIAL_PREDICTIONS')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left cursor-pointer ${
            currentView === 'OFFICIAL_PREDICTIONS'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/10'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Preempt Predictions</span>
        </button>
      </nav>

      {/* Footer exits */}
      <div className="mt-auto pt-4 border-t border-slate-800/80 space-y-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
