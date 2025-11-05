import { useTheme } from '../context/ThemeContext';

export default function GiftCard({ gift, onEdit, onDelete, onBuy, showActions = true }) {
  const { theme } = useTheme();
  const isPurchasedByMe = gift.comprador_id !== null && gift.comprador_id !== undefined;

  return (
    <div className={`${theme.card} border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${isPurchasedByMe ? 'relative' : ''}`}>
      {isPurchasedByMe && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
            ✓ Comprado por mí
          </span>
        </div>
      )}

      {gift.image_url && (
        <img
          src={gift.image_url}
          alt={gift.nombre}
          className={`w-full h-48 object-cover ${isPurchasedByMe ? 'opacity-75' : ''}`}
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
            {onBuy && (
              <button
                onClick={() => !isPurchasedByMe && onBuy(gift.id)}
                disabled={isPurchasedByMe}
                className={`${isPurchasedByMe ? 'bg-gray-400 cursor-not-allowed' : theme.primary} text-white px-4 py-2 rounded font-medium w-full`}
              >
                {isPurchasedByMe ? 'Ya lo compraste' : 'Marcar como comprado'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
