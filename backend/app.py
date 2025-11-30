from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.responses import JSONResponse
import agregar as agregar
import seleccionar as seleccionar
import eliminar as eliminar
import actualizar as actualizar
# Autenticación con bcrypt usando pgcrypto de PostgreSQL
# Las contraseñas se almacenan hasheadas en la base de datos
from pydantic import BaseModel
from typing import Optional
import traceback
import time
import hmac
import hashlib
import base64
import json

# Modelos Pydantic para request/response #

class LoginRequest(BaseModel):
    username: str
    password: str

class ConsultorioCreate(BaseModel):
    nombre: str
    direccion: str

class TipoAtencionCreate(BaseModel):
    nombre: str

class PracticanteCreate(BaseModel):
    nombre: str
    password: str
    rut: str
    consultorio: str

class AtencionCreate(BaseModel):
    fecha: str  # TIMESTAMP en formato ISO
    consultorio: str
    tipo_atencion: str
    nombre_practicante: str
    latitud: Optional[float] = None
    longitud: Optional[float] = None

class AdministradorCreate(BaseModel):
    nombre: str
    password: str
    rut: str

class SincronizarRequest(BaseModel):
    atenciones: list[dict]  # Lista de atenciones del localStorage


# TODO: Implementar autenticación con JWT
# def getCurrentUser(authorization: Optional[str] = Header(None)):
#     if not authorization:
#         raise HTTPException(status_code=401, detail="No autorizado")
#     elif not authorization.startswith("Bearer "):
#         raise HTTPException(status_code=401, detail="Token inválido")
#     
#     token = authorization.replace("Bearer ", "")
#     user = auth.get_current_user_from_token(token)
#     
#     if not user:
#         raise HTTPException(status_code=401, detail="Token inválido o expirado")
#     return user

# def getCurrentAdmin(current_user: dict = Depends(getCurrentUser)):
#     if current_user.get("cargo") != "Administrador":
#         raise HTTPException(status_code=403, detail="Se requieren permisos de administrador")
#     return current_user

app = FastAPI(title="Proyecto Kinesiologia")

# =============================
# Token (HMAC) utilities
# =============================
SECRET_KEY = "super-secret-key-change-me"
TOKEN_EXP_SECONDS = 2 * 60 * 60  # 2 horas

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

def _b64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))

def create_token(payload: dict, exp_seconds: int = TOKEN_EXP_SECONDS) -> dict:
    now = int(time.time())
    exp = now + exp_seconds
    body = {**payload, "iat": now, "exp": exp}
    body_json = json.dumps(body, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), body_json, hashlib.sha256).digest()
    token = f"{_b64url_encode(body_json)}.{_b64url_encode(signature)}"
    return {"token": token, "exp": exp}

def verify_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        body_json_b64, sig_b64 = parts
        body_json = _b64url_decode(body_json_b64)
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), body_json, hashlib.sha256).digest()
        if not hmac.compare_digest(expected_sig, _b64url_decode(sig_b64)):
            return None
        body = json.loads(body_json.decode("utf-8"))
        if int(time.time()) > int(body.get("exp", 0)):
            return None
        return body
    except Exception:
        return None

# Middleware para logging de requests (declarado PRIMERO para ejecutarse ÚLTIMO)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🔵 {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        print(f"✅ {request.method} {request.url.path} - Status: {response.status_code}")
        return response
    except Exception as e:
        print(f"❌ {request.method} {request.url.path} - Error: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": str(e), "status": "error"}
        )

# Middleware para manejar CORS (declarado ÚLTIMO para ejecutarse PRIMERO)
@app.middleware("http")
async def cors_handler(request: Request, call_next):
    # Si es OPTIONS, responder inmediatamente con headers CORS
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    
    # Para otras requests, procesarlas normalmente y agregar headers CORS
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response






@app.get("/")
def root():
    return {"message": "API Sistema Kinesiología", "version": "1.0.0"}

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "API funcionando correctamente"}


# ============================================
# ENDPOINTS DE AUTENTICACIÓN
# ============================================

