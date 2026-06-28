import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';
import ReportDetails from '../components/ReportDetails';
import { Report } from '../types';

export const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { complaints, updateComplaint, upvoteComplaint } = useComplaints();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || !id) {
    return null;
  }

  const reports = (complaints as Report[]) || [];
  const activeReport = reports.find(r => r.id === id);

  if (!activeReport) {
    return (
      <div className="py-12 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Report Not Found</h3>
        <p className="text-slate-500 text-sm">The complaint ID does not exist in the municipal registry.</p>
        <button
          onClick={() => navigate(user.role === 'OFFICIAL' ? '/dashboard' : '/reports')}
          className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer"
        >
          Back to Hub
        </button>
      </div>
    );
  }

  const handleUpdateReportStatus = async (reportId: string, status: any) => {
    try {
      await updateComplaint({ id: reportId, updates: { status } });
    } catch (e) {
      console.error(e);
    }
  };

  const handleIncrementUpvotes = async (reportId: string) => {
    try {
      await upvoteComplaint(reportId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ReportDetails
      report={activeReport}
      onUpdateReportStatus={handleUpdateReportStatus}
      onIncrementUpvotes={handleIncrementUpvotes}
      onBackToHome={() => navigate(user.role === 'OFFICIAL' ? '/dashboard' : '/reports')}
    />
  );
};

export default ReportDetailsPage;
