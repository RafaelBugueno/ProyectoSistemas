# 🔧 Diagnóstico: Botón "Registrar Sesión"

## Problema
El botón "Registrar Sesión" no funciona o no registra la atención.

## Pasos de Diagnóstico

### 1. Verificar que el backend esté corriendo
```powershell
# El backend debe estar en http://localhost:8000
curl http://localhost:8000/api/health
```

### 2. Verificar el frontend en el navegador
- Abre la consola del navegador (F12)
- Haz clic en "Registrar Sesión"
- Busca errores en la consola
- Busca requests en la pestaña Network

### 3. Verificar logs del backend
En la terminal donde corre el backend deberías ver:

**Exitoso:**
```
🔵 OPTIONS /api/atenciones
✅ OPTIONS /api/atenciones - Status: 200
🔵 POST /api/atenciones
📝 Registrando atención:
   Fecha: 2025-11-23T15:30:00.000Z
   Consultorio: Consultorio Central
   Tipo: Masaje Terapéutico
   Practicante: Juan Pérez López
   Ubicación: (-33.4489, -70.6693)
✅ Atención registrada exitosamente
✅ POST /api/atenciones - Status: 200
```

**Con error:**
```
🔵 POST /api/atenciones
📝 Registrando atención:
   ...
❌ Error al registrar atención: [mensaje del error]
```

### 4. Probar el endpoint directamente
```powershell
cd C:\Users\pedro\Desktop\ProyectoSistemas\backend
.\test_atencion.ps1
```

Esto probará el endpoint independientemente del frontend.

### 5. Verificar la base de datos
```sql
-- Conectar a PostgreSQL
psql -U postgres -d kinesiologia

-- Ver atenciones registradas
SELECT * FROM atencion ORDER BY fecha DESC LIMIT 5;

-- Verificar que las tablas existan
\dt

-- Verificar que el practicante exista
SELECT * FROM practicante WHERE nombre = 'Juan Pérez López';
```

## Errores Comunes

### Error: "tipo_atencion no existe"
**Solución:** El tipo de atención debe existir en la tabla `tipo_atencion`.

```sql
-- Insertar el tipo de atención si no existe
INSERT INTO tipo_atencion (nombre) VALUES ('Masaje Terapéutico');
```

### Error: "consultorio no existe"
**Solución:** El consultorio debe existir en la tabla `consultorio`.

```sql
-- Insertar el consultorio si no existe
INSERT INTO consultorio (nombre, direccion) 
VALUES ('Sin consultorio', 'N/A');
```

### Error: "nombre_practicante no existe"
**Solución:** El nombre del practicante debe coincidir exactamente con la BD.

```sql
-- Verificar el nombre exacto
SELECT nombre FROM practicante WHERE rut = '22222222-2';
```

### Error: "Failed to fetch"
**Solución:** El backend no está corriendo o hay problema de CORS.

1. Verifica que el backend esté en http://localhost:8000
2. Reinicia el backend
3. Limpia la caché del navegador

### Error: Se guarda localmente pero no sincroniza
**Solución:** El frontend está en modo offline.

1. Haz clic en "Sincronizar Datos"
2. Verifica los logs del backend
3. Revisa localStorage en la consola del navegador:
   ```javascript
   JSON.parse(localStorage.getItem('registros'))
   ```

## Verificación Exitosa

Si todo funciona correctamente, verás:

1. **En el frontend:** Toast verde "Sesión registrada y sincronizada correctamente"
2. **En el backend:** Logs detallados con ✅
3. **En la BD:** El registro aparece en `SELECT * FROM atencion`
4. **En AdminPage:** La atención aparece en la lista de registros

## Información Adicional

- El campo `fecha` debe estar en formato ISO: `2025-11-23T15:30:00.000Z`
- Las coordenadas GPS son opcionales (default: 0, 0)
- El sistema tiene modo offline: guarda en localStorage si falla
- Usa el botón "Sincronizar Datos" para enviar registros pendientes
