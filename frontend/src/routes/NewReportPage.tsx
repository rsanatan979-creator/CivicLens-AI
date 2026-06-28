import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';
import ReportIssue from '../components/ReportIssue';
import { Report } from '../types';

export const NewReportPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, createComplaint } = useComplaints();
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

  const handleAddReport = async (newReport: Report) => {
    if (user) {
      newReport.reportedBy = user.name;
    }
    try {
      await createComplaint(newReport);
      navigate('/reports');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ReportIssue
      reports={reports}
      onAddReport={handleAddReport}
      onNavigateToDetail={(id) => navigate(`/reports/${id}`)}
      onViewRegistry={() => navigate('/reports')}
    />
  );
};

export default NewReportPage;
