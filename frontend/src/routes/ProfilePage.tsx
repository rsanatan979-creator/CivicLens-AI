import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';
import CitizenProfile from '../components/CitizenProfile';
import { Report } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateName } = useAuth();
  const { complaints } = useComplaints();
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
  const reportsCount = reports.filter(r => r.reportedBy === user.name).length;

  const handleUpdateName = (newName: string) => {
    updateName(newName);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <CitizenProfile
      user={user}
      reportsCount={reportsCount}
      onUpdateName={handleUpdateName}
      onLogout={handleLogout}
    />
  );
};

export default ProfilePage;
