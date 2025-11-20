import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { groupAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function Groups() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [formData, setFormData] = useState({
    nombreGrupo: '',
    gameMode: 'anonymous',
    tipoCelebracion: 'christmas',
    fechaInicio: '',
  });
  const { theme } = useTheme();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await groupAPI.getMyGroups();
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowMembers = async (group, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedGroup(group);
    setShowMembersModal(true);
    setLoadingMembers(true);
    try {
      const response = await groupAPI.getMembers(group.id);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Failed to load members:', error);
      alert(t('groups.errors.fetchGroups'));
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupAPI.create(formData);
      setShowCreateModal(false);
      setFormData({
        nombreGrupo: '',
        gameMode: 'anonymous',
        tipoCelebracion: 'christmas',
        fechaInicio: '',
      });
      loadGroups();
    } catch (error) {
      alert(error.response?.data?.error || t('groups.errors.createGroup'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('groups.title')}</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`${theme.primary} text-white px-4 py-2 rounded-md font-medium`}
          >
            + {t('groups.createGroup')}
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{t('groups.noGroups')}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`${theme.primary} text-white px-6 py-3 rounded-md font-medium`}
            >
              {t('groups.createGroup')}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  to={`/group/${group.codigo_url}`}
                  className={`${theme.card} border rounded-lg p-6 hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{group.nombre_grupo}</h2>
                    <span className={`text-2xl`}>
                      {group.tipo_celebracion === 'christmas' && '🎄'}
                      {group.tipo_celebracion === 'Navidad' && '🎄'}
                      {group.tipo_celebracion === 'Reyes Magos' && '👑'}
                      {group.tipo_celebracion === 'wedding' && '💒'}
                      {group.tipo_celebracion === 'Boda' && '💒'}
                      {group.tipo_celebracion === 'birthday' && '🎂'}
                      {group.tipo_celebracion === 'Cumpleaños' && '🎂'}
                      {group.tipo_celebracion === 'anniversary' && '💐'}
                      {group.tipo_celebracion === 'other' && '🎁'}
                      {group.tipo_celebracion === 'Otro' && '🎁'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{t(`groups.eventTypes.${group.tipo_celebracion}`, group.tipo_celebracion)}</p>
                  <p className="text-gray-500 text-sm">
                    {t('groups.eventDate')}: {new Date(group.fecha_inicio).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {t('groups.members')}:{' '}
                    <button
                      onClick={(e) => handleShowMembers(group, e)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {group.member_count}
                    </button>
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center border-t pt-6">
              <Link
                to="/archived-groups"
                className="text-gray-600 hover:text-gray-800 underline text-sm flex items-center justify-center gap-2"
              >
                <span>📦</span>
                {t('groups.archivedGroups')}
              </Link>
            </div>
          </>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('groups.createGroup')}</h2>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('groups.groupName')}
                  </label>
                  <input
                    type="text"
                    value={formData.nombreGrupo}
                    onChange={(e) => setFormData({ ...formData, nombreGrupo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('groups.gameMode')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      ¿?
                    </button>
                  </div>
                  <select
                    value={formData.gameMode}
                    onChange={(e) => setFormData({ ...formData, gameMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="anonymous">{t('groups.gameModes.anonymous')}</option>
                    <option value="secretSanta">{t('groups.gameModes.secretSanta')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('groups.eventType')}
                  </label>
                  <select
                    value={formData.tipoCelebracion}
                    onChange={(e) => setFormData({ ...formData, tipoCelebracion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="christmas">🎄 {t('groups.eventTypes.christmas')}</option>
                    <option value="birthday">🎂 {t('groups.eventTypes.birthday')}</option>
                    <option value="anniversary">💐 {t('groups.eventTypes.anniversary')}</option>
                    <option value="wedding">💒 {t('groups.eventTypes.wedding')}</option>
                    <option value="other">🎁 {t('groups.eventTypes.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('groups.eventDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium"
                  >
                    {t('groupDetail.cancel')}
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 ${theme.primary} text-white px-4 py-2 rounded-md font-medium`}
                  >
                    {t('groups.createGroup')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Members Modal */}
        {showMembersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('groupDetail.members')}
              </h2>
              {selectedGroup && (
                <p className="text-gray-600 mb-4">{selectedGroup.nombre_grupo}</p>
              )}

              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">{t('common.loading')}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                    >
                      <p className="font-medium text-gray-900">{member.nombre}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowMembersModal(false);
                  setMembers([]);
                  setSelectedGroup(null);
                }}
                className="w-full mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        {/* Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Modos de Juego</h2>

              <div className="space-y-6">
                {/* Lista de Deseos Anónimos */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">🎁</span>
                    Lista de Deseos Anónimos
                  </h3>
                  <p className="text-gray-700 mb-2">
                    En este modo, los miembros del grupo pueden:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Crear su propia lista de regalos deseados</li>
                    <li>Ver una lista anónima de todos los regalos del grupo</li>
                    <li>Seleccionar qué regalos quieren comprar (sin revelar su identidad)</li>
                    <li>La lista de deseos se hace visible en la fecha de inicio del evento</li>
                  </ul>
                  <p className="text-gray-600 mt-2 italic">
                    Perfecto para eventos donde todos quieren sorprenderse mutuamente con regalos.
                  </p>
                </div>

                {/* Amigo Invisible */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">🎭</span>
                    Amigo Invisible
                  </h3>
                  <p className="text-gray-700 mb-2">
                    El clásico juego del Amigo Invisible (Secret Santa):
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Los miembros se unen al grupo hasta la fecha de inicio</li>
                    <li>El creador del grupo realiza el sorteo en la fecha de inicio</li>
                    <li>Cada persona es emparejada aleatoriamente con otra</li>
                    <li>Cada participante solo puede ver a quién le tocó regalar</li>
                    <li>Una vez hecho el sorteo, no se pueden unir más personas</li>
                    <li>Todos reciben un email informando de su emparejamiento</li>
                  </ul>
                  <p className="text-gray-600 mt-2 italic">
                    Ideal para eventos con presupuesto limitado donde cada persona solo regala a una persona específica.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
