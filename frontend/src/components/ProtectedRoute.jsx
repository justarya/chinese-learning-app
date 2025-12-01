import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';
import WhitelistWall from './WhitelistWall';

function ProtectedRoute() {
  const { isAuthenticated, isWhitelisted, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isWhitelisted) {
    return <WhitelistWall user={user} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