@app.post("/api/auth/login")
def login(credentials: LoginRequest):
    """
    Endpoint de login - verifica credenciales contra la base de datos usando RUT con contraseñas hasheadas
    """
    print(f"🔑 Intento de login - RUT: {credentials.username}")
    
    # Verificar si es administrador
    resultado_admin = seleccionar.seleccionarAdministradorPorRutConHash(credentials.username, credentials.password)
    
    if resultado_admin["status"] == "error":
        print(f"❌ Error de BD al buscar administrador: {resultado_admin.get('message')}")
        raise HTTPException(
            status_code=500,
            detail="Error de conexión con la base de datos. Verifica que PostgreSQL esté en ejecución."
        )
    
    if resultado_admin["data"]:
        admin = resultado_admin["data"][0]
        token_info = create_token({"tipo": "admin", "rut": admin["rut"], "nombre": admin["nombre"]})
        print(f"✅ Login exitoso - Admin: {admin['nombre']}")
        return {
            "status": "ok",
            "user": {
                "nombre": admin["nombre"],
                "tipo": "admin",
                "rut": admin["rut"]
            },
            "token": token_info["token"],
            "expiresAt": token_info["exp"]
        }
    
    # Verificar si es practicante
    resultado_practicante = seleccionar.seleccionarPracticantePorRutConHash(credentials.username, credentials.password)
    
    if resultado_practicante["status"] == "error":
        print(f"❌ Error de BD al buscar practicante: {resultado_practicante.get('message')}")
        raise HTTPException(
            status_code=500,
            detail="Error de conexión con la base de datos. Verifica que PostgreSQL esté en ejecución."
        )
    
    if resultado_practicante["data"]:
        practicante = resultado_practicante["data"][0]
        token_info = create_token({"tipo": "kinesiologo", "rut": practicante["rut"], "nombre": practicante["nombre"], "consultorio": practicante["consultorio"]})
        print(f"✅ Login exitoso - Practicante: {practicante['nombre']}")
        return {
            "status": "ok",
            "user": {
                "nombre": practicante["nombre"],
                "tipo": "kinesiologo",
                "rut": practicante["rut"],
                "consultorio": practicante["consultorio"]
            },
            "token": token_info["token"],
            "expiresAt": token_info["exp"]
        }
    
    print(f"❌ RUT o contraseña incorrectos: {credentials.username}")
    raise HTTPException(
        status_code=401,
        detail="RUT o contraseña incorrectos. Verifica tus credenciales."
    )


# ============================================
# ENDPOINTS DE CONSULTORIOS
# ============================================

@app.get("/api/consultorios")
def obtener_consultorios():
    """Obtiene todos los consultorios"""
    resultado = seleccionar.seleccionarConsultorio()
    if resultado["status"] == "ok":
        return {"status": "ok", "data": resultado["data"]}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al obtener consultorios"))

@app.post("/api/consultorios")
def crear_consultorio(consultorio: ConsultorioCreate):
    """Crea un nuevo consultorio"""
    resultado = agregar.agregarConsultorio(consultorio.nombre, consultorio.direccion)
    if resultado["status"] == "ok":
        return {"status": "ok", "message": "Consultorio creado exitosamente"}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al crear consultorio"))


# ============================================
# ENDPOINTS DE TIPOS DE ATENCIÓN
# ============================================

@app.get("/api/tipos-atencion")
def obtener_tipos_atencion():
    """Obtiene todos los tipos de atención"""
    resultado = seleccionar.seleccionarTipoAtencion()
    if resultado["status"] == "ok":
        return {"status": "ok", "data": resultado["data"]}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al obtener tipos de atención"))

@app.post("/api/tipos-atencion")
def crear_tipo_atencion(tipo: TipoAtencionCreate):
    """Crea un nuevo tipo de atención"""
    resultado = agregar.agregarTipoAtencion(tipo.nombre)
    if resultado["status"] == "ok":
        return {"status": "ok", "message": "Tipo de atención creado exitosamente"}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al crear tipo de atención"))


# ============================================
# ENDPOINTS DE PRACTICANTES
# ============================================

@app.get("/api/practicantes")
def obtener_practicantes():
    """Obtiene todos los practicantes"""
    resultado = seleccionar.seleccionarPracticantes()
    if resultado["status"] == "ok":
        return {"status": "ok", "data": resultado["data"]}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al obtener practicantes"))

@app.post("/api/practicantes")
def crear_practicante(practicante: PracticanteCreate):
    """Crea un nuevo practicante con contraseña hasheada"""
    resultado = agregar.agregarPracticante(
        practicante.nombre,
        practicante.password,
        practicante.rut,
        practicante.consultorio
    )
    if resultado["status"] == "ok":
        return {"status": "ok", "message": "Practicante creado exitosamente"}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al crear practicante"))

@app.delete("/api/practicantes/{nombre}")
def eliminar_practicante_endpoint(nombre: str):
    """Desactiva un practicante cambiando su estado a 'inactivo'"""
    resultado = actualizar.actualizarEstadoPracticante(nombre, "inactivo")
    if resultado["status"] == "ok":
        return {"status": "ok", "message": "Practicante desactivado exitosamente"}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al desactivar practicante"))

