# Prompt de Especificación: Aplicación Web de "Lista de Deseos Secreta"

**Rol:** Eres un desarrollador Full-Stack experto.

**Objetivo:** Generar el código completo para una aplicación web de "Lista de Deseos Secreta". La aplicación permite a los usuarios crear grupos, unirse a ellos anónimamente (con un enlace) y añadir regalos a su lista de deseos personal. Los demás miembros del grupo pueden ver una lista *totalmente anónima* de todos los regalos pedidos en el grupo (excepto los suyos propios) y marcar los regalos que han comprado, todo sin que el solicitante original sepa qué regalos le van a comprar.

**Stack Tecnológico Sugerido:**

* **Frontend:** React (con React Router para las URL) y Tailwind CSS.
* **Backend:** Node.js con Express.
* **Base de Datos:** PostgreSQL.
* **Autenticación:** JWT (para email/contraseña) y Passport.js (para Google OAuth 2.0).

---

## Requisitos Funcionales Detallados

### 1. Autenticación de Usuario

* Los usuarios deben poder registrarse usando **Email/Contraseña** (asegura el hash de la contraseña con `bcrypt`).
* Los usuarios deben poder iniciar sesión usando **Google OAuth 2.0**.
* La sesión debe gestionarse mediante **JSON Web Tokens (JWT)**.

### 2. Gestión de Grupos

* Un usuario autenticado puede **crear un Grupo**.
* Al crear el grupo, debe especificar:
    * `nombreGrupo`: (Ej. "Navidad Familia Pérez").
    * `tipoCelebracion`: Un dropdown (enum) con opciones: 'Navidad', 'Reyes Magos', 'Boda', 'Cumpleaños', 'Otro'.
    * `fechaInicio`: La fecha a partir de la cual la lista de regalos será visible para los miembros.
* Al crearse, el grupo debe generar un `codigoUrl` único (ej. `xyz123`).
* La URL para unirse al grupo será `https://[tu-dominio]/grupo/[codigoUrl]`.
* Cualquier usuario autenticado que tenga el enlace puede visitar la URL y unirse al grupo.

### 3. Gestión de Regalos (Lógica Personal)

* Un usuario que se ha unido a un grupo puede acceder a una sección "Mis Regalos" dentro de ese grupo.
* En esta sección, puede **Añadir un regalo** a su lista personal. El formulario debe tener:
    * `nombre` (string, requerido).
    * `descripcion` (texto, opcional).
    * `url` (string, opcional).
* El usuario **siempre** puede ver, editar y eliminar los regalos que *él mismo* ha añadido. (Ver Lógica de Notificaciones en la sección 5).

### 4. Lógica de la Lista de Deseos del Grupo (La Lógica Secreta)

* Dentro de la página del grupo, hay una "Lista de Deseos del Grupo".
* **Antes de la `fechaInicio`:** Esta lista debe estar oculta o mostrar una cuenta atrás.
* **Después de la `fechaInicio`:** La lista se hace visible y debe mostrar **todos los regalos** pedidos por **todos los miembros** del grupo, con las siguientes condiciones:
    1.  **Anonimato Total:** En ningún momento se debe mostrar quién pidió qué regalo. La lista debe estar mezclada (barajada).
    2.  **Exclusión Propia:** La lista *no* debe mostrar los regalos que el usuario *actual* ha pedido (para evitar que se compre sus propios regalos).
    3.  **Exclusión de Comprados:** La lista *no* debe mostrar regalos que ya han sido marcados como "comprados" (`compradorId IS NOT NULL`).
    4.  **Exclusión de Eliminados:** La lista *no* debe mostrar regalos que hayan sido eliminados por el solicitante (`isDeletedBySolicitante = true`).

### 5. Lógica de Compra y Notificaciones

**A. Marcar como Comprado:**

* En la "Lista de Deseos del Grupo", cada regalo (que no es tuyo) debe tener un botón: "Marcar como comprado".
* Cuando un Usuario A marca un Regalo X como "comprado":
    * Se actualiza `Gift.compradorId = UsuarioA.id` y `Gift.fechaCompra = NOW()`.
    * El Regalo X desaparece de la "Lista de Deseos del Grupo" para todos los demás miembros (basado en la Lógica 4.3).
    * **CRÍTICO:** El solicitante original del Regalo X (Usuario Z) **debe seguir viendo** el Regalo X en su lista personal ("Mis Regalos"). El estado "comprado" debe ser invisible para él, para mantener la sorpresa.

**B. Notificaciones por Edición o Eliminación (Nueva Lógica):**

* **Escenario:** El Usuario Z (solicitante) edita o elimina un regalo que el Usuario A (comprador) *ya había marcado como comprado*.
* **Backend - Lógica de EDICIÓN (`PUT /api/gift/:id`):**
    1.  Buscar el regalo.
    2.  Verificar que el usuario actual es el `solicitanteId`.
    3.  **Comprobar si `compradorId` NO es NULL.**
    4.  Si NO es NULL, crear una nueva entrada en la tabla `Notification` para el `compradorId` con un mensaje (ej. "¡Atención! El regalo '[nombre_regalo]' que habías comprado ha sido MODIFICADO por el solicitante.").
    5.  Proceder con la actualización del regalo.
