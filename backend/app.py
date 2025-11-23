from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware 
import agregar as agregar
import seleccionar as seleccionar
import eliminar as eliminar
import actualizar as actualizar
from utils import auth
from pydantic import BaseModel
from typing import Optional

# Clases (BD -> POO) #
class Consultorio(BaseModel):
    Nombre: str

class TipoAtencion(BaseModel):
    Nombre: str

class Practicante(BaseModel):
    Nombre: str
    Password: str
    Rut: str
    Estado: str



class Atencion(BaseModel):
    Fecha: str
    Consultorio: str
    TipoAtencion: str
    NombrePracticante: str
    Latitud: float
    Longitud: float

class FiltroAtencion(BaseModel):
    Consultorio: str
    TipoAtencion: str
    NombrePracticante: str
    FechaInicio: str
    FechaFinal: str

class Administrador(BaseModel):
    Nombre: str
    Password: str
    Rut: str


def getCurrentUser(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")
    elif not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")
    
    token = authorization.replace("Bearer ", "")
    user = auth.get_current_user_from_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    return user

def getCurrentAdmin(current_user: dict = Depends(getCurrentUser)):
    if current_user.get("cargo") != "Administrador":
        raise HTTPException(status_code=403, detail="Se requieren permisos de administrador")
    return current_user

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
    return {"message": "KineTraining"}

@app.get("/api/health")
def health():
    return {"status": "ok"}
