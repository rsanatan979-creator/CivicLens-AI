import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';
import OfficialDashboard from '../components/OfficialDashboard';
import { Report } from '../types';

interface DashboardPageProps {
  onNewBroadcast: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNewBroadcast }) => {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'OFFICIAL' && user.role !== 'ADMIN') {
      navigate('/reports');
    }
  }, [user, navigate]);

  if (!user || (user.role !== 'OFFICIAL' && user.role !== 'ADMIN')) {
    return null;
  }

  const reports = (complaints as Report[]) || [];

  return (
    <OfficialDashboard
      reports={reports}
      onNavigateToView={(view) => {
        if (view === 'OFFICIAL_COMPLAINTS') {
          navigate('/reports');
        } else if (view === 'OFFICIAL_ANALYTICS') {
          navigate('/analytics');
        } else if (view === 'OFFICIAL_PREDICTIONS') {
          navigate('/predictions');
        }
      }}
      onNavigateToDetail={(id) => navigate(`/reports/${id}`)}
      onNewBroadcast={onNewBroadcast}
    />
  );
};

export default DashboardPage;