* **Backend - Lógica de ELIMINACIÓN (`DELETE /api/gift/:id`):**
    1.  Buscar el regalo.
    2.  Verificar que el usuario actual es el `solicitanteId`.
    3.  **Comprobar si `compradorId` NO es NULL.**
    4.  Si NO es NULL (alguien lo compró):
        * Crear una nueva entrada en la tabla `Notification` para el `compradorId` (ej. "¡Atención! El regalo '[nombre_regalo]' que habías comprado ha sido ELIMINADO por el solicitante.").
        * **Hacer un *soft delete***: `UPDATE Gift SET isDeletedBySolicitante = true WHERE id = [id]`. (No borrar el registro).
    5.  Si es NULL (nadie lo compró):
        * Hacer un *hard delete*: `DELETE FROM Gift WHERE id = [id]`.
* **Frontend - Entrega de Notificación:**
    1.  Cuando un usuario carga la aplicación (en el componente principal/layout), hacer una llamada a `GET /api/notifications/unread`.
    2.  Si la API devuelve notificaciones, mostrar un **popup modal grande** (como se solicitó) con la lista de mensajes.
    3.  El popup debe tener un botón "Entendido" o "Marcar como leídas" que llame a `PUT /api/notifications/read` (para marcar `isRead = true` en el backend).

### 6. UI/UX y Funciones Adicionales

* **Tematización:** La web debe cambiar su CSS (fondos, colores) según el `tipoCelebracion` del grupo.
    * `Navidad`: Tema rojo y verde, copos de nieve.
    * `Reyes Magos`: Tema dorado y azul, coronas/camellos.
    * `Boda`: Tema blanco y dorado/elegante.
* **Obtención de Imágenes (Bonus):**
    * En el backend, cuando se añade/edita un regalo con `url`, intenta hacer *scraping* de esa URL para obtener la meta-etiqueta `og:image`.
    * Guarda esa `imageUrl` en la base de datos y muéstrala en la lista de regalos. Si falla, muestra una imagen genérica.

---

## Modelos de Datos (Esquema PostgreSQL)

**User:**

* `id` (PK, serial)
* `email` (string, unique, not null)
* `passwordHash` (string, nullable)
* `googleId` (string, nullable)
* `nombre` (string)
* `createdAt` (timestamp)

**Group:**

* `id` (PK, serial)
* `nombreGrupo` (string, not null)
* `tipoCelebracion` (enum: ['Navidad', 'Reyes Magos', 'Boda', 'Cumpleaños', 'Otro'], not null)
* `fechaInicio` (date, not null)
* `codigoUrl` (string, unique, indexado, not null)
* `creatorId` (FK a User.id, not null)
* `createdAt` (timestamp)

**Membership (Tabla Pivote):**

* `id` (PK, serial)
* `usuarioId` (FK a User.id)
* `grupoId` (FK a Group.id)
* *Constraint: `usuarioId` y `grupoId` deben ser únicos juntos.*

**Gift:**

* `id` (PK, serial)
* `nombre` (string, not null)
* `descripcion` (text)
* `url` (string)
* `imageUrl` (string, nullable)
* `solicitanteId` (FK a User.id, not null)
* `grupoId` (FK a Group.id, not null)
* `compradorId` (FK a User.id, nullable, default: null)
* `fechaCompra` (timestamp, nullable)
* `isDeletedBySolicitante` (boolean, default: false) // *Para Soft Delete*
* `createdAt` (timestamp)

**Notification (NUEVA TABLA):**

* `id` (PK, serial)
* `targetUserId` (FK a User.id, not null) // *El comprador que debe ser notificado*
* `message` (text, not null)
* `isRead` (boolean, default: false, indexado)
* `grupoId` (FK a Group.id)
* `originalGiftName` (string) // *Almacena el nombre por si el regalo es modificado*
* `createdAt` (timestamp)

---

## Lógica de API Clave

* `POST /auth/register`
* `POST /auth/login`
* `GET /auth/google` (Inicia OAuth)
* `GET /auth/google/callback` (Completa OAuth)
* `POST /api/grupos` (Crear grupo)
* `POST /api/grupo/:codigoUrl/join` (Unirse a grupo)
* `GET /api/grupo/:codigoUrl` (Ver detalles del grupo)
* `POST /api/grupo/:grupoId/gifts` (Añadir regalo)
* `GET /api/grupo/:grupoId/my-gifts` (Ver solo mis regalos, incluyendo comprados)
* `PUT /api/gift/:giftId` (Editar mi regalo -> **Dispara lógica de notificación**)
* `DELETE /api/gift/:giftId` (Eliminar mi regalo -> **Dispara lógica de soft/hard delete y notificación**)
* `GET /api/grupo/:grupoId/wishlist` (Ver lista de regalos anónima. Query: `WHERE grupoId = ? AND solicitanteId != ? AND compradorId IS NULL AND isDeletedBySolicitante = false`)
* `PUT /api/gift/:giftId/buy` (Marcar como comprado. Query: `UPDATE Gift SET compradorId = ? WHERE id = ? AND solicitanteId != ?`)
* `GET /api/notifications/unread` (**NUEVO**: Devuelve notificaciones con `isRead = false` para el usuario actual)
* `PUT /api/notifications/read` (**NUEVO**: Marca todas las notificaciones no leídas del usuario como `isRead = true`)

---

Por favor, genera la estructura de archivos y el código completo para esta aplicación, incluyendo frontend (React/Tailwind), backend (Node/Express), configuración de autenticación (JWT/Passport) y la lógica de negocio descrita.
