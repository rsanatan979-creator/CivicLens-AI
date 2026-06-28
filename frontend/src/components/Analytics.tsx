import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, MapPin, BarChart3, LineChart as ChartIcon, Terminal, AlertTriangle, TrendingUp, Cpu, Sliders, Check } from 'lucide-react';
import { AIInsight, LogEntry } from '../types';
import { AnalyticsService } from '../services/analytics.service';
import { axiosClient } from '../api/axiosClient';

export default function Analytics() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'drainage' | 'roadways'>('all');
  const [updating, setUpdating] = useState(false);
  const [appliedSuggestion, setAppliedSuggestion] = useState(false);

  // Fetch real system logs from DB
  const logsQuery = useQuery({
    queryKey: ['system-logs'],
    queryFn: async (): Promise<LogEntry[]> => axiosClient.get('/logs'),
    refetchInterval: 4000,
  });

  // Fetch real categories distribution from DB
  const categoriesQuery = useQuery({
    queryKey: ['analytics-categories'],
    queryFn: AnalyticsService.getCategories,
  });

  // Fetch real resolution stats from DB
  const resolutionQuery = useQuery({
    queryKey: ['analytics-resolution'],
    queryFn: AnalyticsService.getResolution,
  });

  const [localLogs, setLocalLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (logsQuery.data) {
      setLocalLogs(logsQuery.data);
    }
  }, [logsQuery.data]);

  const logs = localLogs;

  const categoryData = categoriesQuery.data || [];
  const getCount = (catName: string) => {
    const found = categoryData.find(c => c.name.toLowerCase().includes(catName.toLowerCase()));
    return found ? found.value : 0;
  };
  const roadCount = getCount('Road') || getCount('Pothole') || 0;
  const waterCount = getCount('Water') || 0;
  const lightCount = getCount('Streetlight') || getCount('Light') || 0;
  const trashCount = getCount('Garbage') || getCount('Trash') || 0;
  const maxVal = Math.max(roadCount, waterCount, lightCount, trashCount, 1);

  const resolutionData = resolutionQuery.data || { resolvedCount: 0, totalCount: 0, rate: 0 };

  const insights = useMemo<AIInsight[]>(() => {
    const list: AIInsight[] = [];
    if (roadCount > 0) {
      list.push({
        id: 'in-1',
        title: 'Trend Analysis: Road Damage',
        description: `Active sub-surface road anomalies detected. ${roadCount} reports currently logged.`,
        type: 'trend',
        priority: 'medium',
      });
    }
    if (lightCount > 0) {
      list.push({
        id: 'in-2',
        title: 'Utility Grid Anomaly',
        description: `Streetlight outage reports stand at ${lightCount} active cases. Group dispatch recommended.`,
        type: 'anomaly',
        priority: 'low',
      });
    }
    if (resolutionData.totalCount > resolutionData.resolvedCount) {
      const pending = resolutionData.totalCount - resolutionData.resolvedCount;
      list.push({
        id: 'in-3',
        title: 'Hotspot Alert: Dispatch Backlog',
        description: `${pending} pending community tickets awaiting operator dispatch.`,
        type: 'alert',
        priority: pending > 5 ? 'high' : 'medium',
      });
    }
    return list;
  }, [roadCount, lightCount, resolutionData]);

  const triggerUpdate = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      logsQuery.refetch();
      categoriesQuery.refetch();
      resolutionQuery.refetch();
    }, 1000);
  };

  const applySuggestion = () => {
    setAppliedSuggestion(true);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const logText = '[AI] APPLIED SUGGESTION: Crew schedules re-routed for Sector 4';
    
    setLocalLogs(prev => [
      ...prev,
      { id: String(prev.length + 1), text: logText, type: 'AI', timestamp: timeStr }
    ].slice(-15));

    axiosClient.post('/logs', { text: logText, type: 'AI' })
      .catch(e => console.error('Failed to log suggestion to backend', e));

    setTimeout(() => setAppliedSuggestion(false), 3000);
  };

  // Simulated heatmap overlays based on active state
  const heatmapConfig = useMemo(() => {
    switch (activeFilter) {
      case 'drainage':
        return {
          title: 'Storm Drainage Anomaly Density',
          color: 'from-cyan-500',
          dots: [
            { id: 1, lat: '40.7180° N', lng: '74.0090° W', count: '18 Drainage Reports', style: { top: '25%', left: '42%' } },
            { id: 2, lat: '40.7150° N', lng: '74.0030° W', count: '9 Clogged Pipes', style: { top: '55%', left: '68%' } }
          ]
        };
      case 'roadways':
        return {
          title: 'Road Asphalt Cavity Heatmap',
          color: 'from-amber-500',
          dots: [
            { id: 1, lat: '40.7128° N', lng: '74.0060° W', count: '14 Severe Potholes', style: { top: '40%', left: '28%' } },
            { id: 2, lat: '40.7132° N', lng: '74.0080° W', count: '22 Cracked Lanes', style: { top: '65%', left: '18%' } }
          ]
        };
      default:
        return {
          title: 'General Civic Infrastructure Heatmap',
          color: 'from-red-500',
          dots: [
            { id: 1, lat: '40.7128° N', lng: '74.0060° W', count: '14 Active Reports', style: { top: '35%', left: '25%' } },
            { id: 2, lat: '40.7150° N', lng: '74.0030° W', count: '6 Traffic Outages', style: { top: '55%', left: '60%' } },
            { id: 3, lat: '40.7180° N', lng: '74.0090° W', count: '12 Damage Clusters', style: { top: '20%', left: '45%' } }
          ]
        };
    }
  }, [activeFilter]);

  return (
    <div className="space-y-8 py-2 animate-fade-in max-w-[1280px] mx-auto">
      
      {/* Header for Main Content */}
      <header className="h-16 border-b border-slate-200/50 flex items-center shrink-0 justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-950 tracking-tight">Predictive Analytics &amp; Monitoring</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time infrastructure health and AI insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={triggerUpdate}
            className={`p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200/40 bg-white ${updating ? 'animate-spin' : ''}`}
            title="Refresh matrices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            Last updated: Just now
          </div>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 relative z-0">
        
        {/* Left Column (Interactive Heatmap & Graphs) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Main View: Interactive Heatmap Card */}
          <div className="flex-1 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/30 shadow-md overflow-hidden flex flex-col min-h-[420px]">
            <div className="p-4 border-b border-slate-200/40 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-600" />
                {heatmapConfig.title}
              </h2>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeFilter === 'all' 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All Issues
                </button>
                <button 
                  onClick={() => setActiveFilter('drainage')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeFilter === 'drainage' 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Drainage Anomaly
                </button>
                <button 
                  onClick={() => setActiveFilter('roadways')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeFilter === 'roadways' 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Roadways Damaged
                </button>
              </div>
            </div>

            {/* Heatmap Satellite Background Container */}
            <div className="flex-1 relative bg-slate-200 min-h-[300px]">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter saturate-110 brightness-101" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnd-4_DXOTyX1wcjkERjjK2naeAFVafbGGUvTTfBaLxeyEYpvbFnBQxh9m9cNWbNI8a2NPxaK_BV2OLOFjTzi9lBZSNETMbhgVh28XKo7KRwvOGp175PaK-FXz9eRVkbwwjPD0iYuWFj9IkEkcugWJXgdrKn2FFWXC6KJqDXKjNAgdvhc6N3Tq2ynMKa0e_2tYCrWegYkSqMOyTj8Xk8yYc5yaq4fKMYyHHOLLmEzHqS1mKJwXtkUAZrrdWycFjRastoz4Dy8OcQk')` }}
              ></div>
              
              {/* Floating Legend Overlay */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200/50 p-4 rounded-2xl shadow-lg text-xs space-y-2 font-bold text-slate-700">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-2">Simulated Heat Index</span>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-500/50 animate-pulse"></span> High Density Zone</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-md shadow-amber-500/50"></span> Moderate Alert</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/50"></span> Monitoring</div>
              </div>

              {/* Dynamic Interactive Hotspot Clusters */}
              {heatmapConfig.dots.map((dot) => (
                <div 
                  key={dot.id} 
                  className="absolute group z-10 transition-all duration-500" 
                  style={dot.style}
                >
                  <div className="w-12 h-12 rounded-full bg-red-500/20 animate-ping absolute -top-4 -left-4 pointer-events-none"></div>
                  <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-lg shadow-red-500/80 cursor-pointer flex items-center justify-center font-bold text-[10px] text-white">
                    {dot.id}
                  </div>
                  
                  {/* Styled Floating Tooltip Card */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white text-xs px-3 py-2 rounded-xl border border-slate-800 shadow-2xl pointer-events-none whitespace-nowrap opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                    <p className="font-extrabold text-red-400">{dot.count}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{dot.lat}, {dot.lng}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lower Section: Custom Grid Trend Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
            
            {/* Chart 1: Issues by Category */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/30 p-6 shadow-md">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Issues by Category (Weekly Volume)</h3>
              </div>
              
              <div className="h-44 flex items-end justify-between gap-6 px-2">
                {/* Dynamic Bar Charts based on DB state */}
                <div className="w-full flex flex-col justify-end items-center group relative h-full">
                  <div className="absolute top-0 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{roadCount}</div>
                  <div 
                    style={{ height: `${(roadCount / maxVal) * 85}%` }} 
                    className="w-10 bg-blue-600 rounded-t-xl group-hover:bg-blue-500 transition-all shadow-md shadow-blue-500/20 group-hover:scale-102"
                  ></div>
                  <span className="text-[11px] font-bold text-slate-500 mt-2">Road</span>
                </div>

                <div className="w-full flex flex-col justify-end items-center group relative h-full">
                  <div className="absolute top-0 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{waterCount}</div>
                  <div 
                    style={{ height: `${(waterCount / maxVal) * 85}%` }} 
                    className="w-10 bg-slate-400 rounded-t-xl group-hover:bg-slate-500 transition-all shadow-md shadow-slate-400/20 group-hover:scale-102"
                  ></div>
                  <span className="text-[11px] font-bold text-slate-500 mt-2">Water</span>
                </div>

                <div className="w-full flex flex-col justify-end items-center group relative h-full">
                  <div className="absolute top-0 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{lightCount}</div>
                  <div 
                    style={{ height: `${(lightCount / maxVal) * 85}%` }} 
                    className="w-10 bg-indigo-500 rounded-t-xl group-hover:bg-indigo-400 transition-all shadow-md shadow-indigo-500/20 group-hover:scale-102"
                  ></div>
                  <span className="text-[11px] font-bold text-slate-500 mt-2">Light</span>
                </div>

                <div className="w-full flex flex-col justify-end items-center group relative h-full">
                  <div className="absolute top-0 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{trashCount}</div>
                  <div 
                    style={{ height: `${(trashCount / maxVal) * 85}%` }} 
                    className="w-10 bg-blue-400 rounded-t-xl group-hover:bg-blue-300 transition-all shadow-md shadow-blue-400/20 group-hover:scale-102"
                  ></div>
                  <span className="text-[11px] font-bold text-slate-500 mt-2">Trash</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Monthly Resolution Line Curve */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/30 p-6 shadow-md">
              <div className="flex items-center gap-2 mb-6">
                <ChartIcon className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Monthly Dispatch Resolution Rate</h3>
              </div>

              <div className="h-44 relative flex items-center justify-center">
                {/* Placeholder beautiful Line Chart with SVG curve */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/10 to-blue-500/5 rounded-2xl border-b-2 border-l-2 border-slate-200 p-2 flex items-end">
                  <svg className="w-full h-full text-blue-600 drop-shadow-[0_4px_8px_rgba(0,102,255,0.25)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path 
                      d="M0,85 Q20,75 40,50 T80,32 T100,12" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeLinecap="round" 
                      strokeWidth="4"
                      className="animate-pulse"
                    ></path>
                    {/* SVG Gradient Area fill under curve */}
                    <path 
                      d="M0,85 Q20,75 40,50 T80,32 T100,12 L100,100 L0,100 Z" 
                      fill="url(#gradient-area)"
                      opacity="0.1"
                    ></path>
                    <defs>
                      <linearGradient id="gradient-area" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0050cb" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Growth indicator badge */}
                <div className="absolute top-4 right-4 text-2xl font-black text-blue-600 drop-shadow-sm flex items-center gap-1">
                  {resolutionData.rate}%
                  <TrendingUp className="w-6 h-6 stroke-[3]" />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar: AI Insights & Real-time Live Log Console */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/30 rounded-2xl p-4 flex items-center gap-2 shadow-sm shrink-0">
            <Cpu className="w-5 h-5 text-blue-600 animate-pulse" />
            <h2 className="text-base font-bold text-slate-800">Department AI Insights</h2>
          </div>

          {/* AI Insight Cards */}
          <div className="space-y-4 flex-1 overflow-y-auto">
            {insights.map((insight) => (
              <div 
                key={insight.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${
                  insight.type === 'alert' 
                    ? 'border-red-200 border-l-4 border-l-red-500' 
                    : 'border-slate-200 border-l-4 border-l-blue-500'
                }`}
              >
                {insight.type === 'alert' && (
                  <div className="absolute top-0 right-0 py-1 px-3 bg-red-100 text-red-700 rounded-bl-xl text-[9px] font-bold uppercase tracking-wider">
                    High Alert
                  </div>
                )}
                
                <div className="flex items-start gap-3 mt-1">
                  {insight.type === 'alert' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <Cpu className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">{insight.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">{insight.description}</p>
                    
                    {insight.type === 'anomaly' && (
                      <div className="pt-3">
                        <button 
                          onClick={applySuggestion}
                          disabled={appliedSuggestion}
                          className="px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold rounded-xl border border-blue-100 shadow-sm transition-all active:scale-95 disabled:opacity-75 flex items-center gap-1 cursor-pointer"
                        >
                          {appliedSuggestion ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              <span>Applied Optimal Route</span>
                            </>
                          ) : (
                            <>
                              <Sliders className="w-3 h-3 text-blue-600" />
                              <span>Apply Dispatch Solution</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Log Stream Terminal mini */}
          <div className="pt-4 border-t border-slate-200/50">
            <div className="flex justify-between items-center mb-2 px-1">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                Live System Logs
              </h4>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            </div>
            
            <div className="bg-slate-900/95 backdrop-blur text-slate-200 rounded-2xl p-4 font-mono text-[11px] leading-relaxed shadow-inner h-44 overflow-y-auto space-y-1 scroll-smooth select-all">
              {logs.map((log) => (
                <div key={log.id} className="hover:bg-slate-800 px-1 py-0.5 rounded transition-colors flex items-start gap-1">
                  <span className="text-slate-500 text-[10px] select-none">{log.timestamp}</span>
                  <span className={
                    log.type === 'SYS' ? 'text-blue-400' :
                    log.type === 'AI' ? 'text-green-400' :
                    log.type === 'WARN' ? 'text-red-400 font-bold' : 'text-slate-300'
                  }>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
