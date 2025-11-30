# Backend Dockerizado - Sistema de Atención Kinesiológica

## 🐳 Ejecución con Docker

### Requisitos
- Docker Desktop instalado
- PostgreSQL corriendo en el host (localhost)

### Construcción de la imagen

```powershell
cd backend
docker build -t kinesiologia-backend .
```

### Ejecución del contenedor

**Opción 1: Conexión a PostgreSQL en localhost (Windows)**
```powershell
docker run -d `
  --name kinesiologia-api `
  -p 8000:8000 `
  -e DB_HOST=host.docker.internal `
  -e DB_PORT=5432 `
  -e DB_NAME=kinesiologia `
  -e DB_USER=postgres `
  -e DB_PASSWORD=cacaseca000 `
  kinesiologia-backend
```

**Opción 2: Variables de entorno personalizadas**
```powershell
docker run -d `
  --name kinesiologia-api `
  -p 8000:8000 `
  -e DB_HOST=tu_host `
  -e DB_PORT=5432 `
  -e DB_NAME=tu_database `
  -e DB_USER=tu_usuario `
  -e DB_PASSWORD=tu_contraseña `
  kinesiologia-backend
```

**Opción 3: Modo desarrollo con recarga automática**
```powershell
docker run -d `
  --name kinesiologia-api `
  -p 8000:8000 `
  -v ${PWD}:/app `
  -e DB_HOST=host.docker.internal `
  kinesiologia-backend
```

### Comandos útiles

**Ver logs del contenedor:**
```powershell
docker logs kinesiologia-api
docker logs -f kinesiologia-api  # Seguir logs en tiempo real
```

**Detener el contenedor:**
```powershell
docker stop kinesiologia-api
```

**Iniciar el contenedor:**
```powershell
docker start kinesiologia-api
```

**Eliminar el contenedor:**
```powershell
docker stop kinesiologia-api
docker rm kinesiologia-api
```

**Reconstruir después de cambios:**
```powershell
docker stop kinesiologia-api
docker rm kinesiologia-api
docker build -t kinesiologia-backend .
docker run -d --name kinesiologia-api -p 8000:8000 -e DB_HOST=host.docker.internal kinesiologia-backend
```

### Verificación

Una vez ejecutado, el backend estará disponible en:
- **API**: http://localhost:8000
- **Documentación interactiva (Swagger)**: http://localhost:8000/docs
- **Documentación alternativa (ReDoc)**: http://localhost:8000/redoc

### Variables de entorno

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `DB_HOST` | `host.docker.internal` | Host de PostgreSQL |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_NAME` | `kinesiologia` | Nombre de la base de datos |
| `DB_USER` | `postgres` | Usuario de PostgreSQL |
| `DB_PASSWORD` | `cacaseca000` | Contraseña de PostgreSQL |

### Notas importantes

1. **`host.docker.internal`**: En Docker Desktop para Windows/Mac, este hostname especial permite conectarse a servicios en localhost del host.

2. **PostgreSQL debe estar corriendo**: El contenedor necesita conectarse a PostgreSQL. Asegúrate de que esté activo:
   ```powershell
   # Verificar si PostgreSQL está corriendo
   Get-Service postgresql*
   ```

3. **Puerto 8000**: Asegúrate de que el puerto 8000 no esté ocupado por otro servicio.

4. **CORS**: El backend ya tiene CORS configurado para aceptar solicitudes del frontend.

### Troubleshooting

**Error de conexión a PostgreSQL:**
- Verifica que PostgreSQL esté corriendo
- Confirma que las credenciales sean correctas
- En Windows, usa `host.docker.internal` como DB_HOST
- Verifica el firewall de Windows

**Puerto 8000 ocupado:**
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :8000

# Cambiar puerto del contenedor
docker run -d --name kinesiologia-api -p 8001:8000 -e DB_HOST=host.docker.internal kinesiologia-backend
```

**Ver errores detallados:**
```powershell
docker logs kinesiologia-api
```

## 📦 Sin Docker (ejecución tradicional)

Si prefieres ejecutar sin Docker:

```powershell
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## 🔒 Seguridad

**Importante**: En producción, nunca expongas contraseñas en variables de entorno. Usa:
- Secrets de Docker
- Variables de entorno seguras del sistema
- Servicios de gestión de secretos (AWS Secrets Manager, Azure Key Vault, etc.)
