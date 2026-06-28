import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Splash from '../components/Splash';
import Auth from '../components/Auth';

export const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [isRegisterView, setIsRegisterView] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'OFFICIAL' ? '/dashboard' : '/reports');
    }
  }, [user, navigate]);

  if (showSplash) {
    return (
      <Splash
        onGetStarted={() => {
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <Auth
      isRegisterView={isRegisterView}
      onToggleView={(isReg) => setIsRegisterView(isReg)}
    />
  );
};

export default LoginPage;
