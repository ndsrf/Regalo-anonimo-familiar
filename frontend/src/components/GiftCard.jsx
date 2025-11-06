import { useTheme } from '../context/ThemeContext';

export default function GiftCard({ gift, onEdit, onDelete, onBuy, onUnbuy, showActions = true, currentUserId, isWishlistView = false }) {
  const { theme } = useTheme();
  const isPurchasedByMe = gift.comprador_id && gift.comprador_id === currentUserId;
  const isPurchasedByOther = gift.comprador_id && gift.comprador_id !== currentUserId;

  // Solo mostrar tags en la wishlist, nunca en "Mis Regalos"
  const showPurchaseTags = isWishlistView;

  return (
    <div className={`${theme.card} border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${(showPurchaseTags && (isPurchasedByMe || isPurchasedByOther)) ? 'relative' : ''}`}>
      {showPurchaseTags && isPurchasedByMe && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
            ✓ Comprado por mí
          </span>
        </div>
      )}
      {showPurchaseTags && isPurchasedByOther && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
            ✓ Comprado por otro/a
          </span>
        </div>
      )}

      {gift.image_url && (
        <img
          src={gift.image_url}
          alt={gift.nombre}
          className={`w-full h-48 object-cover ${(showPurchaseTags && (isPurchasedByMe || isPurchasedByOther)) ? 'opacity-75' : ''}`}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{gift.nombre}</h3>

        {gift.descripcion && (
          <p className="text-gray-600 text-sm mb-3">{gift.descripcion}</p>
        )}

        {gift.url && (
          <a
            href={gift.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${theme.accent} hover:underline text-sm block mb-3`}
          >
            Ver producto →
          </a>
        )}

        {showActions && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <button
                onClick={() => onEdit(gift)}
                className={`${theme.secondary} text-white px-3 py-1 rounded text-sm flex-1`}
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(gift.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex-1"
              >
                Eliminar
              </button>
            )}
            {onBuy && !(showPurchaseTags && isPurchasedByOther) && (
              <button
                onClick={() => isPurchasedByMe ? onUnbuy(gift.id) : onBuy(gift.id)}
                className={`${isPurchasedByMe ? 'bg-yellow-500 hover:bg-yellow-600' : theme.primary} text-white px-4 py-2 rounded font-medium w-full`}
              >
                {isPurchasedByMe ? 'Desmarcar como comprado' : 'Marcar como comprado'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
