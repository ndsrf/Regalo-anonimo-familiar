# Guía de Instalación - Lista de Deseos Secreta

## Requisitos Previos

- Node.js (versión 18 o superior)
- PostgreSQL (versión 12 o superior)
- npm o yarn

## Configuración de la Base de Datos

1. Crear una base de datos PostgreSQL:

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE secret_wishlist;

# Salir de psql
\q
```

2. Ejecutar el script de inicialización:

```bash
psql -U postgres -d secret_wishlist -f database/init.sql
```

## Configuración del Backend

1. Navegar al directorio del backend:

```bash
cd backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

4. Editar `.env` con tus configuraciones:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=secret_wishlist
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# JWT Configuration
JWT_SECRET=tu_secret_key_muy_segura_aqui
JWT_EXPIRES_IN=7d

# Google OAuth Configuration (opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

5. Iniciar el servidor:

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

El backend estará disponible en `http://localhost:5000`

## Configuración de Google OAuth (Opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Ve a "Credenciales" y crea credenciales OAuth 2.0
5. Añade las URIs de redirección autorizadas:
   - `http://localhost:5000/auth/google/callback`
   - Para producción: `https://tu-dominio.com/auth/google/callback`
6. Copia el Client ID y Client Secret a tu archivo `.env`

## Configuración del Frontend

1. Navegar al directorio del frontend:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. (Opcional) Crear archivo `.env` si tu API está en un dominio diferente:

```env
VITE_API_URL=http://localhost:5000
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

5. Para construir para producción:

```bash
npm run build
```

Los archivos construidos estarán en el directorio `dist/`

## Verificación de la Instalación

1. Abre tu navegador en `http://localhost:5173`
2. Deberías ver la página de inicio de "Lista de Deseos Secreta"
3. Crea una cuenta nueva usando el formulario de registro
4. Crea un grupo de prueba
5. Añade algunos regalos
6. Copia el enlace de invitación y ábrelo en una ventana de incógnito para simular otro usuario

## Resolución de Problemas

### Error de conexión a la base de datos

- Verifica que PostgreSQL esté ejecutándose
- Verifica las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `secret_wishlist` exista

### Error CORS

- Verifica que `FRONTEND_URL` en el backend `.env` coincida con la URL de tu frontend
- En desarrollo debería ser `http://localhost:5173`

### Google OAuth no funciona

- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que la URL de callback esté correctamente configurada en Google Cloud Console
- Verifica que la URI de redirección incluya el protocolo correcto (http/https)

### Las imágenes de productos no se cargan

- Algunas URLs pueden bloquear el scraping
- El scraping puede fallar si el sitio requiere JavaScript
- Las imágenes se intentan obtener de las meta tags `og:image` y `twitter:image`

## Estructura del Proyecto

```
Regalo-anonimo-familiar/
├── backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuración (DB, Passport)
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Middleware (autenticación)
│   │   ├── routes/         # Definición de rutas
│   │   └── utils/          # Utilidades (scraping, códigos)
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── context/       # Contextos de React (Auth, Theme)
│   │   └── services/      # Cliente API
│   └── package.json
├── database/              # Scripts SQL
│   └── init.sql          # Script de inicialización
└── README.md
```

## Despliegue en Producción

Para desplegar en producción, considera:

1. **Backend:**
   - Usar un servicio como Railway, Render, o Heroku
   - Configurar variables de entorno en el servicio
   - Usar una base de datos PostgreSQL gestionada
   - Configurar HTTPS

2. **Frontend:**
   - Construir con `npm run build`
   - Desplegar en Vercel, Netlify, o cualquier hosting estático
   - Configurar la variable `VITE_API_URL` con la URL de tu backend

3. **Base de Datos:**
   - Usar un servicio gestionado como:
     - AWS RDS
     - Google Cloud SQL
     - Heroku Postgres
     - Supabase

## Soporte

Para reportar problemas o solicitar características, por favor abre un issue en el repositorio de GitHub.
