# Script para crear la estructura de la base de datos en AWS RDS
# No migra datos, solo crea el schema

Write-Host "=== Script de Creacion de Schema en AWS RDS ===" -ForegroundColor Cyan
Write-Host ""

# Configuracion de la base de datos
$DB_HOST = "kinesiologia.cb2682icmjpq.us-east-2.rds.amazonaws.com"
$DB_PORT = "5432"
$DB_NAME = "kinesiologia"
$DB_USER = "postgres"
$DB_PASSWORD = "kinesiologia"

# Verificar si psql esta instalado
Write-Host "Verificando instalacion de PostgreSQL..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "ERROR: psql no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala PostgreSQL y agrega psql al PATH del sistema" -ForegroundColor Red
    exit 1
}

Write-Host "psql encontrado en: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Crear el script SQL temporal
$sqlScript = @"
-- Script de creacion de schema para base de datos kinesiologia
-- Generado automaticamente

-- ============================================
-- EXTENSION REQUERIDA: pgcrypto
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla: tipo_atencion
CREATE TABLE IF NOT EXISTS tipo_atencion (
    nombre VARCHAR(100) PRIMARY KEY
);

-- Tabla: consultorio
CREATE TABLE IF NOT EXISTS consultorio (
    nombre VARCHAR(100) PRIMARY KEY,
    direccion VARCHAR(200) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo'
);

-- Tabla: practicante
CREATE TABLE IF NOT EXISTS practicante (
    nombre VARCHAR(100) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL UNIQUE,
    consultorio VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    FOREIGN KEY (consultorio) REFERENCES consultorio(nombre)
);

-- Tabla: administrador
CREATE TABLE IF NOT EXISTS administrador (
    nombre VARCHAR(100) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL UNIQUE
);

-- Tabla: practicante_consultorio (relacion muchos a muchos)
CREATE TABLE IF NOT EXISTS practicante_consultorio (
    rut_practicante TEXT NOT NULL,
    consultorio_nombre TEXT NOT NULL,
    asignado_desde DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (rut_practicante, consultorio_nombre),
    FOREIGN KEY (rut_practicante) REFERENCES practicante(rut) ON DELETE CASCADE,
    FOREIGN KEY (consultorio_nombre) REFERENCES consultorio(nombre) ON DELETE CASCADE
);

-- Tabla: atencion
CREATE TABLE IF NOT EXISTS atencion (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP NOT NULL,
    consultorio VARCHAR(100) NOT NULL,
    tipo_atencion VARCHAR(100) NOT NULL,
    nombre_practicante VARCHAR(100) NOT NULL,
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    FOREIGN KEY (consultorio) REFERENCES consultorio(nombre),
    FOREIGN KEY (tipo_atencion) REFERENCES tipo_atencion(nombre),
    FOREIGN KEY (nombre_practicante) REFERENCES practicante(nombre)
);

-- ============================================
-- INDICES ADICIONALES
-- ============================================

-- Indices para practicante_consultorio
CREATE INDEX IF NOT EXISTS idx_pc_rut ON practicante_consultorio(rut_practicante);
CREATE INDEX IF NOT EXISTS idx_pc_consultorio ON practicante_consultorio(consultorio_nombre);

-- ============================================
-- VERIFICACION
-- ============================================
SELECT 'Schema creado exitosamente' as resultado;

-- Mostrar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
"@

# Guardar el script SQL en un archivo temporal
$tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlScript | Out-File -FilePath $tempSqlFile -Encoding UTF8

Write-Host "Script SQL generado en: $tempSqlFile" -ForegroundColor Green
Write-Host ""

# Intentar conectar y ejecutar el script
Write-Host "Conectando a AWS RDS..." -ForegroundColor Yellow
Write-Host "Host: $DB_HOST" -ForegroundColor Cyan
Write-Host "Database: $DB_NAME" -ForegroundColor Cyan
Write-Host "User: $DB_USER" -ForegroundColor Cyan
Write-Host ""

# Configurar variable de entorno para la password
$env:PGPASSWORD = $DB_PASSWORD

try {
    Write-Host "Ejecutando script de creacion de schema..." -ForegroundColor Yellow
    
    # Ejecutar el script SQL
    $output = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $tempSqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== EXITO: Schema creado correctamente ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Detalles de la ejecucion:" -ForegroundColor Cyan
        $output | ForEach-Object { Write-Host $_ }
        Write-Host ""
        Write-Host "La estructura de la base de datos ha sido creada en AWS RDS" -ForegroundColor Green
        Write-Host "Las tablas creadas son:" -ForegroundColor Cyan
        Write-Host "  - tipo_atencion" -ForegroundColor White
        Write-Host "  - consultorio" -ForegroundColor White
        Write-Host "  - practicante" -ForegroundColor White
        Write-Host "  - administrador" -ForegroundColor White
        Write-Host "  - practicante_consultorio" -ForegroundColor White
        Write-Host "  - atencion" -ForegroundColor White
        Write-Host ""
        Write-Host "Extension instalada:" -ForegroundColor Cyan
        Write-Host "  - pgcrypto (para bcrypt)" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "ERROR: Hubo un problema al crear el schema" -ForegroundColor Red
        Write-Host "Detalles del error:" -ForegroundColor Yellow
        $output | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Excepcion al ejecutar el script" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
} finally {
    # Limpiar variable de entorno
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    
    # Eliminar archivo temporal
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile -Force
    }
}

Write-Host ""
Write-Host "=== Proximos Pasos ===" -ForegroundColor Cyan
Write-Host "1. Puedes verificar las tablas conectandote con:" -ForegroundColor White
Write-Host "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Para poblar datos iniciales, ejecuta:" -ForegroundColor White
Write-Host "   .\populate_data_rds.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "3. El backend ya esta configurado para usar esta base de datos" -ForegroundColor White
Write-Host ""
