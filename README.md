# BucaPark

Plataforma de gestión de parques para Bucaramanga. Arquitectura de microservicios: React en el frontend, Node.js/Express en el backend, MongoDB Atlas como base de datos.

## Arquitectura

```
frontend/          → React + Vite  (puerto 5173 en dev)
gateway/           → API Gateway   (puerto 3000)
auth-service/      → Autenticación (puerto 3001)
parks-service/     → Parques       (puerto 3002)
reservation-service/ → Reservas    (puerto 3003)
events-service/    → Eventos       (puerto 3004)
incidents-service/ → Incidentes    (puerto 3005)
maintenance-service/ → Mantenimiento (puerto 3006)
inventory-service/ → Inventario    (puerto 3007)
```

## Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- Git
- Acceso a la base de datos MongoDB Atlas (pedirle las credenciales a Santiago)

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/santrolop1/bucapark.git
cd bucapark
```

### 2. Instalar dependencias en cada servicio

Hay que hacer `npm install` dentro de cada carpeta. Abrí una terminal y ejecutá esto desde la raíz del proyecto:

```bash
cd gateway && npm install && cd ..
cd auth-service && npm install && cd ..
cd parks-service && npm install && cd ..
cd reservation-service && npm install && cd ..
cd events-service && npm install && cd ..
cd incidents-service && npm install && cd ..
cd maintenance-service && npm install && cd ..
cd inventory-service && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Crear los archivos .env

Cada servicio necesita su propio archivo `.env`. Hay un `.env.example` en cada carpeta que muestra qué variables van. **Pedile a Santiago los valores reales** (MONGO_URI y JWT_SECRET).

Ejemplo para auth-service:
```bash
cp auth-service/.env.example auth-service/.env
# Luego editá auth-service/.env y poné los valores reales
```

Repetí lo mismo para: `gateway`, `parks-service`, `reservation-service`, `events-service`, `incidents-service`, `maintenance-service`, `inventory-service`.

Para el **frontend en desarrollo local** creá `frontend/.env` con contenido vacío (el proxy de Vite se encarga):
```bash
cp frontend/.env.example frontend/.env
```

### 4. Levantar el proyecto

Necesitás **abrir una terminal por cada servicio** (o usar pestañas). El orden importa: primero el gateway y los microservicios, luego el frontend.

**Terminal 1 — Gateway:**
```bash
cd gateway
npm run dev
```

**Terminal 2 — Auth Service:**
```bash
cd auth-service
npm run dev
```

**Terminal 3 — Parks Service:**
```bash
cd parks-service
npm run dev
```

> Los demás servicios (reservation, events, incidents, maintenance, inventory) se levantan igual si los necesitás.

**Última terminal — Frontend:**
```bash
cd frontend
npm run dev
```

Abrí el navegador en `http://localhost:5173`.

## Variables de entorno que necesitás pedirle a Santiago

| Variable | Dónde va | Descripción |
|----------|----------|-------------|
| `MONGO_URI` | Todos los servicios menos gateway y frontend | Cadena de conexión a MongoDB Atlas |
| `JWT_SECRET` | Todos los servicios menos gateway y frontend | Clave secreta para firmar tokens JWT — tiene que ser **la misma** en todos |

## Estructura de una respuesta de la API

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

## Producción (ya desplegado)

| Componente | URL |
|-----------|-----|
| Frontend | https://bucapark.vercel.app |
| Gateway | https://buca-gateway-vm9o.onrender.com |

> Los servicios en Render usan el plan gratuito y se duermen tras 15 minutos de inactividad. El primer request del día puede tardar hasta 60 segundos.
