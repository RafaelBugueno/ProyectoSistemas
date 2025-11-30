# Script para agregar columna "estado" a la tabla consultorio
# Ejecuta el archivo SQL add_estado_consultorio.sql

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "add_estado_consultorio.sql"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Agregar columna 'estado' a consultorio" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración de la base de datos
$env:PGPASSWORD = "cacaseca000"
$dbHost = "localhost"
$dbUser = "postgres"
$dbName = "kinesiologia"

Write-Host "Conectando a la base de datos '$dbName'..." -ForegroundColor Yellow

# Ejecutar el archivo SQL
Write-Host "Ejecutando migración..." -ForegroundColor Yellow
$output = psql -h $dbHost -U $dbUser -d $dbName -f $sqlFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Migración completada exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resultado:" -ForegroundColor Cyan
    Write-Host $output
} else {
    Write-Host ""
    Write-Host "✗ Error al ejecutar la migración" -ForegroundColor Red
    Write-Host $output
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Proceso completado" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Limpiar variable de entorno
Remove-Item Env:\PGPASSWORD
