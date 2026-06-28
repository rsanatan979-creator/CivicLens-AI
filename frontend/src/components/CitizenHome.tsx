import { useState } from 'react';
import { MessageSquarePlus, Activity, CheckCircle2, Clock, MapPin, AlertTriangle, ChevronRight } from 'lucide-react';
import { Report, UserProfile } from '../types';
import GoogleMap from './GoogleMap';

interface CitizenHomeProps {
  user: UserProfile;
  reports: Report[];
  onTriggerReport: () => void;
  onNavigateToDetail: (reportId: string) => void;
  onNavigateToVerify: () => void;
}

export default function CitizenHome({ user, reports, onTriggerReport, onNavigateToDetail, onNavigateToVerify }: CitizenHomeProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Calculate user-specific or global counts
  const counts = {
    total: reports.length,
    inProgress: reports.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'INVESTIGATING').length,
    resolved: reports.filter((r) => r.status === 'RESOLVED').length,
    pending: reports.filter((r) => r.status === 'PENDING').length,
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-[1280px] mx-auto py-2">
      {/* Dynamic Greetings Panel */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-blue-950/10">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] -translate-y-12 translate-x-12 pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-sky-500/10 rounded-full blur-[60px] translate-y-12 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Citizen Hub</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {getGreeting()}, <span className="text-sky-300">{user.name}</span>
          </h1>
          <p className="text-slate-200 text-sm md:text-base font-medium max-w-md">
            Together, we keep our community clean, safe, and efficient. Report infrastructure issues under 30 seconds.
          </p>
          
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={onTriggerReport}
              className="px-6 py-3.5 bg-sky-400 hover:bg-sky-300 text-slate-900 font-extrabold text-sm rounded-full flex items-center gap-2 shadow-lg shadow-sky-400/25 transition-all hover:-translate-y-0.5 cursor-pointer active:translate-y-0 active:scale-98"
            >
              <MessageSquarePlus className="w-5 h-5 text-slate-900" />
              <span>Report Civic Issue</span>
            </button>
            <button
              onClick={onNavigateToVerify}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm rounded-full flex items-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-5 h-5 text-sky-300" />
              <span>Verify Community Reports</span>
            </button>
          </div>
        </div>
      </section>

      {/* Global & Private Status Dashboard KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Filed */}
        <div className="bg-white/60 border border-slate-200/40 backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200/10">
            <Activity className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Reported</span>
            <span className="text-2xl font-extrabold text-slate-800 block">{counts.total}</span>
          </div>
        </div>

        {/* Pending Action */}
        <div className="bg-white/60 border border-slate-200/40 backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Awaiting Action</span>
            <span className="text-2xl font-extrabold text-amber-600 block">{counts.pending}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white/60 border border-slate-200/40 backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">In Progress</span>
            <span className="text-2xl font-extrabold text-blue-600 block">{counts.inProgress}</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white/60 border border-slate-200/40 backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Resolved Tickets</span>
            <span className="text-2xl font-extrabold text-green-600 block">{counts.resolved}</span>
          </div>
        </div>
      </section>

      {/* Community Feed / Recent complaints list (Screen 8) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200/40 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Community Complaints</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time reports submitted by community residents.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-full p-1 flex shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Map
              </button>
            </div>

            <button
              onClick={onTriggerReport}
              className="text-xs font-bold text-blue-600 uppercase hover:underline flex items-center gap-1 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:bg-slate-50 cursor-pointer animate-fade-in"
            >
              Create Report
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="h-[480px] w-full rounded-3xl overflow-hidden border border-slate-200/50 shadow-md">
            <GoogleMap
              center={reports.length > 0 ? { lat: reports[0].latitude, lng: reports[0].longitude } : { lat: 40.7128, lng: -74.0060 }}
              zoom={12}
              markers={reports.map((r) => ({
                id: r.id,
                lat: r.latitude,
                lng: r.longitude,
                title: r.title,
                category: r.category,
                severity: r.severity,
                status: r.status,
              }))}
              onMarkerClick={(id) => onNavigateToDetail(id)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <article
                key={report.id}
                onClick={() => onNavigateToDetail(report.id)}
                className="bg-white/60 border border-slate-200/40 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`backdrop-blur-md font-bold text-[10px] px-2.5 py-1.5 rounded-full border shadow-sm flex items-center gap-1 ${
                      report.severity === 'CRITICAL' || report.severity === 'HIGH'
                        ? 'bg-red-500/10 border-red-500/30 text-red-700 font-extrabold'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-700'
                    }`}>
                      <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                      {report.severity}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-500 font-bold text-[10px] px-2.5 py-1.5 rounded-full border border-slate-100 shadow-sm">
                      {report.id}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {report.title}
                    </h3>
                    <p className="text-slate-500 text-xs mb-4 flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {report.locationName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                      report.status === 'RESOLVED'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : report.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {report.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {report.upvotes} upvotes
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
