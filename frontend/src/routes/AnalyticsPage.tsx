import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Analytics from '../components/Analytics';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
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

  return <Analytics />;
};

export default AnalyticsPage;
