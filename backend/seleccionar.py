from generalSQL import SELECT

def seleccionarAtencion(*, nombrePracticante=None, consultorio=None, tipoAtencion=None, fechaInicio=None, fechaFinal=None):
    """
    Selecciona atenciones con filtros opcionales.
    Si un parámetro es None, no se aplica ese filtro.
    """
    conditions = []
    params = []
    
    if nombrePracticante is not None:
        conditions.append("nombre_practicante = %s")
        params.append(nombrePracticante)
    if consultorio is not None:
        conditions.append("consultorio = %s")
        params.append(consultorio)
    if tipoAtencion is not None:
        conditions.append("tipo_atencion = %s")
        params.append(tipoAtencion)
    if fechaInicio is not None:
        conditions.append("fecha >= %s")
        params.append(fechaInicio)
    if fechaFinal is not None:
        conditions.append("fecha <= %s")
        params.append(fechaFinal)
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    query = f"""
    SELECT * FROM atencion
    WHERE {where_clause}
    ORDER BY fecha DESC;
    """
    return SELECT((query, tuple(params)))

def seleccionarTodasLasAtenciones():
    query = "SELECT * FROM atencion ORDER BY fecha DESC;"
    return SELECT((query, ()))

def seleccionarTipoAtencion():
    query = "SELECT * FROM tipo_atencion ORDER BY nombre;"
    return SELECT((query, ()))

def seleccionarConsultorio():
    query = "SELECT * FROM consultorio ORDER BY nombre;"
    return SELECT((query, ()))

def seleccionarConsultoriosDePracticante(rut: str):
    query = """
    SELECT c.nombre, c.estado
    FROM practicante_consultorio pc
    JOIN consultorio c ON pc.consultorio_nombre = c.nombre
    WHERE pc.rut_practicante = %s
    ORDER BY c.nombre;
    """
    params = (rut,)
    return SELECT((query, params))

def seleccionarPracticantes():
    query = "SELECT nombre, rut, consultorio, estado FROM practicante ORDER BY nombre;"
    return SELECT((query, ()))

def seleccionarPracticantePorNombre(nombre: str):
    query = "SELECT * FROM practicante WHERE nombre = %s;"
    params = (nombre,)
    return SELECT((query, params))

def seleccionarAdministradorPorNombre(nombre: str):
    query = "SELECT * FROM administrador WHERE nombre = %s;"
    params = (nombre,)
    return SELECT((query, params))

def seleccionarPracticantePorRut(rut: str):
    query = "SELECT * FROM practicante WHERE rut = %s;"
    params = (rut,)
    return SELECT((query, params))

def seleccionarAdministradorPorRut(rut: str):
    query = "SELECT * FROM administrador WHERE rut = %s;"
    params = (rut,)
    return SELECT((query, params))

def seleccionarAdministradorPorRutConHash(rut: str, password: str):
    """
    Verifica credenciales de administrador usando hash bcrypt de PostgreSQL.
    Retorna el administrador si las credenciales son correctas, None si no.
    """
    query = """
    SELECT nombre, rut 
    FROM administrador 
    WHERE rut = %s 
    AND password = crypt(%s, password);
    """
    params = (rut, password)
    return SELECT((query, params))

def seleccionarPracticantePorRutConHash(rut: str, password: str):
    """
    Verifica credenciales de practicante usando hash bcrypt de PostgreSQL.
    Retorna el practicante si las credenciales son correctas, None si no.
    """
    query = """
    SELECT nombre, rut, consultorio 
    FROM practicante 
    WHERE rut = %s 
    AND password = crypt(%s, password);
    """
    params = (rut, password)
    return SELECT((query, params))
