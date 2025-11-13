import { useState } from 'react';

export default function EmailInviteModal({ isOpen, onClose, onSend, groupName }) {
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      alert('Por favor ingresa al menos un correo electrónico');
      return;
    }

    setLoading(true);
    try {
      await onSend(emailInput);
      setEmailInput('');
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invitar por correo electrónico</h2>
              <p className="text-sm text-gray-600 mt-1">Grupo: {groupName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              disabled={loading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correos electrónicos
              </label>
              <textarea
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Ingresa los correos electrónicos aquí. Puedes usar varios formatos:&#10;&#10;• email@ejemplo.com&#10;• Nombre <email@ejemplo.com>&#10;• Separados por comas, espacios o saltos de línea&#10;&#10;Ejemplo:&#10;Juan Pérez <juan@ejemplo.com>, maria@ejemplo.com&#10;pedro@ejemplo.com"
                rows="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Máximo 10 invitaciones por vez (configurable)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">📧 Tipos de invitación:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  <strong>Usuarios existentes:</strong> Recibirán un correo para unirse directamente al
                  grupo.
                </li>
                <li>
                  <strong>Usuarios nuevos:</strong> Recibirán un enlace mágico para registrarse y unirse
                  automáticamente.
                </li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Enviando...' : '📤 Enviar invitaciones'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
