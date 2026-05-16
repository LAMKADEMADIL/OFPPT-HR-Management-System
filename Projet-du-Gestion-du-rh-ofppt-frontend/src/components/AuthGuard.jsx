import React from 'react';
import { Navigate, Outlet } from 'react-router';

/**
 * AuthGuard protects routes by checking for a valid token in localStorage.
 * If no token exists, the user is redirected to the login page.
 */
const AuthGuard = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login, but save the current location so we can redirect back
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default AuthGuard;