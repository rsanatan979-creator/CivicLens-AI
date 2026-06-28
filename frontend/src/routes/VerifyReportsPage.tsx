import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';
import CitizenVerify from '../components/CitizenVerify';
import { Report } from '../types';

export const VerifyReportsPage: React.FC = () => {
  const { user, updatePoints } = useAuth();
  const { complaints, upvoteComplaint } = useComplaints();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'CITIZEN') {
      navigate('/reports');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'CITIZEN') {
    return null;
  }

  const reports = (complaints as Report[]) || [];

  const handleIncrementUpvotes = async (reportId: string) => {
    try {
      await upvoteComplaint(reportId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRewardPoints = (points: number) => {
    updatePoints(points);
  };

  return (
    <CitizenVerify
      reports={reports}
      onIncrementUpvotes={handleIncrementUpvotes}
      onRewardPoints={handleRewardPoints}
      onNavigateToDetail={(id) => navigate(`/reports/${id}`)}
    />
  );
};

export default VerifyReportsPage;
