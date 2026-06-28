import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Megaphone, X, Home, PlusCircle, CheckCircle2, UserCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';

// Route Pages
import LoginPage from './routes/LoginPage';
import DashboardPage from './routes/DashboardPage';
import ReportsPage from './routes/ReportsPage';
import NewReportPage from './routes/NewReportPage';
import VerifyReportsPage from './routes/VerifyReportsPage';
import ReportDetailsPage from './routes/ReportDetailsPage';
import AnalyticsPage from './routes/AnalyticsPage';
import PredictionsPage from './routes/PredictionsPage';
import ProfilePage from './routes/ProfilePage';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Protected Route Guard with optional Role-Based Protection
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If unauthorized, redirect to the corresponding default route based on their role
    if (user.role === 'OFFICIAL' || user.role === 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/reports" replace />;
    }
  }

  return <>{children}</>;
};

// Global Layout Wrapper
interface AppLayoutProps {
  children: React.ReactNode;
  isBroadcastModalOpen: boolean;
  setIsBroadcastModalOpen: (open: boolean) => void;
  broadcastMessage: string | null;
  setBroadcastMessage: (msg: string | null) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  isBroadcastModalOpen,
  setIsBroadcastModalOpen,
  broadcastMessage,
  setBroadcastMessage,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [newBroadcastText, setNewBroadcastText] = useState('');

  if (!user) {
    return <>{children}</>;
  }

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBroadcastText.trim()) {
      setBroadcastMessage(newBroadcastText);
      setIsBroadcastModalOpen(false);
      setNewBroadcastText('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCitizenRole = user.role === 'CITIZEN';

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen relative pb-16 md:pb-0 select-none antialiased">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-[120px] translate-y-12 -translate-x-12"></div>
      </div>

      {/* Broadcast Bar */}
      {broadcastMessage && (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-3 px-4 shadow-md text-xs font-semibold relative z-50 animate-fade-in flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <Megaphone className="w-4 h-4 fill-white/10 shrink-0 animate-bounce" />
            <span className="uppercase text-[9px] tracking-wider font-black bg-white/20 px-2 py-0.5 rounded-full">Community Broadcast</span>
            <span className="truncate">{broadcastMessage}</span>
          </div>
          <button onClick={() => setBroadcastMessage(null)} className="p-1 hover:bg-white/10 rounded-full cursor-pointer">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {isCitizenRole ? (
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header
            currentView="CITIZEN_HOME"
            setCurrentView={(view) => {
              if (view === 'CITIZEN_PROFILE') navigate('/profile');
              else if (view === 'CITIZEN_REPORT') navigate('/reports/new');
              else if (view === 'CITIZEN_VERIFY') navigate('/reports/verify');
              else navigate('/reports');
            }}
            user={user}
          />
          <main className="flex-1 px-4 md:px-16 py-8 md:py-12 max-w-[1280px] mx-auto w-full relative z-10">
            {children}
          </main>
          {/* Mobile Bottom Nav */}
          <nav className="fixed bottom-0 left-0 w-full z-45 flex justify-around items-center bg-white/95 backdrop-blur-xl py-3 border-t border-slate-200/60 md:hidden">
            <button onClick={() => navigate('/reports')} className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-400">
              <Home className="w-5 h-5 mb-1" />
              <span>Home</span>
            </button>
            <button onClick={() => navigate('/reports/new')} className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-400">
              <PlusCircle className="w-5 h-5 mb-1" />
              <span>Report</span>
            </button>
            <button onClick={() => navigate('/reports/verify')} className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-400">
              <CheckCircle2 className="w-5 h-5 mb-1" />
              <span>Verify</span>
            </button>
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-400">
              <UserCircle className="w-5 h-5 mb-1" />
              <span>Profile</span>
            </button>
          </nav>
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen">
          <Sidebar
            currentView="OFFICIAL_DASHBOARD"
            setCurrentView={(view) => {
              if (view === 'OFFICIAL_COMPLAINTS') navigate('/reports');
              else if (view === 'OFFICIAL_ANALYTICS') navigate('/analytics');
              else if (view === 'OFFICIAL_PREDICTIONS') navigate('/predictions');
              else navigate('/dashboard');
            }}
            onLogout={handleLogout}
            onNewBroadcast={() => setIsBroadcastModalOpen(true)}
          />
          <main className="flex-1 ml-0 md:ml-72 min-h-screen p-6 md:p-10 flex flex-col justify-between relative z-10">
            <div className="max-w-[1280px] w-full mx-auto">
              {children}
            </div>
          </main>
        </div>
      )}

      {/* Broadcast Modal Dialog */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-8 shadow-2xl animate-fade-in relative">
            <button onClick={() => setIsBroadcastModalOpen(false)} className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-4 items-center mb-6">
              <span className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <Megaphone className="w-5 h-5 text-blue-600 fill-blue-600/15" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Push Community Broadcast</h3>
                <p className="text-xs text-slate-500">Push real-time announcements to all citizens.</p>
              </div>
            </div>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message Bulletin</label>
                <textarea
                  rows={3}
                  required
                  value={newBroadcastText}
                  onChange={(e) => setNewBroadcastText(e.target.value)}
                  placeholder="e.g. Traffic delays near Main St due to pavement work."
                  className="w-full border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-2xl p-4 text-sm font-medium resize-none text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsBroadcastModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md">Publish Bulletin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout
                isBroadcastModalOpen={isBroadcastModalOpen}
                setIsBroadcastModalOpen={setIsBroadcastModalOpen}
                broadcastMessage={broadcastMessage}
                setBroadcastMessage={setBroadcastMessage}
              >
                <Routes>
                  {/* Shared Routes (Visible under correct role contexts) */}
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/reports/:id" element={<ReportDetailsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Citizen Only Protected Routes */}
                  <Route
                    path="/reports/new"
                    element={
                      <ProtectedRoute allowedRoles={['CITIZEN']}>
                        <NewReportPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports/verify"
                    element={
                      <ProtectedRoute allowedRoles={['CITIZEN']}>
                        <VerifyReportsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Official/Admin Only Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['OFFICIAL', 'ADMIN']}>
                        <DashboardPage onNewBroadcast={() => setIsBroadcastModalOpen(true)} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute allowedRoles={['OFFICIAL', 'ADMIN']}>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/predictions"
                    element={
                      <ProtectedRoute allowedRoles={['OFFICIAL', 'ADMIN']}>
                        <PredictionsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Default redirect route depending on authenticated user's role */}
                  <Route
                    path="*"
                    element={
                      user ? (
                        <Navigate to={user.role === 'CITIZEN' ? '/reports' : '/dashboard'} replace />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
