import { useState } from 'react';
import { ThumbsUp, Layers, CheckCircle2, MapPin, Sparkles, Award, Check } from 'lucide-react';
import { Report } from '../types';

interface CitizenVerifyProps {
  reports: Report[];
  onIncrementUpvotes: (id: string) => void;
  onRewardPoints: (points: number) => void;
  onNavigateToDetail: (id: string) => void;
}

export default function CitizenVerify({ reports, onIncrementUpvotes, onRewardPoints, onNavigateToDetail }: CitizenVerifyProps) {
  const [verifiedIds, setVerifiedIds] = useState<Record<string, 'valid' | 'duplicate' | 'resolved'>>({});

  const handleAction = (reportId: string, action: 'valid' | 'duplicate' | 'resolved') => {
    if (verifiedIds[reportId]) return; // prevent multiple votes on the same item

    setVerifiedIds(prev => ({ ...prev, [reportId]: action }));
    
    if (action === 'valid') {
      onIncrementUpvotes(reportId);
    }
    
    // Reward citizen with points
    onRewardPoints(15);
  };

  // Filter out resolved items so feed focuses on pending validation
  const pendingVerification = reports.filter(r => r.status !== 'RESOLVED');

  return (
    <div className="space-y-10 animate-fade-in max-w-[1280px] mx-auto py-2">
      {/* Intro Header */}
      <section className="bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-slate-200/40 rounded-3xl p-8 relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500/10" />
            <span>Community Crowdsourcing</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Community Verification Feed
          </h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium leading-relaxed">
            Review reported issues from neighbors. Verify their accuracy to prioritize dispatches and earn community points.
          </p>
        </div>
        
        <div className="p-4 bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 shrink-0 self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reward Level</span>
            <span className="text-sm font-extrabold text-slate-800 block">+15 XP per Verification</span>
          </div>
        </div>
      </section>

      {/* Feed Stack */}
      <section className="space-y-6">
        {pendingVerification.length === 0 ? (
          <div className="text-center py-16 bg-white/40 border border-slate-200/30 rounded-3xl">
            <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">No community reports are currently awaiting validation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pendingVerification.map((report) => {
              const currentAction = verifiedIds[report.id];
              return (
                <div 
                  key={report.id}
                  className="bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-3xl overflow-hidden p-6 shadow-md shadow-blue-900/5 hover:shadow-lg transition-all flex flex-col justify-between group relative"
                >
                  {/* Card Main Info */}
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      {/* Image Preview thumbnail */}
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 shrink-0 bg-slate-100 shadow-sm">
                        <img 
                          src={report.imageUrl} 
                          alt={report.title} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-slate-400 font-bold tracking-wider block bg-slate-100 px-2 py-0.5 rounded w-fit uppercase">
                          {report.id}
                        </span>
                        <h3 
                          onClick={() => onNavigateToDetail(report.id)}
                          className="font-extrabold text-base text-slate-800 hover:text-blue-600 cursor-pointer transition-colors line-clamp-1"
                        >
                          {report.title}
                        </h3>
                        <p className="text-slate-500 text-xs flex items-center gap-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {report.locationName}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Crowdsourcing Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      onClick={() => handleAction(report.id, 'valid')}
                      disabled={!!currentAction}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                        currentAction === 'valid'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : currentAction
                          ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                          : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {currentAction === 'valid' ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Verified ({report.upvotes})</span>
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                          <span>Valid</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleAction(report.id, 'duplicate')}
                      disabled={!!currentAction}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                        currentAction === 'duplicate'
                          ? 'bg-amber-600 text-white shadow-md'
                          : currentAction
                          ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                          : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {currentAction === 'duplicate' ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Flagged Duplicate</span>
                        </>
                      ) : (
                        <>
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          <span>Duplicate</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleAction(report.id, 'resolved')}
                      disabled={!!currentAction}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                        currentAction === 'resolved'
                          ? 'bg-green-600 text-white shadow-md'
                          : currentAction
                          ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                          : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {currentAction === 'resolved' ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Flagged Resolved</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Resolved</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
