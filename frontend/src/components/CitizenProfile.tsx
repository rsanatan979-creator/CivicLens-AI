import { useState } from 'react';
import { Mail, Award, CheckCircle2, Activity, LogOut, Settings, X, Bell, MapPin } from 'lucide-react';
import { UserProfile } from '../types';

interface CitizenProfileProps {
  user: UserProfile;
  reportsCount: number;
  onUpdateName: (newName: string) => void;
  onLogout: () => void;
}

export default function CitizenProfile({ user, reportsCount, onUpdateName, onLogout }: CitizenProfileProps) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const saveName = () => {
    onUpdateName(tempName);
    setEditingName(false);
  };

  const getRank = (pts: number) => {
    if (pts >= 300) return 'City Sentinel (Elite)';
    if (pts >= 150) return 'Civic Champion';
    return 'Community Hero';
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-[1280px] mx-auto py-2">
      {/* Profile Overview Card */}
      <section className="bg-white/70 backdrop-blur-md border border-slate-200/50 p-8 rounded-3xl shadow-xl shadow-blue-900/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-100/30 rounded-full blur-[80px] -translate-y-12 translate-x-12 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-blue-100 shrink-0">
            <img src={user.avatarUrl} alt="User Profile" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-3 flex-1 text-center md:text-left">
            <div>
              {editingName ? (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-lg text-slate-800"
                  />
                  <button
                    onClick={saveName}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setTempName(user.name); setEditingName(false); }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user.name}</h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="text-slate-500 text-sm font-semibold flex items-center justify-center md:justify-start gap-1.5 mt-1">
                <Mail className="w-4 h-4 text-slate-400" />
                {user.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1 rounded-full text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                {getRank(user.points)}
              </span>
              <span className="text-slate-400 text-xs font-semibold">
                Member since {user.joinedAt}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Contribution Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verification Points */}
        <div className="bg-white/60 border border-slate-200/40 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Verification XP</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-4xl font-black text-slate-800 block">{user.points}</span>
            <span className="text-xs text-slate-500 font-semibold block">Contribution Points Earned</span>
          </div>
        </div>

        {/* Reports Submitted */}
        <div className="bg-white/60 border border-slate-200/40 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">My Reports</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-4xl font-black text-slate-800 block">{reportsCount}</span>
            <span className="text-xs text-slate-500 font-semibold block">Total Issues Logged</span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white/60 border border-slate-200/40 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Trust Score</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-4xl font-black text-slate-800 block">99.2%</span>
            <span className="text-xs text-slate-500 font-semibold block">Community Accuracy Level</span>
          </div>
        </div>
      </section>

      {/* Account Settings / Actions */}
      <section className="bg-white/60 border border-slate-200/40 backdrop-blur-md rounded-3xl p-6 shadow-sm divide-y divide-slate-100">
        <div className="pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl">
              <Settings className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 block">System Settings</span>
              <span className="text-xs text-slate-500 font-medium block">Manage push notifications and location access settings.</span>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Manage
          </button>
        </div>

        <div className="pt-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 block">Sign Out</span>
              <span className="text-xs text-slate-500 font-medium block">Terminate active session safely.</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </section>

      {/* System Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-6 text-left">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer animate-fade-in"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Settings className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">System Settings</h3>
                <p className="text-slate-500 text-xs font-medium">Configure application preferences</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Push Notifications Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Push Notifications</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Receive instant ticket updates</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    pushNotifications ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      pushNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Location Access Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Location Services</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Auto-detect report coordinates</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLocationAccess(!locationAccess)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    locationAccess ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      locationAccess ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Email Alerts Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Email Alerts</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Weekly neighborhood summaries</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    emailAlerts ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      emailAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
