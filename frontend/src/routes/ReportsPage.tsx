import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';
import CitizenHome from '../components/CitizenHome';
import IssueRegistry from '../components/IssueRegistry';
import { Report } from '../types';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, updateComplaint, deleteComplaint } = useComplaints();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const reports = (complaints as Report[]) || [];

  const handleUpdateReportStatus = async (reportId: string, status: any) => {
    try {
      await updateComplaint({ id: reportId, updates: { status } });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateReportSeverity = async (reportId: string, severity: any) => {
    try {
      await updateComplaint({ id: reportId, updates: { severity } });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteComplaint(reportId);
    } catch (e) {
      console.error(e);
    }
  };

  if (user.role === 'OFFICIAL') {
    return (
      <IssueRegistry
        reports={reports}
        onUpdateReportStatus={handleUpdateReportStatus}
        onUpdateReportSeverity={handleUpdateReportSeverity}
        onDeleteReport={handleDeleteReport}
        onNavigateToDetail={(id) => navigate(`/reports/${id}`)}
      />
    );
  }

  return (
    <CitizenHome
      user={user}
      reports={reports}
      onTriggerReport={() => navigate('/reports/new')}
      onNavigateToDetail={(id) => navigate(`/reports/${id}`)}
      onNavigateToVerify={() => navigate('/reports/verify')}
    />
  );
};

export default ReportsPage;
