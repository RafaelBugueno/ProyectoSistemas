# Script para verificar que las contraseñas hasheadas funcionan correctamente

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  TEST DE CONTRASEÑAS HASHEADAS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verificar que la extensión pgcrypto está habilitada
$env:PGPASSWORD = "cacaseca000"

# Test 1: Verificar que la extensión pgcrypto está habilitada
Write-Host "📦 Test 1: Verificando extensión pgcrypto..." -ForegroundColor Yellow
$result = psql -U postgres -d kinesiologia -t -c "SELECT COUNT(*) FROM pg_extension WHERE extname = 'pgcrypto';"
if ($result.Trim() -eq "1") {
    Write-Host "   ✅ pgcrypto está habilitada" -ForegroundColor Green
} else {
    Write-Host "   ❌ pgcrypto NO está habilitada" -ForegroundColor Red
    Write-Host "   Ejecuta: CREATE EXTENSION pgcrypto;" -ForegroundColor Yellow
}
Write-Host ""

# Test 2: Verificar contraseñas hasheadas en administrador
Write-Host "🔐 Test 2: Verificando hashes en tabla administrador..." -ForegroundColor Yellow
$hashCount = psql -U postgres -d kinesiologia -t -c "SELECT COUNT(*) FROM administrador WHERE password LIKE '$2%';"
$totalCount = psql -U postgres -d kinesiologia -t -c "SELECT COUNT(*) FROM administrador;"
Write-Host "   Total administradores: $($totalCount.Trim())" -ForegroundColor White
Write-Host "   Contraseñas hasheadas: $($hashCount.Trim())" -ForegroundColor White
if ($hashCount.Trim() -eq $totalCount.Trim() -and $totalCount.Trim() -gt "0") {
    Write-Host "   ✅ Todas las contraseñas están hasheadas" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Algunas contraseñas NO están hasheadas" -ForegroundColor Yellow
}
Write-Host ""

# Test 3: Verificar contraseñas hasheadas en practicante
Write-Host "🔐 Test 3: Verificando hashes en tabla practicante..." -ForegroundColor Yellow
$hashCount = psql -U postgres -d kinesiologia -t -c "SELECT COUNT(*) FROM practicante WHERE password LIKE '$2%';"
$totalCount = psql -U postgres -d kinesiologia -t -c "SELECT COUNT(*) FROM practicante;"
Write-Host "   Total practicantes: $($totalCount.Trim())" -ForegroundColor White
Write-Host "   Contraseñas hasheadas: $($hashCount.Trim())" -ForegroundColor White
if ($hashCount.Trim() -eq $totalCount.Trim() -and $totalCount.Trim() -gt "0") {
    Write-Host "   ✅ Todas las contraseñas están hasheadas" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Algunas contraseñas NO están hasheadas" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Verificar login de administrador con contraseña hasheada
Write-Host "🔑 Test 4: Probando login de administrador..." -ForegroundColor Yellow
$result = psql -U postgres -d kinesiologia -t -c "SELECT nombre FROM administrador WHERE rut = '11111111-1' AND password = crypt('admin123', password);"
if ($result.Trim()) {
    Write-Host "   ✅ Login de admin funciona correctamente" -ForegroundColor Green
    Write-Host "   Usuario: $($result.Trim())" -ForegroundColor White
} else {
    Write-Host "   ❌ Login de admin NO funciona" -ForegroundColor Red
}
Write-Host ""

# Test 5: Verificar login de practicante con contraseña hasheada
Write-Host "🔑 Test 5: Probando login de practicante..." -ForegroundColor Yellow
$result = psql -U postgres -d kinesiologia -t -c "SELECT nombre FROM practicante WHERE rut = '22222222-2' AND password = crypt('prac123', password);"
if ($result.Trim()) {
    Write-Host "   ✅ Login de practicante funciona correctamente" -ForegroundColor Green
    Write-Host "   Usuario: $($result.Trim())" -ForegroundColor White
} else {
    Write-Host "   ❌ Login de practicante NO funciona" -ForegroundColor Red
}
Write-Host ""

# Test 6: Verificar que contraseña incorrecta falla
Write-Host "🔒 Test 6: Probando que contraseña incorrecta falla..." -ForegroundColor Yellow
$result = psql -U postgres -d kinesiologia -t -c "SELECT nombre FROM administrador WHERE rut = '11111111-1' AND password = crypt('wrongpassword', password);"
if (-not $result.Trim()) {
    Write-Host "   ✅ Contraseña incorrecta rechazada correctamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ ALERTA: Contraseña incorrecta fue aceptada!" -ForegroundColor Red
}
Write-Host ""

Remove-Item Env:\PGPASSWORD

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETADOS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
