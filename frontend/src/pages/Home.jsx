import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            🎁 Lista de Deseos Secreta
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Crea grupos, añade regalos a tu lista de deseos personal, y deja que los demás
            miembros vean una lista anónima de todos los regalos sin saber quién pidió qué.
          </p>

          <div className="flex gap-4 justify-center mb-20">
            {isAuthenticated ? (
              <Link
                to="/groups"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
              >
                Ver Mis Grupos
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
                >
                  Comenzar Ahora
                </Link>
                <Link
                  to="/login"
                  className="bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-lg text-lg font-medium"
                >
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Totalmente Anónimo
              </h3>
              <p className="text-gray-600">
                Los regalos se muestran mezclados sin identificar quién pidió qué
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tematización Personalizada
              </h3>
              <p className="text-gray-600">
                La aplicación cambia de tema según el tipo de celebración
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Notificaciones Inteligentes
              </h3>
              <p className="text-gray-600">
                Te avisamos si un regalo comprado es modificado o eliminado
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">¿Cómo funciona?</h2>
            <div className="space-y-6 text-left">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Crea un grupo</h4>
                  <p className="text-gray-600">
                    Define el nombre, tipo de celebración y fecha de inicio
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Invita a tus amigos</h4>
                  <p className="text-gray-600">
                    Comparte el enlace único del grupo con tu familia o amigos
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Añade tus regalos</h4>
                  <p className="text-gray-600">
                    Cada miembro añade los regalos que desea a su lista personal
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Compra regalos anónimos</h4>
                  <p className="text-gray-600">
                    Ve la lista mezclada del grupo y marca los que vas a comprar, sin que nadie sepa qué compraste
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
