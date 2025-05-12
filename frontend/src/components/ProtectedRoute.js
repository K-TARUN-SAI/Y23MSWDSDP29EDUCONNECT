// src/components/ProtectedRoute.js
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, redirectPath = '/auth' }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;