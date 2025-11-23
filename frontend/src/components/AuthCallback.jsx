import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function AuthCallback() {
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      login(token).then(() => {
        window.location.href = '/';
      });
    }
  }, [login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 text-xl">Signing you in...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
