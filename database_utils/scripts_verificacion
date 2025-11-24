# Script para verificar datos de login en la base de datos
$ErrorActionPreference = "Continue"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  Verificación de Datos - PostgreSQL" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Verificar administradores
Write-Host "📋 ADMINISTRADORES:" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

$query1 = "SELECT nombre, rut, password FROM administrador ORDER BY nombre;"
psql -U postgres -d kinesiologia -c $query1 -t -A -F " | "

Write-Host "`n"

# Verificar practicantes (solo primeros 5)
Write-Host "📋 PRACTICANTES (primeros 5):" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow

$query2 = "SELECT nombre, rut, password, consultorio FROM practicante ORDER BY nombre LIMIT 5;"
psql -U postgres -d kinesiologia -c $query2 -t -A -F " | "

Write-Host "`n"

# Credenciales de prueba
Write-Host "🔑 CREDENCIALES DE PRUEBA:" -ForegroundColor Green
Write-Host "--------------------------" -ForegroundColor Green
Write-Host "Administrador:" -ForegroundColor Cyan
Write-Host "  RUT: 11111111-1" -ForegroundColor White
Write-Host "  Contraseña: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Practicante:" -ForegroundColor Cyan
Write-Host "  RUT: 22222222-2" -ForegroundColor White
Write-Host "  Contraseña: prac123" -ForegroundColor White

Write-Host "`n======================================`n" -ForegroundColor Cyan
