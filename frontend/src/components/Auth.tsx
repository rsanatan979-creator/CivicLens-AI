import { useState, FormEvent } from 'react';
import { Building2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { AuthService } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';

interface AuthProps {
  isRegisterView: boolean;
  onToggleView: (isRegister: boolean) => void;
}

export default function Auth({ isRegisterView, onToggleView }: AuthProps) {
  const { login: saveSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegisterView && !fullName)) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isRegisterView) {
        const response = await AuthService.register({
          name: fullName,
          email,
          password,
        });
        saveSession(response.token, response.user);
      } else {
        const response = await AuthService.login({
          email,
          password,
        });
        saveSession(response.token, response.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative select-none">
      {/* Background Mesh Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-[120px] translate-y-12 -translate-x-12"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/15">
            <Building2 className="w-8 h-8 text-white stroke-[2]" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {isRegisterView ? 'Create your account' : 'Sign in to CivicLens AI'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {isRegisterView ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => {
              setError('');
              onToggleView(!isRegisterView);
            }}
            className="font-bold text-blue-600 hover:text-blue-500 hover:underline cursor-pointer transition-colors"
          >
            {isRegisterView ? 'Sign in' : 'Create account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/70 backdrop-blur-md py-8 px-6 shadow-xl shadow-blue-900/5 sm:rounded-3xl border border-slate-200/50 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold animate-fade-in">
                {error}
              </div>
            )}

            {isRegisterView && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    disabled={isSubmitting}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-semibold text-sm text-slate-800 transition-all focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-semibold text-sm text-slate-800 transition-all focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-semibold text-sm text-slate-800 transition-all focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 active:scale-98 transition-all cursor-pointer text-sm disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Authenticating...' : isRegisterView ? 'Register Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
