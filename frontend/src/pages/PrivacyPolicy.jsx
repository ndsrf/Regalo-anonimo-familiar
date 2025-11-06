import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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
            Política de Privacidad
          </h1>
          <p className="text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introducción
            </h2>
            <p className="text-gray-700 leading-relaxed">
              En Regalo Anónimo Familiar, nos tomamos muy en serio la privacidad de nuestros
              usuarios. Esta Política de Privacidad explica cómo recopilamos, utilizamos,
              divulgamos y protegemos su información cuando utiliza nuestro servicio de
              intercambio de regalos y amigo invisible.
            </p>
          </section>

          {/* Sección 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Información que Recopilamos
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
              1.1 Información que Usted Proporciona
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Recopilamos información que usted nos proporciona directamente, incluyendo:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Nombre y apellidos</li>
              <li>Dirección de correo electrónico</li>
              <li>Información de perfil (foto, preferencias de regalo)</li>
              <li>Información sobre grupos que crea o a los que se une</li>
              <li>Listas de deseos y preferencias de regalos</li>
              <li>Mensajes y comunicaciones dentro de la plataforma</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
              1.2 Información Recopilada Automáticamente
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Cuando utiliza nuestro servicio, recopilamos automáticamente:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Información del dispositivo (tipo, sistema operativo, navegador)</li>
              <li>Dirección IP y datos de ubicación general</li>
              <li>Datos de uso y actividad en la plataforma</li>
              <li>Cookies y tecnologías similares</li>
              <li>Registros del servidor (fecha y hora de acceso, páginas visitadas)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">
              1.3 Información de Terceros
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Si se registra o inicia sesión utilizando un servicio de terceros (como Google
              o Instagram), podemos recibir información de su perfil según lo permita ese
              servicio y sus configuraciones de privacidad.
            </p>
          </section>

          {/* Sección 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Cómo Utilizamos su Información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Proporcionar, mantener y mejorar nuestro servicio</li>
              <li>Crear y gestionar su cuenta de usuario</li>
              <li>Procesar y facilitar sorteos de amigo invisible</li>
              <li>Permitir la comunicación entre usuarios del servicio</li>
              <li>Enviar notificaciones sobre su cuenta y actividad de grupos</li>
              <li>Responder a sus solicitudes de soporte y comunicaciones</li>
              <li>Detectar, prevenir y abordar problemas técnicos y de seguridad</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Analizar y mejorar la experiencia del usuario</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Compartir su Información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Podemos compartir su información en las siguientes circunstancias:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Con otros usuarios:</strong> Cierta información (nombre, listas de
                deseos) se comparte con otros miembros de sus grupos
              </li>
              <li>
                <strong>Con proveedores de servicios:</strong> Compartimos información con
                terceros que nos ayudan a operar nuestro servicio (hosting, análisis, soporte)
              </li>
              <li>
                <strong>Por requerimiento legal:</strong> Si es requerido por ley o en
                respuesta a procesos legales válidos
              </li>
              <li>
                <strong>Para proteger derechos:</strong> Para proteger los derechos,
                propiedad o seguridad de nuestra empresa, usuarios o el público
              </li>
              <li>
                <strong>Con su consentimiento:</strong> En cualquier otra situación con su
                consentimiento explícito
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>No vendemos</strong> su información personal a terceros.
            </p>
          </section>

          {/* Sección 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Seguridad de la Información
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas razonables para
              proteger su información personal contra acceso no autorizado, alteración,
              divulgación o destrucción. Estas medidas incluyen:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>Encriptación de datos en tránsito y en reposo</li>
              <li>Controles de acceso y autenticación</li>
              <li>Monitoreo regular de seguridad</li>
              <li>Evaluaciones periódicas de riesgos</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Sin embargo, ningún método de transmisión por Internet o almacenamiento
              electrónico es 100% seguro, por lo que no podemos garantizar la seguridad
              absoluta de su información.
            </p>
          </section>

          {/* Sección 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Retención de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Conservamos su información personal solo durante el tiempo necesario para
              cumplir con los propósitos descritos en esta política, a menos que la ley
              requiera o permita un período de retención más largo. Cuando elimina su cuenta,
              eliminamos o anonimizamos su información personal, excepto cuando debemos
              conservarla por obligaciones legales.
            </p>
          </section>

          {/* Sección 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Sus Derechos de Privacidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Dependiendo de su ubicación, puede tener los siguientes derechos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Acceso:</strong> Solicitar acceso a su información personal
              </li>
              <li>
                <strong>Corrección:</strong> Solicitar la corrección de información inexacta
              </li>
              <li>
                <strong>Eliminación:</strong> Solicitar la eliminación de su información
              </li>
              <li>
                <strong>Portabilidad:</strong> Solicitar una copia de su información en
                formato estructurado
              </li>
              <li>
                <strong>Objeción:</strong> Objetar ciertos procesamientos de su información
              </li>
              <li>
                <strong>Restricción:</strong> Solicitar la restricción del procesamiento
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Para ejercer estos derechos, puede acceder a la configuración de su cuenta o
              contactarnos directamente.
            </p>
          </section>

          {/* Sección 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Cookies y Tecnologías de Seguimiento
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mantener su sesión activa</li>
              <li>Recordar sus preferencias</li>
              <li>Analizar el uso del servicio</li>
              <li>Mejorar la funcionalidad y experiencia del usuario</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Puede configurar su navegador para rechazar cookies, aunque esto puede afectar
              la funcionalidad del servicio.
            </p>
          </section>

          {/* Sección 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Privacidad de Menores
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nuestro servicio no está dirigido a menores de 13 años. No recopilamos
              conscientemente información personal de niños menores de 13 años. Si descubrimos
              que hemos recopilado información de un menor de 13 años, tomaremos medidas para
              eliminar esa información lo antes posible.
            </p>
          </section>

          {/* Sección 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Transferencias Internacionales
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Su información puede ser transferida y mantenida en servidores ubicados fuera
              de su país de residencia. Al utilizar nuestro servicio, usted consiente la
              transferencia de información a estos países, que pueden tener leyes de
              protección de datos diferentes a las de su país.
            </p>
          </section>

          {/* Sección 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Enlaces a Otros Sitios
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nuestro servicio puede contener enlaces a sitios web de terceros. No somos
              responsables de las prácticas de privacidad de estos sitios. Le recomendamos
              que lea las políticas de privacidad de cualquier sitio web de terceros que visite.
            </p>
          </section>

          {/* Sección 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Cambios a esta Política
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos
              sobre cambios significativos publicando la nueva política en esta página y
              actualizando la fecha de "Última actualización". Le recomendamos que revise esta
              política periódicamente para estar informado sobre cómo protegemos su información.
            </p>
          </section>

          {/* Sección 12 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Si tiene preguntas sobre esta Política de Privacidad o sobre nuestras prácticas
              de privacidad, puede contactarnos a través del formulario de contacto en nuestro
              sitio web o en la sección de configuración de su cuenta.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              También puede consultar nuestros{' '}
              <Link to="/terms-of-service" className="text-purple-600 hover:text-purple-700 font-medium">
                Términos de Servicio
              </Link>
              {' '}para obtener más información sobre el uso de nuestro servicio.
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
