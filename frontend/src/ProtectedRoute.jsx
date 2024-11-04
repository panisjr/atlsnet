import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');

  console.log('Token in ProtectedRoute:', token);

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;