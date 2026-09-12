# Deportes ESFE - Backend

Sistema web para la gestión y automatización del torneo de fútbol de la Institución ESFE. Este repositorio contiene la API REST (backend), construida con el stack MERN (sin la parte de React, que vive en un repositorio aparte para el frontend).

## Tecnologías

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken) para autenticación
- bcryptjs para encriptar contraseñas
- cookie-parser para leer cookies HttpOnly en las peticiones

## Roles del sistema

| Rol | Permisos principales |
|---|---|
| **admin** | Gestiona torneos, equipos, jugadores, partidos, convocatorias y usuarios |
| **delegado** | Gestiona su propio equipo y sus jugadores |
| **arbitro** | Registra resultados y estadísticas de los partidos que le asignen |

## Estructura del proyecto

```
Deportes_ESFE_backend/
├── src/
│   ├── config/
│   │   └── db.js              # Conexión a MongoDB
│   ├── models/                # Schemas de Mongoose
│   ├── controllers/           # Lógica de cada acción
│   ├── routes/                # Definición de endpoints
│   └── middleware/
│       └── authMiddleware.js  # Verificación de token y roles
├── .env                       # Variables de entorno (no se sube a git)
├── .gitignore
├── package.json
└── server.js                  # Punto de entrada de la aplicación
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```
   npm install
   ```
3. Crear un archivo `.env` en la raíz con este contenido:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/deportes_esfe
   JWT_SECRET=tu_clave_secreta
   JWT_EXPIRES_IN=8h
   CORS_ORIGIN=http://localhost:5173
   ```
4. Levantar el servidor en modo desarrollo:
   ```
   npm run dev
   ```
5. Verificar que responde en `http://localhost:4000`

## Colecciones de MongoDB

El sistema usa 6 colecciones. La tabla de posiciones y la tabla de goleadores **no se guardan** — se calculan en tiempo real a partir de `partidos`.

- **usuarios**: nombre, apellido, email, password_hash, rol, estado
- **torneos**: nombre, anio, fecha_inicio, fecha_fin, estado, equipos_inscritos (embebido: equipo_id, fecha_inscripcion, firma, estado)
- **equipos**: nombre, carrera, anio, delegado_id, capitan_id, jugadores_inscritos (embebido: jugador_id, dorsal, estado, fecha_alta)
- **jugadores**: nombre, apellido, carne, telefono, posicion, estado
- **partidos**: torneo_id, equipo_local_id, equipo_visitante_id, arbitro_id, fecha, hora, estado, goles_local, goles_visitante, estadisticas_jugadores (embebido: jugador_id, equipo_id, titular, goles, tarjetas_amarillas, tarjetas_rojas)
- **convocatorias**: torneo_id, titulo, mensaje, fecha_publicacion, fecha_limite, estado (funcionan como avisos/comunicados del torneo, no como convocatoria de jugadores por partido)

## Autenticación

El token JWT se puede enviar de dos formas (`verificarToken` acepta cualquiera de las dos, revisa el header primero):

```
Authorization: Bearer <token>
```

Como alternativa al header, el login puede devolver el token en una cookie HttpOnly (más segura contra ataques XSS, ya que JavaScript del lado del cliente no puede leerla). Para activarlo, se debe enviar el header `x-use-cookie: true` en la petición de login. El middleware de autenticación acepta el token desde cualquiera de las dos fuentes.

El token expira según `JWT_EXPIRES_IN` (8 horas) y se firma/verifica siempre con el algoritmo `HS256` explícito, para no aceptar tokens firmados con otro algoritmo.

Las contraseñas nunca se manejan en texto plano fuera del modelo: el modelo `Usuario` tiene un campo virtual `password` que, al asignarse, se encripta automáticamente con bcrypt antes de guardarse (`pre('validate')`). Por eso, tanto en el registro como en la creación directa de usuarios, se manda `password` (texto plano) y no `password_hash`.

### POST /api/auth/registro
Crea un nuevo usuario. Body:
```json
{ "nombre": "...", "apellido": "...", "email": "...", "password": "...", "rol": "admin | arbitro | delegado" }
```

### POST /api/auth/login
Devuelve un token JWT. Body:
```json
{ "email": "...", "password": "..." }
```

Si la petición incluye el header `x-use-cookie: true`, además del token en el JSON de respuesta, el servidor setea una cookie `HttpOnly` llamada `token` (con `secure` en producción y `sameSite: strict`).

### CORS

El servidor solo acepta peticiones desde el/los origen(es) definidos en `CORS_ORIGIN` (separados por coma si son varios; por defecto `http://localhost:5173`, el puerto de Vite). Se configura con `credentials: true` para permitir el envío de cookies entre frontend y backend.

## Seguridad implementada

