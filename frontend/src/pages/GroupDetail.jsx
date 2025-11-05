import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI, giftAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import GiftCard from '../components/GiftCard';
import ThemeDecorations from '../components/ThemeDecorations';

export default function GroupDetail() {
  const { codigoUrl } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('wishlist');
  const [myGifts, setMyGifts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGift, setShowAddGift] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    url: '',
  });
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    nombreGrupo: '',
    tipoCelebracion: '',
    fechaInicio: '',
  });
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    loadGroup();
  }, [codigoUrl]);

  useEffect(() => {
    if (group) {
      setTheme(group.tipo_celebracion);
      if (group.is_member) {
        loadMyGifts();
        loadWishlist();
      }
    }
  }, [group]);

  const loadGroup = async () => {
    try {
      const response = await groupAPI.getByCode(codigoUrl);
      setGroup(response.data.group);
    } catch (error) {
      console.error('Failed to load group:', error);
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const loadMyGifts = async () => {
    if (!group) return;
    try {
      const response = await giftAPI.getMyGifts(group.id);
      setMyGifts(response.data.gifts);
    } catch (error) {
      console.error('Failed to load my gifts:', error);
    }
  };

  const loadWishlist = async () => {
    if (!group) return;
    try {
      const response = await giftAPI.getWishlist(group.id);
      setWishlist(response.data.gifts);
      setWishlistMessage(response.data.message || '');
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      await groupAPI.join(codigoUrl);
      loadGroup();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al unirse al grupo');
    }
  };

  const handleAddGift = async (e) => {
    e.preventDefault();
    try {
      if (editingGift) {
        await giftAPI.update(editingGift.id, formData);
      } else {
        await giftAPI.create({ ...formData, grupoId: group.id });
      }
      setShowAddGift(false);
      setEditingGift(null);
      setFormData({ nombre: '', descripcion: '', url: '' });
      loadMyGifts();
      loadWishlist();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar regalo');
    }
  };

  const handleEditGift = (gift) => {
    setEditingGift(gift);
    setFormData({
      nombre: gift.nombre,
      descripcion: gift.descripcion || '',
      url: gift.url || '',
    });
    setShowAddGift(true);
  };

  const handleDeleteGift = async (giftId) => {
    if (!confirm('¿Estás seguro de eliminar este regalo?')) return;
    try {
      await giftAPI.delete(giftId);
      loadMyGifts();
      loadWishlist();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar regalo');
    }
  };

  const handleBuyGift = async (giftId) => {
    if (!confirm('¿Confirmas que vas a comprar este regalo?')) return;
    try {
      await giftAPI.markAsBought(giftId);
      loadWishlist();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al marcar como comprado');
    }
  };

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/group/${codigoUrl}`;

    try {
      // Try using the modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } else {
        // Fallback method for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 3000);
        } catch (err) {
          alert('Error al copiar el enlace. Por favor, cópialo manualmente: ' + link);
        }

        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Error al copiar el enlace. Por favor, cópialo manualmente: ' + link);
    }
  };

  const handleEditGroup = () => {
    setGroupFormData({
      nombreGrupo: group.nombre_grupo,
      tipoCelebracion: group.tipo_celebracion,
      fechaInicio: new Date(group.fecha_inicio).toISOString().split('T')[0],
    });
    setShowEditGroup(true);
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupAPI.update(group.id, groupFormData);
      setShowEditGroup(false);
      loadGroup(); // Reload to get updated data
    } catch (error) {
      alert(error.response?.data?.error || 'Error al actualizar grupo');
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

  if (!group) {
    return null;
  }

  if (!group.is_member) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center px-4`}>
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{group.nombre_grupo}</h1>
          <p className="text-gray-600 mb-2">{group.tipo_celebracion}</p>
          <p className="text-gray-500 mb-6">
            Fecha: {new Date(group.fecha_inicio).toLocaleDateString('es-ES')}
          </p>
          <button
            onClick={handleJoinGroup}
            className={`${theme.primary} text-white px-6 py-3 rounded-md font-medium w-full`}
          >
            Unirse al Grupo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} py-8 relative`}>
      <ThemeDecorations icons={theme.icons} bgStyle={theme.bgStyle} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.nombre_grupo}</h1>
              <p className="text-gray-600">{group.tipo_celebracion}</p>
              <p className="text-gray-500 text-sm">
                Fecha: {new Date(group.fecha_inicio).toLocaleDateString('es-ES')}
              </p>
              <p className="text-gray-500 text-sm">Miembros: {group.member_count}</p>
            </div>
            <div className="flex gap-2">
              {user && user.id === group.creator_id && (
                <button
                  onClick={handleEditGroup}
                  className={`${theme.primary} text-white px-4 py-2 rounded-md text-sm transition-colors`}
                >
                  ✏️ Editar Grupo
                </button>
              )}
              <button
                onClick={copyInviteLink}
                className={`${copySuccess ? 'bg-green-600 hover:bg-green-700' : theme.secondary} text-white px-4 py-2 rounded-md text-sm transition-colors`}
              >
                {copySuccess ? '✓ Enlace copiado!' : '📋 Copiar enlace de invitación'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === 'wishlist'
                  ? `${theme.accent} border-b-2 border-current`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Lista de Deseos del Grupo
            </button>
            <button
              onClick={() => setActiveTab('myGifts')}
              className={`flex-1 px-6 py-4 font-medium ${
                activeTab === 'myGifts'
                  ? `${theme.accent} border-b-2 border-current`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mis Regalos
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Lista Anónima de Regalos
                </h2>
                {wishlistMessage && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                    {wishlistMessage}
                  </div>
                )}
                {wishlist.length === 0 ? (
                  <p className="text-gray-600">No hay regalos disponibles aún</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((gift) => (
                      <GiftCard
                        key={gift.id}
                        gift={gift}
                        onBuy={handleBuyGift}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'myGifts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Mis Regalos</h2>
                  <button
                    onClick={() => {
                      setEditingGift(null);
                      setFormData({ nombre: '', descripcion: '', url: '' });
                      setShowAddGift(true);
                    }}
                    className={`${theme.primary} text-white px-4 py-2 rounded-md font-medium`}
                  >
                    + Añadir Regalo
                  </button>
                </div>

                {myGifts.length === 0 ? (
                  <p className="text-gray-600">No has añadido regalos aún</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myGifts.map((gift) => (
                      <GiftCard
                        key={gift.id}
                        gift={gift}
                        onEdit={handleEditGift}
                        onDelete={handleDeleteGift}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Gift Modal */}
        {showAddGift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingGift ? 'Editar Regalo' : 'Añadir Regalo'}
              </h2>

              <form onSubmit={handleAddGift} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Regalo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL del Producto
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se intentará extraer la imagen automáticamente
                  </p>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddGift(false);
                      setEditingGift(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 ${theme.primary} text-white px-4 py-2 rounded-md font-medium`}
                  >
                    {editingGift ? 'Guardar' : 'Añadir'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Group Modal */}
        {showEditGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Editar Grupo
              </h2>

              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Grupo *
                  </label>
                  <input
                    type="text"
                    value={groupFormData.nombreGrupo}
                    onChange={(e) => setGroupFormData({ ...groupFormData, nombreGrupo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Celebración *
                  </label>
                  <select
                    value={groupFormData.tipoCelebracion}
                    onChange={(e) => setGroupFormData({ ...groupFormData, tipoCelebracion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Navidad">🎄 Navidad</option>
                    <option value="Reyes Magos">👑 Reyes Magos</option>
                    <option value="Boda">💒 Boda</option>
                    <option value="Cumpleaños">🎂 Cumpleaños</option>
                    <option value="Otro">🎁 Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={groupFormData.fechaInicio}
                    onChange={(e) => setGroupFormData({ ...groupFormData, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditGroup(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 ${theme.primary} text-white px-4 py-2 rounded-md font-medium`}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
