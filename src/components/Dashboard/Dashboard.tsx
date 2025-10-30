import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';

// Dashboard components
import StudentDashboard from './StudentDashboard';
import OfficerDashboard from './OfficerDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const DashboardComponent = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'officer':
        return <OfficerDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<DashboardComponent />} />
          <Route path="/*" element={<DashboardComponent />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;