import requests
import json

BASE_URL = "http://localhost:8000"

print("🧪 Testeando API del Backend\n")
print("=" * 50)

# Test 1: Health check
print("\n1️⃣ Test: GET /api/health")
try:
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Obtener consultorios
print("\n2️⃣ Test: GET /api/consultorios")
try:
    response = requests.get(f"{BASE_URL}/api/consultorios")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Consultorios: {len(data.get('data', []))}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Obtener tipos de atención
print("\n3️⃣ Test: GET /api/tipos-atencion")
try:
    response = requests.get(f"{BASE_URL}/api/tipos-atencion")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Tipos: {len(data.get('data', []))}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 4: Obtener atenciones
print("\n4️⃣ Test: GET /api/atenciones")
try:
    response = requests.get(f"{BASE_URL}/api/atenciones")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Atenciones: {len(data.get('data', []))}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 5: Login
print("\n5️⃣ Test: POST /api/auth/login")
try:
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": "Juan Pérez López", "password": "prac123"}
    )
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   User: {data.get('user', {}).get('nombre', 'N/A')}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 6: CORS preflight
print("\n6️⃣ Test: OPTIONS /api/consultorios (CORS)")
try:
    response = requests.options(
        f"{BASE_URL}/api/consultorios",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        }
    )
    print(f"   Status: {response.status_code}")
    print(f"   CORS Headers: {response.headers.get('Access-Control-Allow-Origin', 'N/A')}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 50)
print("✅ Tests completados\n")
