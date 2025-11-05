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

## Docker Deployment

### Using Pre-built Images from GitHub Container Registry

The project automatically builds Docker images via GitHub Actions and publishes them to GitHub Container Registry (ghcr.io).

#### Creating a docker-compose.yml file

Create a `docker-compose.yml` file in the root directory with the following content:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: secret-wishlist-db
    environment:
      POSTGRES_DB: secret_wishlist
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_secure_password_here
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - wishlist-network

  backend:
    image: ghcr.io/ndsrf/regalo-anonimo-familiar/backend:latest
    container_name: secret-wishlist-backend
    environment:
      PORT: 5000
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: secret_wishlist
      DB_USER: postgres
      DB_PASSWORD: your_secure_password_here
      JWT_SECRET: your_very_long_random_secret_key_here_at_least_32_characters
      JWT_EXPIRES_IN: 7d
      GOOGLE_CLIENT_ID: your_google_client_id
      GOOGLE_CLIENT_SECRET: your_google_client_secret
      GOOGLE_CALLBACK_URL: http://localhost:5000/auth/google/callback
      FRONTEND_URL: http://localhost
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    networks:
      - wishlist-network

  frontend:
    image: ghcr.io/ndsrf/regalo-anonimo-familiar/frontend:latest
    container_name: secret-wishlist-frontend
    environment:
      VITE_API_URL: http://localhost:5000
    ports:
      - "80:80"
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    networks:
      - wishlist-network

volumes:
  postgres_data:
    driver: local

networks:
  wishlist-network:
    driver: bridge
```

#### Environment Variables Setup

Before running docker-compose, make sure to update the following values in the `docker-compose.yml`:

1. **Database Password**: Replace `your_secure_password_here` with a strong password
2. **JWT Secret**: Replace `your_very_long_random_secret_key_here_at_least_32_characters` with a random string (at least 32 characters)
3. **Google OAuth Credentials**:
   - Replace `your_google_client_id` with your Google OAuth Client ID
   - Replace `your_google_client_secret` with your Google OAuth Client Secret
   - Update `GOOGLE_CALLBACK_URL` if deploying to a different domain

#### Running the Application

```bash
# Pull the latest images
docker-compose pull

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

The application will be accessible at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432

### Building Images Locally

If you prefer to build the Docker images locally instead of using pre-built ones:

```bash
# Build and run with local images
docker-compose -f docker-compose.local.yml up -d --build
```

Create a `docker-compose.local.yml` file with the same content as above, but replace the `image` lines with:

```yaml
# For backend service:
    build:
      context: ./backend
      dockerfile: Dockerfile

# For frontend service:
    build:
      context: ./frontend
      dockerfile: Dockerfile
```

### GitHub Actions

The project includes a GitHub Actions workflow that automatically builds and pushes Docker images to GitHub Container Registry when code is pushed to the main branch. The workflow builds both `linux/amd64` and `linux/arm64` platforms.

Images are tagged as:
- `latest` - Latest build from the main branch
- `<branch-name>` - Builds from specific branches
- `<sha>` - Builds with commit SHA tags
