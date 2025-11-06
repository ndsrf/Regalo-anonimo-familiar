import { useState } from 'react';
import { authAPI } from '../services/api';

export default function EmailVerificationBanner({ user }) {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Don't show banner if email is verified or if user used OAuth
  if (!user || user.email_verified || user.google_id || user.meta_id) {
    return null;
  }

  const handleResendEmail = async () => {
    setResending(true);
    setMessage('');
    setError('');

    try {
      const response = await authAPI.resendVerification();
      setMessage(response.data.message || 'Email de verificación enviado. Revisa tu bandeja de entrada.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al reenviar email de verificación');
      setTimeout(() => setError(''), 5000);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Verifica tu correo electrónico</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Para poder agregar regalos a tu lista de deseos, necesitas verificar tu correo electrónico.
              Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
            </p>
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Enviando...' : '¿No recibiste el email? Reenviar'}
              </button>
            </div>
            {message && (
              <p className="mt-2 text-sm text-green-700 font-medium">{message}</p>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-700 font-medium">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
