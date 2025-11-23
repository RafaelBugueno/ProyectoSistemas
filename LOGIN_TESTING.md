# 🔐 Sistema de Login - Configuración y Pruebas

## 🆕 Última Actualización
- ✅ CORS funcionando correctamente (OPTIONS retorna 200)
- ✅ Mensajes de error mejorados en backend y frontend
- ✅ Logging detallado de intentos de login
- ✅ Detección automática de errores de conexión a PostgreSQL

## ✅ Cambios Implementados

### Backend
1. **Nuevas funciones en `seleccionar.py`**:
   - `seleccionarPracticantePorRut(rut)` - Busca practicante por RUT
   - `seleccionarAdministradorPorRut(rut)` - Busca administrador por RUT

2. **Endpoint de login actualizado (`app.py`)**:
   - Ahora usa RUT en lugar de username
   - Verifica contra la base de datos
   - Retorna información del usuario (nombre, tipo, rut)

### Frontend
1. **LoginPage actualizado**:
   - Campo de usuario cambiado a RUT
   - Conectado con el backend vía API
   - Toast notifications para feedback
   - Estados de loading
   - Manejo de errores

### Database
1. **Credenciales de prueba actualizadas en `populate_data.sql`**:
   - RUTs ajustados para facilitar testing

## 🧪 Credenciales de Prueba

### Administrador
- **RUT**: `11111111-1`
- **Contraseña**: `admin123`
- **Nombre**: Dr. Carlos Administrador

### Practicante (Kinesiólogo)
- **RUT**: `22222222-2`
- **Contraseña**: `prac123`
- **Nombre**: Juan Pérez López

## 🚀 Pasos para Probar

### 1. Preparar la Base de Datos
```powershell
# Conectarse a PostgreSQL
psql -U postgres

# Dentro de psql:
DROP DATABASE IF EXISTS kinesiologia;
CREATE DATABASE kinesiologia;
\c kinesiologia

# Ejecutar scripts (desde psql)
\i 'C:/Users/pedro/Desktop/ProyectoSistemas/database_utils/init.sql'
\i 'C:/Users/pedro/Desktop/ProyectoSistemas/database_utils/populate_data.sql'

# Verificar datos
SELECT nombre, rut FROM administrador;
SELECT nombre, rut FROM practicante LIMIT 5;

# Salir
\q
```

