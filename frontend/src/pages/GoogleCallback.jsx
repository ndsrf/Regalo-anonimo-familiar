import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (token) {
        // Wait for user to be loaded before navigating
        const success = await handleGoogleCallback(token);
        if (success) {
          // Check for returnTo in URL first (from OAuth state), then sessionStorage as fallback
          let returnTo = searchParams.get('returnTo');
          if (!returnTo) {
            returnTo = sessionStorage.getItem('returnTo');
          }

          if (returnTo) {
            sessionStorage.removeItem('returnTo');
            navigate(decodeURIComponent(returnTo));
          } else {
            navigate('/groups');
          }
        } else {
          navigate('/login');
        }
      } else if (error) {
        alert('Error al iniciar sesión con Google');
        navigate('/login');
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
}
