# Deportes ESFE - Backend

Sistema web para la gestión y automatización del torneo de fútbol de la Institución ESFE. Este repositorio contiene la API REST (backend), construida con el stack MERN (sin la parte de React, que vive en un repositorio aparte para el frontend).

## Tecnologías

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken) para autenticación
- bcryptjs para encriptar contraseñas

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
   JWT_EXPIRES_IN=1d
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

Todas las rutas (excepto registro y login) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

El token se obtiene haciendo login y expira según `JWT_EXPIRES_IN` (por defecto, 1 día).

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

## Estado del proyecto

- ✅ Fase 1: Configuración inicial
- ✅ Fase 2: Modelos, controladores, rutas, CRUD
- ✅ Fase 3: Autenticación y roles
- ✅ Fase 4: Partidos, resultados, tabla de posiciones y goleadores
- ⏳ Fase 5: Frontend con React (pendiente)
- ⏳ Fase 6: Pruebas finales y documentación de presentación
