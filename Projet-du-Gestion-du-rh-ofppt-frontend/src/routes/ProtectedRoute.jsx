import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Loader } from '../components/common/index';

export function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  // console.log("Gatekeeper Check:", { 
  //   isAuthenticated, 
  //   userRole: user?.Role || user?.role, 
  //   allowedRoles,
  //   fullUser: user
  // });

  // 1. If not logged in, send to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Role Check (Handles both 'Role' and 'role' keys)
  const userRole = user?.Role || user?.role;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn("Unauthorized Role! Redirecting to dashboard...");
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Authorized! Render the child routes
  return <Outlet />;
}