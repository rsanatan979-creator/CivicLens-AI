import { Building2, Sparkles, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SplashProps {
  onGetStarted: () => void;
}

export default function Splash({ onGetStarted }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 8;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="splash-screen" className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white overflow-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-md w-full px-8 text-center flex flex-col items-center justify-between h-[60vh]">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center gap-4 animate-fade-in mt-12">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/25 border border-blue-500/30 flex items-center justify-center relative shadow-lg shadow-blue-500/10">
            <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white p-1 rounded-full animate-bounce">
              <Sparkles className="w-3.5 h-3.5 fill-white/20" />
            </div>
            <Building2 className="w-10 h-10 text-blue-400 stroke-[2]" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight mt-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            CivicLens AI
          </h1>
          <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
            AI-Powered Civic Reporting
          </p>
        </div>

        {/* Loading Indicator or Get Started */}
        <div className="w-full flex flex-col items-center gap-8">
          {progress < 100 ? (
            <div className="w-full space-y-3">
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-100 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                Initializing Intelligent Dispatch System...
              </p>
            </div>
          ) : (
            <button
              onClick={onGetStarted}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
        Ver 1.0 • Smart Infrastructure Engine
      </div>
    </div>
  );
}
