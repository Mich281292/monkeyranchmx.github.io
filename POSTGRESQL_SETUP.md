# Monkey Ranch Backend - PostgreSQL Migration

## Cambios Realizados

Se migró de SQLite a PostgreSQL para mayor escalabilidad y compatibilidad con servicios cloud.

## Instalación

1. Instalar las dependencias actualizadas:
```bash
npm install
```

## Configuración de PostgreSQL

### Opción 1: PostgreSQL Local

1. Instalar PostgreSQL en tu máquina
2. Crear una base de datos:
```sql
CREATE DATABASE monkey_ranch;
```

3. Crear archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/monkey_ranch
PORT=3000
```

### Opción 2: PostgreSQL en la Nube (Render, Heroku, etc.)

1. Crear una base de datos PostgreSQL en tu servicio cloud
2. Copiar la URL de conexión que te proporcionen
3. Configurar la variable de entorno `DATABASE_URL` con esa URL

**Ejemplo para Render:**
```env
DATABASE_URL=postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/monkey_ranch_db
```

## Iniciar el Servidor

```bash
npm start
```

O en modo desarrollo:
```bash
npm run dev
```

## Características

- ✅ Tablas creadas automáticamente al iniciar
- ✅ Conexión segura con SSL en producción
- ✅ Manejo de errores mejorado
- ✅ API compatible (sin cambios en frontend)
- ✅ Endpoints:
  - `POST /api/contact` - Guardar contacto
  - `GET /api/contacts` - Listar todos los contactos

## Notas

- El servidor intentará conectarse a PostgreSQL al iniciar
- Si no encuentra `DATABASE_URL` en las variables de entorno, usará: `postgresql://localhost:5432/monkey_ranch`
- La tabla `contacts` se crea automáticamente si no existe
