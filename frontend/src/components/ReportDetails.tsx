import { useState } from 'react';
import { ChevronRight, MapPin, ThumbsUp, Layers, CheckCircle2, AlertTriangle, Users, Compass, Clock, Check } from 'lucide-react';
import { Report, Severity, Status } from '../types';
import GoogleMap from './GoogleMap';

interface ReportDetailsProps {
  report: Report;
  onUpdateReportStatus: (reportId: string, status: Status) => void;
  onIncrementUpvotes: (reportId: string) => void;
  onBackToHome: () => void;
}

export default function ReportDetails({ report, onUpdateReportStatus, onIncrementUpvotes, onBackToHome }: ReportDetailsProps) {
  const [userVerified, setUserVerified] = useState(false);
  const [activeAction, setActiveAction] = useState<'none' | 'valid' | 'duplicate' | 'resolved'>('none');
  const [copiedCoords, setCopiedCoords] = useState(false);

  const handleValidClick = () => {
    if (!userVerified) {
      onIncrementUpvotes(report.id);
      setUserVerified(true);
      setActiveAction('valid');
      
      // Update status if it was pending
      if (report.status === 'PENDING') {
        onUpdateReportStatus(report.id, 'INVESTIGATING');
      }
    } else {
      setUserVerified(false);
      setActiveAction('none');
    }
  };

  const handleActionClick = (action: 'duplicate' | 'resolved', newStatus: Status) => {
    setActiveAction(action);
    onUpdateReportStatus(report.id, newStatus);
  };

  const copyCoordsToClipboard = () => {
    navigator.clipboard.writeText(`${report.latitude.toFixed(4)} N, ${report.longitude.toFixed(4)} W`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Helper colors for severity
  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-[1280px] mx-auto animate-fade-in">
      {/* Breadcrumbs Nav */}
      <nav aria-label="Breadcrumb" className="flex text-slate-500 font-semibold text-xs">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 bg-white/40 border border-slate-200/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <li className="inline-flex items-center">
            <button onClick={onBackToHome} className="hover:text-blue-600 transition-colors cursor-pointer font-bold">
              Home
            </button>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1" />
            <span className="text-slate-400">My Reports</span>
          </li>
          <li aria-current="page" className="flex items-center">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1" />
            <span className="text-blue-600 font-bold">{report.id}</span>
          </li>
        </ol>
      </nav>

      {/* Main Grid: Details Area & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Issue Header Title block */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight leading-tight">
              {report.title}
            </h1>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Reported on {report.reportedAt || (report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'recently')}
            </p>
          </div>

          {/* Large main uploaded photo */}
          <div className="rounded-3xl overflow-hidden border border-slate-200/40 bg-slate-100 shadow-lg shadow-blue-900/5 aspect-[4/3] max-h-[480px]">
            <img 
              alt={report.title} 
              className="w-full h-full object-cover select-none"
              src={report.imageUrl} 
            />
          </div>

          {/* Community Verification Actions panel (Glass style) */}
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/30 shadow-md flex flex-col sm:flex-row gap-6 items-center justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100/40 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex items-center gap-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-100/50 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Community Verification</h3>
                <p className="text-slate-500 text-sm mt-0.5">Help confirm this report to prioritize fixing.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full sm:w-auto z-10">
              <button 
                onClick={handleValidClick}
                className={`flex-1 sm:flex-none font-bold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-sm ${
                  userVerified || activeAction === 'valid'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[0.98]'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${userVerified ? 'fill-white' : ''}`} />
                <span>{userVerified ? `Valid (${report.upvotes})` : 'Valid'}</span>
              </button>

              <button 
                onClick={() => handleActionClick('duplicate', 'QUEUED')}
                className={`flex-1 sm:flex-none font-semibold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm border cursor-pointer shadow-sm ${
                  activeAction === 'duplicate'
                    ? 'bg-amber-600 text-white border-amber-500 scale-[0.98]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Duplicate</span>
              </button>

              <button 
                onClick={() => handleActionClick('resolved', 'RESOLVED')}
                className={`flex-1 sm:flex-none font-semibold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm border cursor-pointer shadow-sm ${
                  activeAction === 'resolved'
                    ? 'bg-green-600 text-white border-green-500 scale-[0.98]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolved</span>
              </button>
            </div>
          </div>

          {/* Status Timeline History log */}
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/30 shadow-md relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">
              Status History
            </h3>
            
            <div className="relative border-l-2 border-blue-100 ml-4 space-y-10">
              {report.timeline.map((item, index) => {
                const isCurrent = index === 0;
                return (
                  <div key={item.id} className={`relative pl-8 ${!isCurrent ? 'opacity-70 hover:opacity-100 transition-opacity' : ''}`}>
                    {/* Pulsing ring for current item */}
                    {isCurrent ? (
                      <span className="absolute -left-[13px] top-1 w-6 h-6 rounded-full bg-blue-600 ring-4 ring-blue-100 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                      </span>
                    ) : (
                      <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white shadow-sm"></span>
                    )}

                    <h4 className={`text-base font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-800'}`}>
                      {item.status}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <span className={`font-mono text-[10px] mt-2 inline-block px-2 py-1 rounded-md border font-semibold ${
                      isCurrent 
                        ? 'bg-blue-50 border-blue-100 text-blue-600' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      {item.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sidebar Cards Area (1/3 width) */}
        <div className="space-y-8">
          
          {/* Metadata Card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/30 shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
              <span className="text-base font-bold text-slate-800">Details</span>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/30 font-semibold">
                {report.id}
              </span>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</span>
                <span className="text-sm text-slate-700 font-bold flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-2xl shadow-sm">
                  <Compass className="w-4 h-4 text-blue-600" />
                  {report.category}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity</span>
                <span className={`font-bold text-[10px] px-3 py-1.5 rounded-2xl border flex items-center gap-1.5 shadow-sm uppercase tracking-wider ${getSeverityBadge(report.severity)}`}>
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                  {report.severity}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Dept</span>
                <span className="text-sm text-slate-700 font-bold bg-white border border-slate-100 px-3 py-1.5 rounded-2xl shadow-sm">
                  {report.assignedDept} Department
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reported By</span>
                <span className="text-sm text-slate-700 font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-extrabold border border-white shadow-sm">
                    {report.reportedBy.charAt(0)}
                  </span>
                  {report.reportedBy}
                </span>
              </div>
            </div>
          </div>

          {/* Location Map Card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/30 shadow-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-white shadow-md">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-base font-bold text-slate-800">Location Map</span>
            </div>

            <div className="h-56 bg-slate-200 relative m-4 rounded-2xl overflow-hidden border border-slate-200/40 shadow-inner">
              <GoogleMap
                center={{ lat: report.latitude, lng: report.longitude }}
                zoom={14}
                markers={[{
                  id: report.id,
                  lat: report.latitude,
                  lng: report.longitude,
                  title: report.title,
                  category: report.category,
                  severity: report.severity,
                  status: report.status,
                }]}
              />
            </div>

            <div className="p-6 pt-2 space-y-3">
              <p className="text-sm text-slate-700 font-bold">{report.locationName}</p>
              
              <button 
                onClick={copyCoordsToClipboard}
                className="flex items-center justify-between w-full font-mono text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl border border-slate-200/20 transition-all text-left font-semibold cursor-pointer"
              >
                <span>{report.latitude.toFixed(4)}° N, {Math.abs(report.longitude).toFixed(4)}° W</span>
                {copiedCoords ? (
                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    COPIED
                  </span>
                ) : (
                  <span className="text-[10px] text-blue-600 font-bold hover:underline">COPY</span>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