@app.put("/api/practicantes/{nombre}/activar")
def activar_practicante_endpoint(nombre: str):
    """Activa un practicante cambiando su estado a 'activo'"""
    resultado = actualizar.actualizarEstadoPracticante(nombre, "activo")
    if resultado["status"] == "ok":
        return {"status": "ok", "message": "Practicante activado exitosamente"}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al activar practicante"))

@app.put("/api/practicantes/{nombre}")
def actualizar_practicante_endpoint(nombre: str, data: dict):
    """Actualiza el consultorio de un practicante"""
    consultorio = data.get("consultorio")
    if not consultorio:
        raise HTTPException(status_code=400, detail="Consultorio es requerido")
    
    resultado = actualizar.actualizarConsultorioPracticante(nombre, consultorio)
    if resultado["status"] == "ok":
        return {"status": "ok", "message": "Practicante actualizado exitosamente"}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al actualizar practicante"))


# ============================================
# ENDPOINTS DE ATENCIONES
# ============================================

@app.get("/api/atenciones")
def obtener_atenciones(
    nombre_practicante: Optional[str] = None,
    consultorio: Optional[str] = None,
    tipo_atencion: Optional[str] = None,
    fecha_inicio: Optional[str] = None,
    fecha_final: Optional[str] = None
):
    """
    Obtiene atenciones con filtros opcionales
    Parámetros de query: nombre_practicante, consultorio, tipo_atencion, fecha_inicio, fecha_final
    """
    if not any([nombre_practicante, consultorio, tipo_atencion, fecha_inicio, fecha_final]):
        # Sin filtros, obtener todas
        resultado = seleccionar.seleccionarTodasLasAtenciones()
    else:
        # Con filtros
        resultado = seleccionar.seleccionarAtencion(
            nombrePracticante=nombre_practicante,
            consultorio=consultorio,
            tipoAtencion=tipo_atencion,
            fechaInicio=fecha_inicio,
            fechaFinal=fecha_final
        )
    
    if resultado["status"] == "ok":
        return {"status": "ok", "data": resultado["data"]}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al obtener atenciones"))

@app.post("/api/atenciones")
def crear_atencion(atencion: AtencionCreate):
    """Registra una nueva atención"""
    print(f"📝 Registrando atención:")
    print(f"   Fecha: {atencion.fecha}")
    print(f"   Consultorio: {atencion.consultorio}")
    print(f"   Tipo: {atencion.tipo_atencion}")
    print(f"   Practicante: {atencion.nombre_practicante}")
    print(f"   Ubicación: ({atencion.latitud}, {atencion.longitud})")
    
    resultado = agregar.agregarRegistroAtencion(
        atencion.fecha,
        atencion.consultorio,
        atencion.tipo_atencion,
        atencion.nombre_practicante,
        atencion.latitud or 0.0,
        atencion.longitud or 0.0
    )
    
    if resultado["status"] == "ok":
        print(f"✅ Atención registrada exitosamente")
        return {"status": "ok", "message": "Atención registrada exitosamente"}
    
    print(f"❌ Error al registrar atención: {resultado.get('message')}")
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al registrar atención"))

@app.delete("/api/atenciones/{id}")
def eliminar_atencion_endpoint(id: int):
    """Elimina una atención por ID"""
    resultado = eliminar.eliminarAtencion(id)
    if resultado["status"] == "ok":
        return {"status": "ok", "message": "Atención eliminada exitosamente"}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al eliminar atención"))


# ============================================
# ENDPOINTS DE ESTADÍSTICAS (para AdminPage)
# ============================================

@app.get("/api/estadisticas/resumen")
def obtener_estadisticas_resumen():
    """Obtiene estadísticas generales para el dashboard del admin"""
    # Total de atenciones
    atenciones = seleccionar.seleccionarTodasLasAtenciones()
    total_atenciones = len(atenciones["data"]) if atenciones["status"] == "ok" else 0
    
    # Total de practicantes
    practicantes = seleccionar.seleccionarPracticantes()
    total_practicantes = len(practicantes["data"]) if practicantes["status"] == "ok" else 0
    
    # Última atención
    ultima_atencion = None
    if atenciones["status"] == "ok" and atenciones["data"]:
        ultima_atencion = atenciones["data"][0]  # Ya están ordenadas DESC
    
    # Ubicaciones únicas (contar combinaciones únicas de lat/lng)
    ubicaciones_unicas = set()
    if atenciones["status"] == "ok":
        for atencion in atenciones["data"]:
            if atencion.get("latitud") and atencion.get("longitud"):
                ubicaciones_unicas.add((atencion["latitud"], atencion["longitud"]))
    
    return {
        "status": "ok",
        "data": {
            "total_atenciones": total_atenciones,
            "total_practicantes": total_practicantes,
            "ultima_atencion": ultima_atencion,
            "ubicaciones_unicas": len(ubicaciones_unicas)
        }
    }


