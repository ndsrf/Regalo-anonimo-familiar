# Secret Wishlist - Lista de Deseos Secreta

Aplicación web para gestionar listas de deseos anónimas en grupos familiares o de amigos.

## Stack Tecnológico

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT + Google OAuth 2.0

## Características

- Autenticación con email/contraseña y Google OAuth
- Creación y gestión de grupos
- Listas de deseos anónimas
- Sistema de notificaciones
- Tematización según tipo de celebración
- Scraping automático de imágenes de productos

## Configuración

### Base de Datos

1. Crear una base de datos PostgreSQL
2. Ejecutar el script `database/init.sql`

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar las variables de entorno
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

Ver `backend/.env.example` para las variables requeridas.