### 2. Iniciar el Backend
```powershell
cd C:\Users\pedro\Desktop\ProyectoSistemas\backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Deberías ver:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### 3. Probar el Backend Directamente
Abre `test_connection.html` en tu navegador y haz clic en "Test Login".

O usa PowerShell:
```powershell
# Test login administrador
$body = @{
    username = "11111111-1"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $body -ContentType "application/json"

# Test login practicante
$body = @{
    username = "22222222-2"
    password = "prac123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### 4. Iniciar el Frontend
```powershell
cd C:\Users\pedro\Desktop\ProyectoSistemas\frontend
npm run dev
```

### 5. Probar el Login en la Interfaz
1. Abre http://localhost:5173
2. Ingresa:
   - **RUT**: `11111111-1` o `22222222-2`
   - **Contraseña**: `admin123` o `prac123`
3. Haz clic en "Acceder al Sistema"

## 🔍 Verificación de Logs

### Backend
Deberías ver en la terminal del backend:
```
🔵 OPTIONS /api/auth/login
✅ OPTIONS /api/auth/login - Status: 200
🔵 POST /api/auth/login
✅ POST /api/auth/login - Status: 200
```

### Frontend
En la consola del navegador (F12):
- No debería haber errores CORS
- Deberías ver el toast de éxito
- El componente debería cambiar según el tipo de usuario

## ❌ Solución de Problemas

### Error: "No se pudo conectar con el servidor"
- ✅ Verifica que el backend esté corriendo en el puerto 8000
- ✅ Verifica que el frontend esté en http://localhost:5173
- ✅ Revisa la configuración CORS en `app.py`

### Error: "RUT o contraseña incorrectos"
- ✅ Verifica que la base de datos tenga los datos
- ✅ Confirma los RUTs exactos con: `SELECT rut, password FROM administrador;`
- ✅ Las contraseñas son case-sensitive

### Error CORS 400 en OPTIONS
- ✅ Reinicia el servidor backend
- ✅ Limpia la caché del navegador (Ctrl+Shift+Delete)
- ✅ Verifica que el middleware CORS esté antes de las rutas

### No aparecen datos en la base de datos
```sql
-- Verificar tablas
\dt

-- Contar registros
SELECT COUNT(*) FROM administrador;
SELECT COUNT(*) FROM practicante;
SELECT COUNT(*) FROM atencion;

-- Ver registros
SELECT * FROM administrador;
```

## 📊 Estructura del Flujo de Login

```
Frontend (LoginPage.tsx)
    ↓
    [1] Usuario ingresa RUT y contraseña
    ↓
    [2] handleSubmit() → apiRequest("/api/auth/login", POST)
    ↓
Backend (app.py)
    ↓
    [3] Middleware CORS → OPTIONS handler
    ↓
    [4] login() endpoint
    ↓
    [5] seleccionarAdministradorPorRut() o seleccionarPracticantePorRut()
    ↓
Database (PostgreSQL)
    ↓
    [6] SELECT * FROM administrador/practicante WHERE rut = '...'
    ↓
Backend Response
    ↓
    [7] { status: "ok", user: { nombre, tipo, rut } }
    ↓
Frontend
    ↓
    [8] toast.success() + onLogin(user)
    ↓
    [9] App cambia de componente según user.tipo
```

## 🎯 Próximos Pasos

1. ✅ **Completado**: Login funcional con RUT y contraseña
2. 🔄 **Pendiente**: Implementar JWT para sesiones persistentes
3. 🔄 **Pendiente**: Hash de contraseñas con bcrypt
4. 🔄 **Pendiente**: Recuperación de contraseña
5. 🔄 **Pendiente**: Validación de formato RUT en frontend
6. 🔄 **Pendiente**: Rate limiting en endpoint de login

## 🔍 Diagnóstico de Error 401 Unauthorized

Si recibes **401 Unauthorized**, el backend está rechazando las credenciales. Sigue estos pasos:

### 1. Verifica los datos en la BD
```powershell
cd C:\Users\pedro\Desktop\ProyectoSistemas\database_utils
.\verify_login_data.ps1
```

Esto mostrará todos los RUTs y contraseñas. Verifica que:
- El RUT `11111111-1` exista en la tabla `administrador`
- El RUT `22222222-2` exista en la tabla `practicante`
- Las contraseñas sean exactamente `admin123` y `prac123`

### 2. Revisa los logs del backend
El backend ahora imprime mensajes detallados:
```
🔑 Intento de login - RUT: 11111111-1
✅ Login exitoso - Admin: Dr. Carlos Administrador
```

O si falla:
```
🔑 Intento de login - RUT: 11111111-1
⚠️ Contraseña incorrecta para administrador RUT: 11111111-1
```

O si no encuentra el RUT:
```
🔑 Intento de login - RUT: 99999999-9
❌ RUT no encontrado: 99999999-9
```

### 3. Verifica que la BD esté corriendo
Si ves este error en el backend:
```
❌ ERROR DE CONEXIÓN A POSTGRESQL ❌
```

Entonces PostgreSQL no está en ejecución. Inícialo:
```powershell
# Verificar si está corriendo
Get-Service -Name postgresql*

# Si no está corriendo, iniciarlo
Start-Service postgresql-x64-XX  # Reemplaza XX con tu versión
```

### 4. Re-poblar la base de datos
Si los datos no coinciden, ejecuta:
```powershell
psql -U postgres -d kinesiologia -f C:/Users/pedro/Desktop/ProyectoSistemas/database_utils/populate_data.sql
```

## 📝 Notas Importantes

- Las contraseñas están en **texto plano** (solo para desarrollo)
- El endpoint verifica primero si es administrador, luego practicante
- El tipo de usuario ("admin" o "kinesiologo") determina qué página se muestra
- CORS está configurado y funcionando correctamente
- El backend imprime logs detallados de cada intento de login
