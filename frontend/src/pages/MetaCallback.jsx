import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MetaCallback() {
  const [searchParams] = useSearchParams();
  const { handleMetaCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (token) {
        // Wait for user to be loaded before navigating
        const success = await handleMetaCallback(token);
        if (success) {
          // Check for returnTo in sessionStorage
          const returnTo = sessionStorage.getItem('returnTo');
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
        alert('Error al iniciar sesión con Instagram');
        navigate('/login');
      }
    };

    processCallback();
  }, [searchParams, handleMetaCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
}
