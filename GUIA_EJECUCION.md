# 🚀 Guía de Ejecución - Sistema Kinesiología

## 🆕 Última Actualización

**✅ Mejoras Implementadas:**
- Carga dinámica de consultorios desde la base de datos
- Carga dinámica de tipos de atención desde la base de datos
- Consultorio del usuario se establece como predeterminado
- Validación de Foreign Keys automática
- Dropdowns dinámicos en lugar de listas hardcodeadas
- **Ya no hay errores de "consultorio no está presente"**

## 📋 Requisitos Previos

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+

---

## 🗄️ 1. Configurar Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE kinesiologia;
\q

# Ejecutar script de inicialización
cd database_utils
psql -U postgres -d kinesiologia -f init.sql

# (Opcional) Poblar con datos de prueba
psql -U postgres -d kinesiologia -f populate_data.sql
```

---

## 🔧 2. Configurar Backend

```bash
# Ir a la carpeta backend
cd backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install fastapi uvicorn psycopg2-binary python-multipart

# Configurar credenciales de base de datos
# Editar generalSQL.py líneas 6-10:
HOST = "localhost"
DATABASE = "kinesiologia"
USER = "postgres"
PASSWORD = "tu_password_aqui"  # ⚠️ CAMBIAR
PORT = 5432

# Ejecutar el servidor
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: **http://localhost:8000**

---

## 🎨 3. Configurar Frontend

```bash
# Ir a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Configurar URL del backend (ya está en .env)
# VITE_API_URL=http://localhost:8000

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

---

## 🌐 4. Acceder al Sistema

Abre tu navegador en: **http://localhost:5173**

### Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| Juan Pérez López | prac123 | Practicante |
| María González Silva | prac123 | Practicante |

---

## 📡 5. Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Login

### Consultorios
- `GET /api/consultorios` - Listar
- `POST /api/consultorios` - Crear

### Tipos de Atención
- `GET /api/tipos-atencion` - Listar
- `GET /api/tipos-atencion/usados` - Tipos usados
- `POST /api/tipos-atencion` - Crear

### Practicantes
- `GET /api/practicantes` - Listar
- `GET /api/practicantes/activos` - Con atenciones
- `POST /api/practicantes` - Crear
- `DELETE /api/practicantes/{nombre}` - Eliminar

### Atenciones
- `GET /api/atenciones` - Listar (con filtros)
- `POST /api/atenciones` - Crear
- `DELETE /api/atenciones/{id}` - Eliminar

### Sincronización
- `POST /api/sincronizar` - Sincronizar localStorage con BD

### Estadísticas
- `GET /api/estadisticas/resumen` - Dashboard admin

Documentación interactiva: **http://localhost:8000/docs**

---

## 🔄 6. Funcionamiento Offline

El sistema funciona con **sincronización híbrida**:

1. **Con conexión**: Los datos se guardan directamente en la BD
2. **Sin conexión**: Los datos se guardan en localStorage
3. **Sincronización**: Click en "Sincronizar Datos" para enviar registros pendientes

---

## 🐛 7. Solución de Problemas

### Backend no inicia
```bash
# Verificar que PostgreSQL esté corriendo
psql -U postgres -c "SELECT version();"

# Verificar credenciales en generalSQL.py
```

### Frontend no conecta con backend
```bash
# Verificar que el backend esté corriendo en puerto 8000
curl http://localhost:8000/api/health

# Verificar CORS en app.py (líneas 42-51)
```

### Error de CORS
El backend ya tiene CORS configurado para `localhost:5173`. Si usas otro puerto, edita `backend/app.py`:
```python
allow_origins=[
    "http://localhost:TU_PUERTO",
]
```

---

## 📦 8. Build para Producción

### Frontend
```bash
cd frontend
npm run build
# Los archivos estarán en frontend/dist/
```

### Backend
```bash
cd backend
pip install -r requirements.txt  # Crear este archivo primero
uvicorn app:app --host 0.0.0.0 --port 8000
```

---

## 📚 9. Estructura del Proyecto

```
ProyectoSistemas/
├── backend/           # API FastAPI
│   ├── app.py        # Endpoints principales
│   ├── agregar.py    # Operaciones INSERT
│   ├── seleccionar.py # Operaciones SELECT
│   ├── eliminar.py   # Operaciones DELETE
│   ├── actualizar.py # Operaciones UPDATE
│   └── generalSQL.py # Conexión a BD
├── frontend/         # React + TypeScript
│   ├── src/
│   │   ├── api/      # Configuración API
│   │   └── components/ # Componentes React
│   └── .env          # Variables de entorno
└── database_utils/   # Scripts SQL
    ├── init.sql      # Esquema de BD
    └── populate_data.sql # Datos de prueba
```

---

## ✅ 10. Checklist de Verificación

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `kinesiologia` creada
- [ ] Tablas creadas con `init.sql`
- [ ] Backend corriendo en puerto 8000
- [ ] Frontend corriendo en puerto 5173
- [ ] Login funciona correctamente
- [ ] Registro de atenciones funciona
- [ ] Sincronización funciona
- [ ] Dashboard admin muestra datos

---

## 🤝 Soporte

Si tienes problemas, verifica:
1. Logs del backend en la terminal
2. Consola del navegador (F12)
3. Network tab para ver requests fallidas
4. PostgreSQL logs

¡Listo para usar! 🎉
