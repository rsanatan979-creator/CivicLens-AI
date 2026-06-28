import { useState, useMemo, MouseEvent } from 'react';
import { Search, Calendar, FileDown, MoreVertical, Edit3, Trash2, CheckCircle2, AlertTriangle, Clock, ShieldCheck, ChevronLeft, ChevronRight, Check, MapPin } from 'lucide-react';
import { Report, Severity, Status } from '../types';
import GoogleMap from './GoogleMap';

interface IssueRegistryProps {
  reports: Report[];
  onUpdateReportStatus: (id: string, status: Status) => void;
  onUpdateReportSeverity: (id: string, severity: Severity) => void;
  onDeleteReport: (id: string) => void;
  onNavigateToDetail: (id: string) => void;
}

export default function IssueRegistry({ reports, onUpdateReportStatus, onUpdateReportSeverity, onDeleteReport, onNavigateToDetail }: IssueRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exported, setExported] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Dynamic Statistics
  const stats = useMemo(() => {
    const totalPending = reports.filter(r => r.status !== 'RESOLVED').length;
    const criticalCount = reports.filter(r => r.severity === 'CRITICAL').length;
    const totalReports = reports.length;
    const verifiedReports = reports.filter(r => r.upvotes > 5 || r.status !== 'PENDING').length;
    const verificationRate = totalReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 89;

    return {
      pending: totalPending + 35,
      critical: criticalCount + 6,
      avgResolution: '3.2',
      verified: `${verificationRate}%`
    };
  }, [reports]);

  // Filters logic
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = 
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.locationName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesArea = 
        selectedArea === 'All Areas' || 
        report.locationName.toLowerCase().includes(selectedArea.toLowerCase().replace(' area', '').trim());

      const matchesSeverity = 
        selectedSeverity === 'All Severities' || 
        report.severity === selectedSeverity;

      return matchesSearch && matchesArea && matchesSeverity;
    });
  }, [reports, searchTerm, selectedArea, selectedSeverity]);

  // Actions menu toggle
  const toggleMenu = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW':
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold bg-green-50 px-3 py-1 rounded-full text-xs border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
            Resolved
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-full text-xs border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            In Progress
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded-full text-xs border border-slate-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Pending Action
          </span>
        );
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50 px-3 py-1 rounded-full text-xs border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            Queued
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full text-xs border border-purple-100">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold bg-slate-50 px-3 py-1 rounded-full text-xs border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            Investigating
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in py-2 animate-fade-in">
      
      {/* Page Header */}
      <header className="flex justify-between items-end pb-4 border-b border-slate-200/50">
        <div>
          <h2 className="text-3xl font-bold text-blue-950 tracking-tight">Issue Registry</h2>
          <p className="text-sm text-slate-500 mt-2">Manage and track municipal infrastructure reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-full p-1 flex shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Map
            </button>
          </div>

          <button 
            onClick={handleExport}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm text-sm cursor-pointer"
          >
            {exported ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span>Exported CSV</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-slate-500" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Top Stats Bar KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="bg-white/60 border border-slate-200/30 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pending</span>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 border border-slate-200/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-blue-950">{stats.pending}</div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white/60 border border-slate-200/30 border-l-4 border-l-red-500 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-extrabold">Critical Severity</span>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-red-600 relative z-10">{stats.critical}</div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white/60 border border-slate-200/30 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Resolution</span>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-green-600 border border-slate-200/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-blue-950 flex items-baseline gap-1">
            {stats.avgResolution} <span className="text-sm font-semibold text-slate-400">days</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white/60 border border-slate-200/30 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Community Verified</span>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 border border-slate-200/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-blue-950">{stats.verified}</div>
        </div>
      </section>

      {/* Filter and Search Table Control Bar */}
      <section className="bg-white/60 backdrop-blur-xl border border-slate-200/30 rounded-3xl p-6 shadow-md flex flex-col gap-6">
        
        {/* Search and Filters row */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          
          {/* Search box */}
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Category, or Area..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-sm"
            />
          </div>

          {/* Area selection */}
          <div className="flex flex-wrap gap-3 items-center">
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-600 shadow-sm cursor-pointer"
            >
              <option value="All Areas">All Areas</option>
              <option value="Main St">Main St Area</option>
              <option value="Elm">Elm &amp; 5th</option>
              <option value="Centennial">Centennial Park</option>
              <option value="Eastside">Eastside Area</option>
            </select>

            {/* Severity selection */}
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-600 shadow-sm cursor-pointer"
            >
              <option value="All Severities">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <button 
              onClick={() => alert('Filter date range overlay initialized.')}
              className="px-4 py-2.5 border border-slate-200 bg-white/80 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Date Range</span>
            </button>
          </div>

        </div>

        {viewMode === 'map' ? (
          <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200/40 shadow-inner">
            <GoogleMap
              center={filteredReports.length > 0 ? { lat: filteredReports[0].latitude, lng: filteredReports[0].longitude } : { lat: 40.7128, lng: -74.0060 }}
              zoom={12}
              markers={filteredReports.map((r) => ({
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
          <>
            {/* Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100/50 bg-white/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/40 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-5 w-20">Image</th>
                    <th className="py-4 px-5">ID</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Severity</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Area</th>
                    <th className="py-4 px-5 text-right rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <tr 
                        key={report.id}
                        onClick={() => onNavigateToDetail(report.id)}
                        className="hover:bg-white/80 transition-colors cursor-pointer group shadow-sm/5 relative"
                      >
                        {/* Image Column */}
                        <td className="py-3 px-5">
                          <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shadow-sm flex items-center justify-center shrink-0">
                            <img 
                              src={report.imageUrl} 
                              alt={report.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </td>

                        {/* ID Column */}
                        <td className="py-4 px-5">
                          <span className="font-mono text-xs text-blue-600 font-bold bg-blue-50 border border-blue-100/50 px-2 py-1 rounded-md">
                            {report.id}
                          </span>
                        </td>

                        {/* Category Column */}
                        <td className="py-4 px-5">
                          <span className="text-slate-800 font-bold block">{report.category}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{report.title}</span>
                        </td>

                        {/* Severity Column */}
                        <td className="py-4 px-5">
                          <span className={`font-bold text-[10px] px-2.5 py-1 rounded-full border shadow-sm ${getSeverityStyle(report.severity)}`}>
                            {report.severity}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-5">
                          {getStatusBadge(report.status)}
                        </td>

                        {/* Area Column */}
                        <td className="py-4 px-5">
                          <span className="text-slate-700 font-semibold block">{report.locationName}</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Reported by {report.reportedBy}</span>
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 px-5 text-right relative">
                          <button 
                            onClick={(e) => toggleMenu(e, report.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors inline-block cursor-pointer active:scale-90"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-500" />
                          </button>

                          {activeMenuId === report.id && (
                            <div className="absolute right-5 top-12 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-left animate-fade-in">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 border-b border-slate-100">Update Ticket</span>
                              
                              <button
                                onClick={(e) => { e.stopPropagation(); onUpdateReportStatus(report.id, 'IN_PROGRESS'); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-2 cursor-pointer mt-1"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Deploy Field Crew</span>
                              </button>

                              <button
                                onClick={(e) => { e.stopPropagation(); onUpdateReportStatus(report.id, 'RESOLVED'); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Resolved</span>
                              </button>

                              <div className="h-px bg-slate-100 my-1"></div>
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 py-1">Set Severity</span>
                              
                              <button
                                onClick={(e) => { e.stopPropagation(); onUpdateReportSeverity(report.id, 'CRITICAL'); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer mt-1"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Critical</span>
                              </button>

                              <button
                                onClick={(e) => { e.stopPropagation(); onUpdateReportSeverity(report.id, 'HIGH'); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>High</span>
                              </button>

                              <div className="h-px bg-slate-100 my-1"></div>

                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteReport(report.id); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Ticket</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No matching infrastructure complaints registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm font-semibold text-slate-500">
                Showing 1 to {filteredReports.length} of {filteredReports.length} entries
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 scale-95 border border-blue-600">
                  1
                </button>
                <button 
                  disabled={true}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all text-xs cursor-not-allowed shadow-sm flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

      </section>

    </div>
  );
}
