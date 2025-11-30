# Script para construir y ejecutar el backend con Docker
# Uso: .\docker-deploy.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Backend Kinesiologia - Docker Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker esta corriendo
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "Docker instalado" -ForegroundColor Green
} catch {
    Write-Host "Docker no esta instalado o no esta en PATH" -ForegroundColor Red
    Write-Host "   Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar si PostgreSQL esta corriendo
Write-Host "Verificando PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service postgresql* -ErrorAction SilentlyContinue | Where-Object {$_.Status -eq "Running"}
if ($pgService) {
    Write-Host "PostgreSQL esta corriendo" -ForegroundColor Green
} else {
    Write-Host "PostgreSQL no esta corriendo" -ForegroundColor Yellow
    Write-Host "   El contenedor necesita PostgreSQL activo para funcionar" -ForegroundColor Yellow
    $continue = Read-Host "¿Continuar de todas formas? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 1
    }
}

# Detener y eliminar contenedor existente si existe
Write-Host ""
Write-Host "Limpiando contenedores anteriores..." -ForegroundColor Yellow
docker stop kinesiologia-api 2>$null
docker rm kinesiologia-api 2>$null

# Construir imagen
Write-Host ""
Write-Host "Construyendo imagen Docker..." -ForegroundColor Yellow
docker build -t kinesiologia-backend .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Imagen construida exitosamente" -ForegroundColor Green
} else {
    Write-Host "Error al construir la imagen" -ForegroundColor Red
    exit 1
}

# Ejecutar contenedor
Write-Host ""
Write-Host "Iniciando contenedor..." -ForegroundColor Yellow
docker run -d `
    --name kinesiologia-api `
    -p 8000:8000 `
    -e DB_HOST=kinesiologia.cb2682icmjpq.us-east-2.rds.amazonaws.com `
    -e DB_PORT=5432 `
    -e DB_NAME=kinesiologia `
    -e DB_USER=postgres `
    -e DB_PASSWORD=kinesiologia `
    kinesiologia-backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "Contenedor iniciado exitosamente" -ForegroundColor Green
} else {
    Write-Host "Error al iniciar el contenedor" -ForegroundColor Red
    exit 1
}

# Esperar unos segundos y verificar logs
Write-Host ""
Write-Host "Esperando inicializacion (5 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Logs del contenedor:" -ForegroundColor Cyan
docker logs kinesiologia-api

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Despliegue completado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend disponible en:" -ForegroundColor White
Write-Host "   - API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   - Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor White
Write-Host "   docker logs kinesiologia-api          # Ver logs" -ForegroundColor Gray
Write-Host "   docker logs -f kinesiologia-api       # Seguir logs" -ForegroundColor Gray
Write-Host "   docker stop kinesiologia-api          # Detener" -ForegroundColor Gray
Write-Host "   docker start kinesiologia-api         # Iniciar" -ForegroundColor Gray
Write-Host "   docker restart kinesiologia-api       # Reiniciar" -ForegroundColor Gray
Write-Host ""
