# Implementación de Recuperación de Contraseña

## Resumen

Se ha implementado un sistema completo de recuperación de contraseña con soporte multi-idioma (español, inglés, francés y alemán) para la aplicación Regalo Anónimo Familiar.

## Características Implementadas

### 1. Base de Datos

**Migración 007**: Tabla de tokens de reset de contraseña
- `password_reset_tokens`: Almacena tokens seguros con expiración de 1 hora
- Incluye índices para optimizar búsquedas por token y user_id
- Tokens marcados como usados después de ser aplicados

**Migración 008**: Preferencia de idioma del usuario
- Agrega columna `preferred_language` a la tabla `users`
- Valores soportados: 'es', 'en', 'fr', 'de'
- Valor por defecto: 'es'

### 2. Backend - Nuevos Endpoints

#### POST `/auth/forgot-password`
Solicita el reset de contraseña enviando un correo con un token.

**Request:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (siempre exitoso por seguridad):**
```json
{
  "success": true,
  "message": "Si el email existe en nuestro sistema, recibirás un correo..."
}
```

**Características de seguridad:**
- No revela si el email existe en el sistema (previene enumeración)
- Solo funciona con usuarios que tienen contraseña (no OAuth)
- Token seguro de 32 bytes generado con crypto.randomBytes
- Expiración de 1 hora

