// Map frontend language-independent keys to backend Spanish enum values
export const GAME_MODE_MAP = {
  'anonymous': 'Lista de Deseos Anónimos',
  'secretSanta': 'Amigo Invisible'
};

// Note: 'anniversary' maps to 'Otro' as there's no specific anniversary type in backend
export const TIPO_CELEBRACION_MAP = {
  'christmas': 'Navidad',
  'birthday': 'Cumpleaños',
  'anniversary': 'Otro',
  'wedding': 'Boda',
  'other': 'Otro'
};

// Reverse mappings: Spanish backend values to English translation keys
export const GAME_MODE_REVERSE_MAP = {
  'Lista de Deseos Anónimos': 'anonymous',
  'Amigo Invisible': 'secretSanta'
};

export const TIPO_CELEBRACION_REVERSE_MAP = {
  'Navidad': 'christmas',
  'Reyes Magos': 'reyesMagos', // Use specific key
  'Boda': 'wedding',
  'Cumpleaños': 'birthday',
  'Otro': 'other'
};
