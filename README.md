# Secret Wishlist - Lista de Deseos Secreta

Aplicación web para gestionar listas de deseos anónimas en grupos familiares o de amigos.

## Stack Tecnológico

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT + Google OAuth 2.0 + Meta (Instagram) OAuth

## Características

- Autenticación con email/contraseña, Google OAuth y Meta (Instagram) OAuth
- Creación y gestión de grupos
- Listas de deseos anónimas
- Sistema de notificaciones
- Tematización según tipo de celebración
- Scraping automático de imágenes de productos

## Configuración

### Base de Datos

La base de datos se inicializa automáticamente cuando el backend arranca. El sistema de migraciones:
- Crea todas las tablas necesarias en el primer arranque
- Ejecuta migraciones pendientes automáticamente
- Mantiene un registro de versiones aplicadas

No es necesario ejecutar scripts SQL manualmente. Ver [Documentación de Migraciones](backend/src/migrations/README.md) para más detalles.

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar las variables de entorno
npm run dev
```

Para crear una nueva migración de base de datos:
```bash
npm run migration:create <description>
# Ejemplo: npm run migration:create add_user_avatar
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

> **Note**: This project uses Docker Compose v2 syntax. Make sure you have Docker Compose v2 installed. You can verify with `docker compose version`. If you're using the older v1, please upgrade or use `docker-compose` commands instead.

### Using Pre-built Images from GitHub Container Registry

The project automatically builds Docker images via GitHub Actions and publishes them to GitHub Container Registry (ghcr.io).

#### Creating a docker-compose.yml file

Create a `docker-compose.yml` file in the root directory with the following content:

```yaml
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
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

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
      GOOGLE_CALLBACK_URL: http://localhost/auth/google/callback
      META_APP_ID: your_meta_app_id
      META_APP_SECRET: your_meta_app_secret
      META_CALLBACK_URL: http://localhost/auth/meta/callback
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
    restart: unless-stopped
    networks:
      - wishlist-network
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

  frontend:
    image: ghcr.io/ndsrf/regalo-anonimo-familiar/frontend:latest
    container_name: secret-wishlist-frontend
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
    restart: unless-stopped
    networks:
      - wishlist-network
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

  watchtower:
    image: containrrr/watchtower:latest
    container_name: secret-wishlist-watchtower
    environment:
      WATCHTOWER_CLEANUP: "true"
      WATCHTOWER_LABEL_ENABLE: "true"
      WATCHTOWER_INCLUDE_RESTARTING: "true"
      WATCHTOWER_POLL_INTERVAL: 300
      WATCHTOWER_ROLLING_RESTART: "true"
      TZ: Europe/Madrid
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - wishlist-network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local

networks:
  wishlist-network:
    driver: bridge
```

**Important Notes:**

- **API Proxy Configuration**: The frontend uses nginx as a reverse proxy. All requests to `/api/*` and `/auth/*` are automatically forwarded to the backend container. This means:
  - The frontend doesn't need to know the backend URL
  - No CORS configuration needed between services
  - The application works seamlessly when accessed from any domain
  - If deploying to a custom domain (e.g., `https://yourdomain.com`), update both `GOOGLE_CALLBACK_URL` and `FRONTEND_URL` accordingly

- **Backend Port Exposure**: The backend port `5000` is exposed for direct access if needed, but the frontend communicates with it through the nginx proxy on port 80.

#### Watchtower - Automatic Container Updates

The docker-compose configuration includes **Watchtower**, which automatically updates your containers when new images are available in GitHub Container Registry.

**Configuration:**
- **WATCHTOWER_CLEANUP**: Removes old images after updating
- **WATCHTOWER_LABEL_ENABLE**: Only monitors containers with the `com.centurylinklabs.watchtower.enable=true` label
- **WATCHTOWER_POLL_INTERVAL**: Checks for updates every 300 seconds (5 minutes)
- **WATCHTOWER_INCLUDE_RESTARTING**: Updates containers even if they're restarting
- **WATCHTOWER_ROLLING_RESTART**: Updates containers one at a time to ensure service availability

All application containers (postgres, backend, frontend) are labeled for automatic updates. When new images are pushed to GHCR via GitHub Actions, Watchtower will:
1. Pull the new image
2. Stop the old container
3. Start a new container with the updated image
4. Remove the old image

This ensures your deployment always runs the latest version without manual intervention.

**Note on Container Updates**: The frontend uses nginx with Docker's internal DNS resolver, which allows it to start even if the backend is temporarily unavailable during updates. Combined with restart policies (`restart: unless-stopped`), this ensures the application recovers automatically from transient failures during Watchtower updates.

#### Environment Variables Setup

Before running docker-compose, make sure to update the following values in the `docker-compose.yml`:

1. **Database Password**: Replace `your_secure_password_here` with a strong password
2. **JWT Secret**: Replace `your_very_long_random_secret_key_here_at_least_32_characters` with a random string (at least 32 characters)
3. **Google OAuth Credentials**:
   - Replace `your_google_client_id` with your Google OAuth Client ID
   - Replace `your_google_client_secret` with your Google OAuth Client Secret
   - Update `GOOGLE_CALLBACK_URL` if deploying to a different domain (e.g., `https://yourdomain.com/auth/google/callback`)
4. **Meta (Instagram) OAuth Credentials**:
   - Replace `your_meta_app_id` with your Meta App ID
   - Replace `your_meta_app_secret` with your Meta App Secret
   - Update `META_CALLBACK_URL` if deploying to a different domain (e.g., `https://yourdomain.com/auth/meta/callback`)
5. **Frontend URL**: Update `FRONTEND_URL` if deploying to a different domain (e.g., `https://yourdomain.com`)
6. **Timezone (Optional)**: Update `TZ` in the watchtower service to match your timezone (default: Europe/Madrid)

#### Running the Application

```bash
# Pull the latest images
docker compose pull

# Start all services
docker compose up -d

# View logs (all services)
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f watchtower

# Check Watchtower activity
docker compose logs watchtower

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker compose down -v
```

The application will be accessible at:
- **Frontend**: http://localhost
- **Backend API** (via nginx proxy): http://localhost/api
- **Backend API** (direct): http://localhost:5000
- **PostgreSQL**: localhost:5432

### Building Images Locally

If you prefer to build the Docker images locally instead of using pre-built ones:

```bash
# Build and run with local images
docker compose -f docker-compose.local.yml up -d --build
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
- `<branch-name>` - Builds from specific branches (e.g., `main`, `develop`)
- `sha-<commit-sha>` - Builds tagged with commit SHA (e.g., `sha-195eee0`)
- `pr-<number>` - Builds from pull requests