- **Contraseñas**: nunca se guardan en texto plano. El modelo `Usuario` encripta automáticamente cualquier contraseña recibida (campo virtual `password`) antes de guardarla en `password_hash`, sin importar desde qué ruta se cree el usuario (registro público o creación directa por un admin).
- **Exposición de datos**: el campo `password_hash` nunca se incluye en las respuestas de la API (se excluye explícitamente en las consultas).
- **JWT**: firmado y verificado únicamente con el algoritmo `HS256` (se rechaza explícitamente cualquier otro algoritmo, incluyendo `none`), con una vida útil corta (8 horas) para reducir el riesgo si un token es robado.
- **CORS**: configurado con una lista explícita de orígenes permitidos (no abierto a cualquier dominio), restringido a los métodos y cabeceras que la API realmente usa.
- **CSRF**: al usar el header `Authorization: Bearer <token>` como método principal (en vez de cookies automáticas del navegador), se reduce significativamente el riesgo de CSRF clásico, ya que un sitio malicioso no puede forzar ese header.

## Endpoints por colección

Todos siguen el mismo patrón CRUD, salvo lo indicado.

| Recurso | Método | Ruta | Roles permitidos |
|---|---|---|---|
| Usuarios | GET / POST / PUT / DELETE | `/api/usuarios` | Solo admin |
| Torneos | POST / PUT / DELETE | `/api/torneos` | Solo admin |
| Torneos | GET | `/api/torneos` | Cualquier rol autenticado |
| Torneos | GET | `/api/torneos/:id/posiciones` | Cualquier rol autenticado |
| Torneos | GET | `/api/torneos/:id/goleadores` | Cualquier rol autenticado |
| Equipos | POST / PUT | `/api/equipos` | admin, delegado |
| Equipos | DELETE | `/api/equipos` | Solo admin |
| Equipos | GET | `/api/equipos` | Cualquier rol autenticado |
| Jugadores | POST / PUT | `/api/jugadores` | admin, delegado |
| Jugadores | DELETE | `/api/jugadores` | Solo admin |
| Jugadores | GET | `/api/jugadores` | Cualquier rol autenticado |
| Partidos | POST / DELETE | `/api/partidos` | Solo admin |
| Partidos | PUT | `/api/partidos` | admin, arbitro |
| Partidos | GET | `/api/partidos` | Cualquier rol autenticado |
| Convocatorias | POST / PUT / DELETE | `/api/convocatorias` | Solo admin |
| Convocatorias | GET | `/api/convocatorias` | Cualquier rol autenticado |

## Reglas de negocio

**Validaciones al crear un partido:**
- El torneo y ambos equipos deben existir
- Un equipo no puede jugar contra sí mismo
- Ambos equipos deben estar inscritos y activos (`estado: "inscrito"`) en el torneo indicado

**Tabla de posiciones** (calculada desde partidos con `estado: "finalizado"`):
- Victoria = 3 puntos, empate = 1 punto, derrota = 0 puntos
- Orden: puntos → diferencia de goles → goles a favor

**Tabla de goleadores** (calculada desde `estadisticas_jugadores` dentro de los partidos):
- Suma de goles por jugador across todos los partidos del torneo
- Orden: mayor cantidad de goles

## Últimos cambios (hardening de autenticación)

- **models/Usuario.js**: se agregó un campo virtual `password` que encripta con bcrypt automáticamente hacia `password_hash` en un hook `pre('validate')`, sin importar desde qué controlador se cree el usuario.
- **controllers/authController.js**: `registrar` ya no encripta a mano (lo hace el modelo). `login` firma el JWT fijando `algorithm: 'HS256'` y, si la petición trae el header `x-use-cookie: true`, además setea el token como cookie `HttpOnly`.
- **controllers/usuarioController.js**: todas las respuestas excluyen `password_hash` (`.select('-password_hash')` o borrándolo del objeto). `actualizarUsuario` acepta `password` en texto plano y lo re-encripta si viene en el body.
- **middleware/authMiddleware.js**: `verificarToken` ahora busca el token en el header `Authorization` o, si no está, en la cookie `token`. `jwt.verify` restringe explícitamente los algoritmos aceptados a `['HS256']`.
- **server.js**: se agregó `cookie-parser` y una configuración explícita de CORS (`origin` desde `CORS_ORIGIN`, `credentials: true`) en vez del `cors()` genérico.
- **.env**: se agregó `CORS_ORIGIN=http://localhost:5173` y `JWT_EXPIRES_IN` pasó de `1d` a `8h`.

## Estado del proyecto

- ✅ Fase 1: Configuración inicial
- ✅ Fase 2: Modelos, controladores, rutas, CRUD
- ✅ Fase 3: Autenticación y roles
- ✅ Fase 4: Partidos, resultados, tabla de posiciones y goleadores
- ⏳ Fase 5: Frontend con React (pendiente)
- ⏳ Fase 6: Pruebas finales y documentación de presentación
