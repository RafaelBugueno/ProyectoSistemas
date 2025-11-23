# Script para probar el endpoint de registro de atenciones
$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test: Registrar Atención" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Preparar datos de prueba
$atencion = @{
    fecha = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    consultorio = "Consultorio Central"
    tipo_atencion = "Masaje Terapéutico"
    nombre_practicante = "Juan Pérez López"
    latitud = -33.4489
    longitud = -70.6693
} | ConvertTo-Json

Write-Host "Datos a enviar:" -ForegroundColor Yellow
Write-Host $atencion -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "Enviando petición POST a /api/atenciones..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod `
        -Uri "http://localhost:8000/api/atenciones" `
        -Method POST `
        -Body $atencion `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✅ Atención registrada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta del servidor:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error al registrar atención" -ForegroundColor Red
    Write-Host ""
    Write-Host "Código de estado: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Detalles del error:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