# ============================================
# ENDPOINTS PARA FILTROS DINÁMICOS
# ============================================

@app.get("/api/practicantes/activos")
def obtener_practicantes_activos():
    """Obtiene nombres únicos de practicantes que tienen al menos 1 atención registrada"""
    atenciones = seleccionar.seleccionarTodasLasAtenciones()
    if atenciones["status"] == "ok":
        nombres_unicos = sorted(list(set([a["nombre_practicante"] for a in atenciones["data"]])))
        return {"status": "ok", "data": nombres_unicos}
    raise HTTPException(status_code=500, detail="Error al obtener practicantes activos")

@app.get("/api/tipos-atencion/usados")
def obtener_tipos_usados():
    """Obtiene tipos de atención que han sido usados en al menos 1 atención"""
    atenciones = seleccionar.seleccionarTodasLasAtenciones()
    if atenciones["status"] == "ok":
        tipos_unicos = sorted(list(set([a["tipo_atencion"] for a in atenciones["data"]])))
        return {"status": "ok", "data": tipos_unicos}
    raise HTTPException(status_code=500, detail="Error al obtener tipos usados")


# ============================================
# ENDPOINT DE SINCRONIZACIÓN
# ============================================

@app.post("/api/sincronizar")
def sincronizar_datos(sync_request: SincronizarRequest):
    """
    Sincroniza atenciones del localStorage con la base de datos
    Recibe un array de atenciones y las inserta en batch
    """
    print(f"\n🔄 Iniciando sincronización de {len(sync_request.atenciones)} registros")
    exitosos = 0
    fallidos = 0
    errores = []
    
    for i, atencion in enumerate(sync_request.atenciones, 1):
        try:
            # Extraer datos del objeto localStorage (formato del frontend)
            fecha = atencion.get("fecha")
            consultorio = atencion.get("consultorio") or "Sin consultorio"
            tipo_atencion = atencion.get("tratamiento")
            nombre_practicante = atencion.get("kinesiologo_nombre")
            latitud = atencion.get("latitud", 0.0)
            longitud = atencion.get("longitud", 0.0)
            
            print(f"  [{i}/{len(sync_request.atenciones)}] Procesando:")
            print(f"    - Fecha: {fecha}")
            print(f"    - Consultorio: {consultorio}")
            print(f"    - Tipo: {tipo_atencion}")
            print(f"    - Practicante: {nombre_practicante}")
            
            # Validar campos requeridos
            if not all([fecha, consultorio, tipo_atencion, nombre_practicante]):
                print(f"    ❌ Campos faltantes")
                fallidos += 1
                errores.append({
                    "atencion_id": atencion.get("id"), 
                    "error": "Campos requeridos faltantes"
                })
                continue
            
            # Insertar en la base de datos
            resultado = agregar.agregarRegistroAtencion(
                fecha,
                consultorio,
                tipo_atencion,
                nombre_practicante,
                latitud,
                longitud
            )
            
            if resultado["status"] == "ok":
                print(f"    ✅ Sincronizado exitosamente")
                exitosos += 1
            else:
                print(f"    ❌ Error: {resultado.get('message')}")
                fallidos += 1
                errores.append({"atencion_id": atencion.get("id"), "error": resultado.get("message")})
        except Exception as e:
            print(f"    ❌ Excepción: {str(e)}")
            fallidos += 1
            errores.append({"atencion_id": atencion.get("id"), "error": str(e)})
    
    # Determinar el status de la respuesta
    if fallidos == 0:
        status = "ok"
        print(f"\n✅ Sincronización completa: {exitosos} registros")
    elif exitosos == 0:
        status = "error"
        print(f"\n❌ Sincronización fallida: {fallidos} registros con error")
    else:
        status = "partial"
        print(f"\n⚠️ Sincronización parcial: {exitosos} exitosos, {fallidos} fallidos")
    
    return {
        "status": status,
        "exitosos": exitosos,
        "fallidos": fallidos,
        "total": len(sync_request.atenciones),
        "errores": errores if errores else None
    }
