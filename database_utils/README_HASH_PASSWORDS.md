# 🔐 Sistema de Contraseñas Hasheadas con Bcrypt

Este sistema utiliza **bcrypt** a través de la extensión `pgcrypto` de PostgreSQL para almacenar contraseñas de forma segura.

## 📋 Migración de Contraseñas Existentes

### Paso 1: Ejecutar Script de Hash

**Opción A - PowerShell (Recomendado):**
```powershell
cd database_utils
.\ejecutar_hash_passwords.ps1
```

**Opción B - SQL Manual:**
```powershell
$env:PGPASSWORD = "123"
psql -U postgres -d kinesiologia -f hash_passwords.sql
Remove-Item Env:\PGPASSWORD
```

Este script:
- ✅ Habilita la extensión `pgcrypto` si no está activa
- ✅ Hashea todas las contraseñas en texto plano de `administrador`
- ✅ Hashea todas las contraseñas en texto plano de `practicante`
- ✅ No hashea contraseñas que ya estén hasheadas (seguro para ejecutar múltiples veces)
- ✅ Muestra un resumen de contraseñas hasheadas

### Paso 2: Verificar el Backend

El backend ya está configurado para:
- ✅ **Login**: Usa `crypt(password, hash)` para verificar contraseñas
- ✅ **Crear Practicante**: Hashea automáticamente con `crypt(password, gen_salt('bf'))`
- ✅ **Crear Admin**: Hashea automáticamente con `crypt(password, gen_salt('bf'))`

## 🔍 Cómo Funciona

### Al Crear un Usuario Nuevo:
```sql
-- La contraseña se hashea automáticamente en el INSERT
INSERT INTO practicante (nombre, password, rut, consultorio)
VALUES ('Juan Pérez', crypt('mipassword', gen_salt('bf')), '12345678-9', 'Consultorio 1');
```

### Al Hacer Login:
```sql
-- PostgreSQL compara el hash almacenado con la contraseña ingresada
SELECT nombre, rut FROM practicante 
WHERE rut = '12345678-9' 
AND password = crypt('mipassword', password);
-- Si las credenciales son correctas, retorna el usuario
-- Si son incorrectas, retorna vacío
```

## 🛡️ Seguridad

### Ventajas de Bcrypt:
- 🔒 **Hashes únicos**: Cada contraseña genera un hash diferente
- ⏱️ **Resistente a fuerza bruta**: Bcrypt es computacionalmente costoso
- 🔐 **Salt automático**: Gen_salt('bf') genera un salt aleatorio
- 📈 **Escalable**: El "cost factor" puede aumentarse en el futuro

### Formato del Hash:
```
$2a$12$AbCdEfGhIjKlMnOpQrStUvWxYz0123456789AbCdEfGhIjKlMnOpQ
 │  │  │                                                      │
 │  │  └─ Salt (22 caracteres)                               └─ Hash (31 caracteres)
 │  └─ Cost factor (12 = 2^12 iteraciones = 4096)
 └─ Identificador de algoritmo (2a = bcrypt)
```

## 📝 Credenciales de Prueba

Después de ejecutar el script, estas credenciales seguirán funcionando:

| Usuario | RUT | Password | Tipo |
|---------|-----|----------|------|
| Admin | 11111111-1 | admin123 | Administrador |
| Practicante | 22222222-2 | prac123 | Kinesiólogo |

## 🔧 Archivos Modificados

### Backend:
- ✅ `app.py`: Login actualizado para usar hash
- ✅ `agregar.py`: Funciones de creación hashean automáticamente
- ✅ `seleccionar.py`: Nuevas funciones `*PorRutConHash()` para verificación

### Base de Datos:
- ✅ `hash_passwords.sql`: Script SQL para migrar contraseñas
- ✅ `ejecutar_hash_passwords.ps1`: Script PowerShell automatizado

## ⚠️ Importante

1. **Ejecuta el script de hash SOLO UNA VEZ** (aunque es seguro ejecutarlo múltiples veces)
2. **No modifiques manualmente** los hashes en la base de datos
3. **Las contraseñas NO se pueden recuperar** (solo resetear)
4. **El login seguirá funcionando** con las mismas contraseñas de siempre

## 🚀 Proceso Completo

1. ✅ Detener el backend si está corriendo
2. ✅ Ejecutar `ejecutar_hash_passwords.ps1`
3. ✅ Verificar que el mensaje "MIGRACIÓN COMPLETADA" aparece
4. ✅ Iniciar el backend: `cd backend; python app.py`
5. ✅ Probar el login con las credenciales de prueba

## 🐛 Solución de Problemas

### Error: "extension pgcrypto does not exist"
```sql
-- Ejecutar como superusuario:
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Error: "password authentication failed"
- Verifica que ejecutaste el script de hash
- Asegúrate de usar las contraseñas correctas (admin123, prac123)

### Las contraseñas no funcionan después del hash
- El backend debe estar actualizado (usa las funciones `*ConHash()`)
- Reinicia el servidor backend después de actualizar

## 📚 Referencias

- [PostgreSQL pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)
- [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt)
