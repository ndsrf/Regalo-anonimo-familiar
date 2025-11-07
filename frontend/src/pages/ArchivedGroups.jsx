import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function ArchivedGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    loadArchivedGroups();
  }, []);

  const loadArchivedGroups = async () => {
    try {
      const response = await groupAPI.getArchivedGroups();
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Failed to load archived groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grupos Archivados</h1>
            <p className="text-gray-600 mt-2">
              Estos grupos están archivados y no se pueden modificar
            </p>
          </div>
          <Link
            to="/groups"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Volver a Mis Grupos
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 mb-4">No tienes grupos archivados</p>
            <Link
              to="/groups"
              className={`${theme.primary} text-white px-6 py-3 rounded-md font-medium inline-block`}
            >
              Ir a Mis Grupos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/group/${group.codigo_url}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-yellow-400"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{group.nombre_grupo}</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                    Archivado
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{group.tipo_celebracion}</p>
                  <p className="text-purple-600 font-medium">
                    {group.game_mode === 'Amigo Invisible' ? '🎭 Amigo Invisible' : '🎁 Lista de Deseos'}
                  </p>
                  <p>Fecha: {new Date(group.fecha_inicio).toLocaleDateString('es-ES')}</p>
                  <p>Miembros: {group.member_count}</p>
                  <p className="text-xs text-gray-500 italic">Creado por: {group.creator_name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
