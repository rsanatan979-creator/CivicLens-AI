import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, MapPin, Sparkles, TrendingUp, Cpu, Calendar, Check, ShieldAlert, ChevronRight } from 'lucide-react';
import { PredictionService } from '../services/prediction.service';

interface Prediction {
  id: string;
  zone: string;
  riskFactor: number;
  type: 'Road Degradation' | 'Drainage Failure' | 'Electrical Blackout';
  description: string;
  recommDept: string;
  actionCost: string;
}

export default function OfficialPredictions() {
  const predictionsQuery = useQuery({
    queryKey: ['predictions'],
    queryFn: PredictionService.getHotspots,
  });

  const rawPredictions = predictionsQuery.data || [];
  const predictions: Prediction[] = rawPredictions.map((p: any) => {
    const typeMap = p.predictedIssue.toLowerCase().includes('pothole') || p.predictedIssue.toLowerCase().includes('road')
      ? 'Road Degradation'
      : p.predictedIssue.toLowerCase().includes('drain') || p.predictedIssue.toLowerCase().includes('flood')
      ? 'Drainage Failure'
      : 'Electrical Blackout';
    
    return {
      id: p.id,
      zone: p.areaName,
      riskFactor: Math.round(p.riskScore),
      type: typeMap as 'Road Degradation' | 'Drainage Failure' | 'Electrical Blackout',
      description: `${p.predictedIssue}. Local telemetry indicates a high probability of escalation. Prophylactic repair recommended.`,
      recommDept: typeMap === 'Road Degradation' ? 'Roads Dept' : typeMap === 'Drainage Failure' ? 'Sanitation Dept' : 'Electrical Dept',
      actionCost: typeMap === 'Road Degradation' ? 'Low (Patching)' : typeMap === 'Drainage Failure' ? 'Medium (Clearing)' : 'High (Load balance)',
    };
  });

  const [selectedPredictionId, setSelectedPredictionId] = useState<string | null>(null);
  const [dispatchedIds, setDispatchedIds] = useState<Record<string, boolean>>({});

  const activeId = selectedPredictionId || predictions[0]?.id || null;
  const selectedPrediction = predictions.find(p => p.id === activeId) || null;

  const handleDispatchProphylactic = (predId: string) => {
    setDispatchedIds(prev => ({ ...prev, [predId]: true }));
  };

  if (predictionsQuery.isLoading) {
    return (
      <div className="min-h-[400px] bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (predictions.length === 0 || !selectedPrediction) {
    return (
      <div className="space-y-10 animate-fade-in max-w-[1280px] mx-auto py-2">
        <section className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] -translate-y-12 translate-x-12 pointer-events-none"></div>
          <div className="relative z-10 space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Infrastructure Prediction Dashboard</h1>
            <p className="text-slate-300 text-sm max-w-xl">No infrastructure failures predicted currently.</p>
          </div>
        </section>
        <section className="bg-white/60 border border-slate-200/40 backdrop-blur-md rounded-3xl p-12 text-center shadow-sm">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800">No AI Predictions Available</h2>
          <p className="text-slate-500 text-sm mt-1">Our machine learning models have not identified any high-risk hotspot regions at this time.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-[1280px] mx-auto py-2 select-none">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] -translate-y-12 translate-x-12 pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold uppercase border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-500/10" />
            <span>AI Predictive Modeling</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Infrastructure Prediction Dashboard
          </h1>
          <p className="text-slate-300 text-sm max-w-xl font-medium leading-relaxed">
            Deploy crew dispatches preemptively. Our machine learning models crunch traffic volume, sensor grid diagnostics, and community reports to predict failures before they happen.
          </p>
        </div>
      </section>

      {/* Main Grid: Predictions List & Satellite Overlay Detail */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 1 col: Predictive Risk alerts */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-4 bg-white/75 backdrop-blur-md border border-slate-200/40 rounded-2xl flex items-center gap-2 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Projected Failures</h2>
          </div>

          <div className="space-y-4">
            {predictions.map((pred) => {
              const isSelected = selectedPrediction.id === pred.id;
              const isDispatched = dispatchedIds[pred.id];
              return (
                <div
                  key={pred.id}
                  onClick={() => setSelectedPredictionId(pred.id)}
                  className={`border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/20 border-l-4 border-l-blue-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {pred.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pred.riskFactor >= 85
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {pred.riskFactor}% Risk Index
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-sm leading-tight">
                    {pred.type} Warning
                  </h3>
                  <p className="text-slate-500 text-xs flex items-center gap-1 font-semibold mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {pred.zone}
                  </p>

                  {isDispatched && (
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg w-fit">
                      <Check className="w-3.5 h-3.5" />
                      <span>Prophylactic Dispatch Confirmed</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 cols: Predictive detail panel & Heatmap overlay */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/40 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Detailed Prediction Model</span>
                <h3 className="text-xl font-extrabold text-slate-800 mt-1">{selectedPrediction.type} in {selectedPrediction.zone}</h3>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl font-black text-xl flex items-baseline gap-0.5">
                {selectedPrediction.riskFactor}
                <span className="text-xs font-semibold text-red-400">%</span>
              </div>
            </div>

            {/* Satellite Heatmap Visual representation */}
            <div className="h-64 bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-100 shadow-inner group">
              <div 
                className="absolute inset-0 bg-cover bg-center filter saturate-120 duration-700 hover:scale-101"
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnd-4_DXOTyX1wcjkERjjK2naeAFVafbGGUvTTfBaLxeyEYpvbFnBQxh9m9cNWbNI8a2NPxaK_BV2OLOFjTzi9lBZSNETMbhgVh28XKo7KRwvOGp175PaK-FXz9eRVkbwwjPD0iYuWFj9IkEkcugWJXgdrKn2FFWXC6KJqDXKjNAgdvhc6N3Tq2ynMKa0e_2tYCrWegYkSqMOyTj8Xk8yYc5yaq4fKMYyHHOLLmEzHqS1mKJwXtkUAZrrdWycFjRastoz4Dy8OcQk')` }}
              ></div>

              {/* Pulsing warning aura around hot spot */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 bg-red-600/35 rounded-full animate-ping absolute"></div>
                <div className="w-12 h-12 bg-red-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white relative z-10 animate-bounce">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Interactive Floating Legend */}
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur text-white p-3 rounded-xl border border-slate-800 text-[10px] font-bold space-y-1">
                <p className="text-red-400 uppercase tracking-widest">Anomaly Signature</p>
                <p>Telemetry: Subgrade Hydration Level Over 84%</p>
              </div>
            </div>

            {/* Prediction Info Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Projected Cost Risk</span>
                <span className="font-extrabold text-slate-700 text-sm block mt-1">{selectedPrediction.actionCost}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Responsible Department</span>
                <span className="font-extrabold text-slate-700 text-sm block mt-1">{selectedPrediction.recommDept}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Critical Target Horizon</span>
                <span className="font-extrabold text-red-600 text-sm block mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Next 14 Days
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">AI Analysis Narrative</span>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">{selectedPrediction.description}</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              {dispatchedIds[selectedPrediction.id] ? (
                <div className="px-6 py-3 bg-green-50 border border-green-100 text-green-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Prophylactic Work Order Queued</span>
                </div>
              ) : (
                <button
                  onClick={() => handleDispatchProphylactic(selectedPrediction.id)}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer active:scale-97 transition-all"
                >
                  <Cpu className="w-4 h-4 text-white" />
                  <span>Trigger Prophylactic Dispatch</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

          </div>
        </div>

      </section>
    </div>
  );
}