#### POST `/auth/reset-password`
Restablece la contraseña usando el token recibido por email.

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "nuevaContraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente..."
}
```

**Validaciones:**
- Token válido y no usado
- Token no expirado
- Contraseña mínimo 6 caracteres
- Invalida todos los demás tokens del usuario al resetear

#### GET `/auth/reset-token/:token`
Verifica si un token es válido (opcional, para UX del frontend).

**Response:**
```json
{
  "valid": true,
  "email": "usuario@ejemplo.com"
}
```

### 3. Sistema de Correos Multi-idioma

El método `sendPasswordResetEmail` en `emailService.js` ahora soporta 4 idiomas:

**Idiomas soportados:**
- 🇪🇸 Español (es) - Por defecto
- 🇬🇧 Inglés (en)
- 🇫🇷 Francés (fr)
- 🇩🇪 Alemán (de)

**Ejemplo de uso:**
```javascript
await emailService.sendPasswordResetEmail({
  to: 'usuario@ejemplo.com',
  name: 'Juan',
  token: 'abc123...',
  language: 'es' // o 'en', 'fr', 'de'
});
```

**Plantilla del correo:**
- Diseño HTML responsive
- Versión texto plano incluida
- Botón call-to-action prominente
- Advertencia de seguridad sobre expiración
- Instrucciones claras en el idioma del usuario

### 4. Flujo de Usuario

1. **Usuario olvida contraseña:**
   - Hace clic en "¿Olvidaste tu contraseña?" en login
   - Ingresa su email
   - Frontend llama a `POST /auth/forgot-password`

2. **Sistema procesa solicitud:**
   - Busca usuario por email
   - Verifica que tenga contraseña (no sea OAuth-only)
   - Genera token seguro
   - Guarda token en DB con expiración de 1 hora
   - Envía email en el idioma preferido del usuario

3. **Usuario recibe email:**
   - Correo con asunto en su idioma
   - Botón para resetear contraseña
   - Link con token: `{FRONTEND_URL}/reset-password?token={token}`

4. **Usuario crea nueva contraseña:**
   - Hace clic en el link del email
   - Frontend muestra formulario de nueva contraseña
   - Frontend llama a `POST /auth/reset-password`
   - Sistema valida token y actualiza contraseña
   - Invalida todos los tokens pendientes del usuario

5. **Usuario inicia sesión:**
   - Puede usar su nueva contraseña inmediatamente

## Archivos Modificados/Creados

### Nuevos archivos:
- `backend/src/migrations/007_add_password_reset_tokens.sql`
- `backend/src/migrations/008_add_user_language_preference.sql`
- `backend/.env` (para desarrollo)

### Archivos modificados:
- `backend/src/services/emailService.js`
  - Agregado método `sendPasswordResetEmail()` con soporte i18n

- `backend/src/controllers/authController.js`
  - Agregado `forgotPassword()`
  - Agregado `resetPassword()`
  - Agregado `verifyResetToken()`

- `backend/src/routes/auth.js`
  - Agregadas rutas de password reset

## Seguridad Implementada

1. **Prevención de enumeración de emails:**
   - Siempre retorna éxito, incluso si el email no existe

2. **Tokens seguros:**
   - Generados con `crypto.randomBytes(32)` (256 bits de entropía)
   - Únicos y no predecibles

3. **Expiración corta:**
   - 1 hora de validez para minimizar ventana de ataque

4. **Tokens de un solo uso:**
   - Marcados como usados después de resetear
   - Todos los tokens del usuario invalidados al resetear

5. **Validación de contraseña:**
   - Mínimo 6 caracteres
   - Hasheada con bcrypt (10 rounds)

6. **Protección de usuarios OAuth:**
   - No permite reset para usuarios sin contraseña (Google/Meta)

## Próximos Pasos (Frontend)

Para completar la implementación, el frontend necesita:

1. **Página "Forgot Password":**
   ```jsx
   // /forgot-password
   - Formulario con input de email
   - Llamada a POST /auth/forgot-password
   - Mensaje de confirmación
   ```

2. **Página "Reset Password":**
   ```jsx
   // /reset-password?token=...
   - Obtener token de URL query params
   - Verificar token con GET /auth/reset-token/:token
   - Formulario para nueva contraseña
   - Validación de contraseña (mínimo 6 caracteres)
   - Confirmación de contraseña
   - Llamada a POST /auth/reset-password
   - Redirección a login con mensaje de éxito
   ```

3. **Link en Login:**
   ```jsx
   <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
   ```

4. **Traducciones i18n:**
   Agregar keys en los archivos de traducción del frontend:
   ```json
   {
     "forgotPassword": {
       "title": "Recuperar contraseña",
       "email": "Correo electrónico",
       "submit": "Enviar instrucciones",
       "success": "Si el email existe...",
       "backToLogin": "Volver a iniciar sesión"
     },
     "resetPassword": {
       "title": "Crear nueva contraseña",
       "newPassword": "Nueva contraseña",
       "confirmPassword": "Confirmar contraseña",
       "submit": "Restablecer contraseña",
       "success": "¡Contraseña actualizada!",
       "invalidToken": "Token inválido o expirado",
       "passwordMismatch": "Las contraseñas no coinciden"
     }
   }
   ```

## Testing

Para probar la funcionalidad:

1. **Iniciar servicios:**
   ```bash
   # PostgreSQL debe estar corriendo
   # Las migraciones se aplicarán automáticamente
   cd backend
   npm start
   ```

2. **Configurar Mailgun (opcional):**
   - Sin Mailgun, los emails se registran en consola
   - Para emails reales, agregar a `.env`:
     ```
     MAILGUN_API_KEY=tu_api_key
     MAILGUN_DOMAIN=tu_dominio.com
     MAILGUN_FROM_EMAIL=noreply@tu_dominio.com
     ```

3. **Probar endpoints:**
   ```bash
   # Solicitar reset
   curl -X POST http://localhost:5000/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'

   # Verificar token
   curl http://localhost:5000/auth/reset-token/TOKEN_AQUI

   # Resetear contraseña
   curl -X POST http://localhost:5000/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"TOKEN_AQUI","newPassword":"newpass123"}'
   ```

## Notas Adicionales

- Las migraciones se ejecutan automáticamente al iniciar el servidor
- El sistema es compatible con la arquitectura existente
- No afecta usuarios OAuth (Google/Meta)
- Los correos usan las mismas plantillas HTML que el resto de la app
- El idioma del usuario se detecta de su perfil (column `preferred_language`)

## Mantenimiento Futuro

Considera agregar:
- Límite de rate-limiting para prevenir spam (ej: 3 intentos por hora)
- Log de intentos de reset para auditoría
- Notificación al usuario si se resetea su contraseña
- Opción de "recordar este dispositivo" para reducir resets
