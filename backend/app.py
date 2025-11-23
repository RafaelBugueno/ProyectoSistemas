from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware 
import agregar as agregar
import seleccionar as seleccionar
import eliminar as eliminar
import actualizar as actualizar
# from utils import auth  # TODO: Implementar módulo de autenticación
from pydantic import BaseModel
from typing import Optional

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

# CORS para desarrollo (React Vite en 5173) #
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)






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
    Endpoint de login - verifica credenciales contra la base de datos
    """
    # Verificar si es administrador
    resultado_admin = seleccionar.seleccionarAdministradorPorNombre(credentials.username)
    if resultado_admin["status"] == "ok" and resultado_admin["data"]:
        admin = resultado_admin["data"][0]
        if admin["password"] == credentials.password:  # TODO: Implementar bcrypt
            return {
                "status": "ok",
                "user": {
                    "nombre": admin["nombre"],
                    "tipo": "admin",
                    "rut": admin["rut"]
                }
            }
    
    # Verificar si es practicante
    resultado_practicante = seleccionar.seleccionarPracticantePorNombre(credentials.username)
    if resultado_practicante["status"] == "ok" and resultado_practicante["data"]:
        practicante = resultado_practicante["data"][0]
        if practicante["password"] == credentials.password:  # TODO: Implementar bcrypt
            return {
                "status": "ok",
                "user": {
                    "nombre": practicante["nombre"],
                    "tipo": "practicante",
                    "rut": practicante["rut"],
                    "consultorio": practicante["consultorio"]
                }
            }
    
    raise HTTPException(status_code=401, detail="Credenciales inválidas")


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
    """Crea un nuevo practicante"""
    # TODO: Hashear password con bcrypt antes de guardar
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
    """Elimina un practicante"""
    resultado = eliminar.eliminarPracticante(nombre)
    if resultado["status"] == "ok":
        return {"status": "ok", "message": "Practicante eliminado exitosamente"}
    raise HTTPException(status_code=500, detail=resultado.get("message", "Error al eliminar practicante"))


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
    resultado = agregar.agregarRegistroAtencion(
        atencion.fecha,
        atencion.consultorio,
        atencion.tipo_atencion,
        atencion.nombre_practicante,
        atencion.latitud or 0.0,
        atencion.longitud or 0.0
    )
    if resultado["status"] == "ok":
        return {"status": "ok", "message": "Atención registrada exitosamente"}
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
