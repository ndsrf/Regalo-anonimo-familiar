import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MagicLinkInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, login: authLogin } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await authAPI.verifyMagicToken(token);
      setInvitation(response.data.invitation);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Invitación no válida o expirada');
      setLoading(false);
    }
  };

  const handleJoinAsExistingUser = async () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setSubmitting(true);
    try {
      await authAPI.joinGroupViaMagicLink(token);
      alert('Te has unido al grupo exitosamente');
      navigate('/groups');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al unirse al grupo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authAPI.registerViaMagicLink(token, {
        nombre: formData.nombre,
        password: formData.password,
      });

      // Log in the user with the received token
      authLogin(response.data.token, response.data.user);
      alert('¡Cuenta creada y te has unido al grupo exitosamente!');
      navigate('/groups');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // Save the return URL before OAuth redirect
    localStorage.setItem('oauthReturnTo', `/invite/${token}`);
    authAPI.googleLogin(`/invite/${token}`);
  };

  const handleMetaLogin = () => {
    // Save the return URL before OAuth redirect
    localStorage.setItem('oauthReturnTo', `/invite/${token}`);
    authAPI.metaLogin(`/invite/${token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando invitación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitación no válida</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  const gameModeEmoji = invitation.gameMode === 'Amigo Invisible' ? '🎭' : '🎁';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{gameModeEmoji}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Te han invitado!</h1>
            <p className="text-gray-600">
              <strong>{invitation.inviterName}</strong> te ha invitado a unirte a:
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-2">{invitation.groupName}</h2>
            <p className="text-sm text-blue-700">
              <strong>Modo de juego:</strong> {invitation.gameMode}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Celebración:</strong> {invitation.celebrationType}
            </p>
          </div>

          {invitation.userExists ? (
            // User already exists - show join button
            <div>
              <p className="text-gray-700 mb-4 text-center">
                Ya tienes una cuenta con el correo <strong>{invitation.email}</strong>
              </p>
              {user ? (
                <button
                  onClick={handleJoinAsExistingUser}
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Uniéndose...' : 'Unirme al grupo'}
                </button>
              ) : (
                <div>
                  <p className="text-center text-gray-600 mb-4">Por favor inicia sesión para continuar</p>
                  <button
                    onClick={() =>
                      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
                    }
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Iniciar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            // User doesn't exist - show registration form
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Crea tu cuenta para unirte
              </h3>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={invitation.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirma tu contraseña"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Creando cuenta...' : 'Crear cuenta y unirme'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O regístrate con</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continuar con Google
                  </button>

                  <button
                    onClick={handleMetaLogin}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#E4405F">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    Continuar con Instagram
                  </button>
                </div>
              </div>

              {invitation.gameMode === 'Amigo Invisible' && (
                <div className="mt-6 bg-purple-50 border border-purple-200 rounded-md p-4 text-sm">
                  <p className="text-purple-900">
                    <strong>💡 Tip para Amigo Invisible:</strong> Puedes unirte sin registrarte. Tu asignación
                    estará disponible con este enlace mágico después del sorteo.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
