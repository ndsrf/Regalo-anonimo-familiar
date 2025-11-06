import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="text-purple-600 hover:text-purple-700 font-medium mb-4 inline-block"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Condiciones del Servicio
          </h1>
          <p className="text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Sección 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar este servicio de amigo invisible/intercambio de regalos,
              usted acepta estar sujeto a estos Términos de Servicio y todas las leyes y
              regulaciones aplicables. Si no está de acuerdo con alguno de estos términos,
              no debe utilizar este servicio.
            </p>
          </section>

          {/* Sección 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Nuestra plataforma permite a los usuarios:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Crear y gestionar grupos de intercambio de regalos</li>
              <li>Realizar sorteos de amigo invisible de forma automática</li>
              <li>Gestionar listas de deseos y presupuestos</li>
              <li>Comunicarse de forma anónima con otros participantes</li>
              <li>Organizar eventos de intercambio de regalos</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Registro de Cuenta
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Para utilizar nuestro servicio, debe:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Proporcionar información precisa y completa durante el registro</li>
              <li>Mantener la confidencialidad de sus credenciales de acceso</li>
              <li>Ser responsable de todas las actividades realizadas bajo su cuenta</li>
              <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
              <li>Tener al menos 13 años de edad para registrarse</li>
            </ul>
          </section>

          {/* Sección 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Uso Aceptable
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Al utilizar nuestro servicio, usted se compromete a NO:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Utilizar el servicio para fines ilegales o fraudulentos</li>
              <li>Cargar contenido ofensivo, difamatorio o inapropiado</li>
              <li>Intentar acceder a cuentas de otros usuarios sin autorización</li>
              <li>Interferir con el funcionamiento normal del servicio</li>
              <li>Realizar ingeniería inversa o intentar extraer código fuente</li>
              <li>Utilizar bots o sistemas automatizados sin autorización</li>
            </ul>
          </section>

          {/* Sección 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Privacidad y Protección de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              La recopilación y uso de su información personal está regida por nuestra{' '}
              <Link to="/privacy-policy" className="text-purple-600 hover:text-purple-700 font-medium">
                Política de Privacidad
              </Link>
              . Al utilizar nuestro servicio, usted consiente la recopilación y uso de
              información de acuerdo con esa política.
            </p>
          </section>

          {/* Sección 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Propiedad Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed">
              El servicio y su contenido original, características y funcionalidad son
              propiedad exclusiva de Regalo Anónimo Familiar y están protegidos por
              derechos de autor, marcas registradas y otras leyes de propiedad intelectual.
            </p>
          </section>

          {/* Sección 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              El servicio se proporciona "tal cual" y "según disponibilidad". No garantizamos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Que el servicio esté libre de errores o interrupciones</li>
              <li>La exactitud o confiabilidad del contenido generado por usuarios</li>
              <li>Que el servicio satisfaga sus necesidades específicas</li>
              <li>La resolución de disputas entre usuarios del servicio</li>
            </ul>
          </section>

          {/* Sección 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Modificaciones del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar o discontinuar el servicio (o cualquier
              parte de él) en cualquier momento, con o sin previo aviso. No seremos
              responsables ante usted ni ante terceros por cualquier modificación, suspensión
              o discontinuación del servicio.
            </p>
          </section>

          {/* Sección 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Terminación
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos terminar o suspender su acceso al servicio inmediatamente, sin previo
              aviso ni responsabilidad, por cualquier motivo, incluyendo sin limitación si
              usted incumple estos Términos de Servicio. Todas las disposiciones de estos
              términos que por su naturaleza deban sobrevivir a la terminación, sobrevivirán,
              incluyendo sin limitación las disposiciones de propiedad, renuncias de garantía
              y limitaciones de responsabilidad.
            </p>
          </section>

          {/* Sección 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Ley Aplicable
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Estos términos se regirán e interpretarán de acuerdo con las leyes aplicables,
              sin tener en cuenta las disposiciones sobre conflictos de leyes.
            </p>
          </section>

          {/* Sección 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Cambios en los Términos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier
              momento. Si una revisión es material, intentaremos proporcionar un aviso con al
              menos 30 días de anticipación antes de que los nuevos términos entren en vigencia.
              Lo que constituye un cambio material será determinado a nuestra sola discreción.
            </p>
          </section>

          {/* Sección 12 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos a
              través del formulario de contacto en nuestro sitio web o en la sección de
              configuración de su cuenta.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
