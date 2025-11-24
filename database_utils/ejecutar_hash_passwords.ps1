# Script para hashear todas las contraseñas existentes en la base de datos
# Este script debe ejecutarse UNA VEZ para migrar las contraseñas a bcrypt

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MIGRACIÓN DE CONTRASEÑAS A BCRYPT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si PostgreSQL está en ejecución
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "❌ PostgreSQL no está instalado o no se encuentra el servicio" -ForegroundColor Red
    Write-Host "Asegúrate de que PostgreSQL está instalado y en ejecución" -ForegroundColor Yellow
    exit 1
}

if ($pgService.Status -ne "Running") {
    Write-Host "⚠️  PostgreSQL no está en ejecución. Iniciando..." -ForegroundColor Yellow
    Start-Service $pgService.Name
    Start-Sleep -Seconds 2
}

Write-Host "✅ PostgreSQL está en ejecución" -ForegroundColor Green
Write-Host ""

# Ejecutar el script SQL
Write-Host "🔐 Hasheando contraseñas existentes..." -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "cacaseca000"
$sqlFile = Join-Path $PSScriptRoot "hash_passwords.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ No se encontró el archivo hash_passwords.sql" -ForegroundColor Red
    exit 1
}

try {
    psql -U postgres -d kinesiologia -f $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "  ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
        Write-Host "   - Las contraseñas ahora están hasheadas con bcrypt" -ForegroundColor White
        Write-Host "   - El backend ya está configurado para usar hash" -ForegroundColor White
        Write-Host "   - Puedes iniciar sesión normalmente" -ForegroundColor White
        Write-Host ""
        Write-Host "📝 Credenciales de prueba:" -ForegroundColor Cyan
        Write-Host "   Admin: 11111111-1 / admin123" -ForegroundColor White
        Write-Host "   Practicante: 22222222-2 / prac123" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Error al ejecutar el script SQL" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
