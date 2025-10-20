import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from './shared/LoadingSpinner.jsx';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
