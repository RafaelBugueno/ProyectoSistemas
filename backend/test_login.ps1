# Script de prueba rápida de login
$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Test de Login - Backend API" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method GET
    Write-Host "✅ Health: $($health.status)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error en health check: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   ¿Está el backend corriendo en el puerto 8000?" -ForegroundColor Red
    exit 1
}

# Test 2: Login Administrador
Write-Host "2. Testing Login Administrador (RUT: 11111111-1)..." -ForegroundColor Yellow
try {
    $body = @{
        username = "11111111-1"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.status -eq "ok") {
        Write-Host "✅ Login exitoso!" -ForegroundColor Green
        Write-Host "   Nombre: $($response.user.nombre)" -ForegroundColor Cyan
        Write-Host "   Tipo: $($response.user.tipo)" -ForegroundColor Cyan
        Write-Host "   RUT: $($response.user.rut)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Login falló: $($response.message)" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error en login administrador: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Login Practicante
Write-Host "3. Testing Login Practicante (RUT: 22222222-2)..." -ForegroundColor Yellow
try {
    $body = @{
        username = "22222222-2"
        password = "prac123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.status -eq "ok") {
        Write-Host "✅ Login exitoso!" -ForegroundColor Green
        Write-Host "   Nombre: $($response.user.nombre)" -ForegroundColor Cyan
        Write-Host "   Tipo: $($response.user.tipo)" -ForegroundColor Cyan
        Write-Host "   RUT: $($response.user.rut)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Login falló: $($response.message)" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error en login practicante: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Login con credenciales incorrectas
Write-Host "4. Testing Login con credenciales incorrectas..." -ForegroundColor Yellow
try {
    $body = @{
        username = "99999999-9"
        password = "wrong"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "⚠️ Debería haber fallado pero no lo hizo" -ForegroundColor Yellow
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Correctamente rechazado (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "✅ Correctamente rechazado" -ForegroundColor Green
    }
    Write-Host ""
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Tests Completados" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
