from generalSQL import SELECT

def seleccionarAtencion(*, nombrePracticante=None, consultorio=None, tipoAtencion=None, fechaInicio=None, fechaFinal=None):
    """
    Selecciona atenciones con filtros opcionales.
    Si un parámetro es None, no se aplica ese filtro.
    """
    conditions = []
    
    if nombrePracticante is not None:
        conditions.append(f"nombre_practicante = '{nombrePracticante}'")
    if consultorio is not None:
        conditions.append(f"consultorio = '{consultorio}'")
    if tipoAtencion is not None:
        conditions.append(f"tipo_atencion = '{tipoAtencion}'")
    if fechaInicio is not None:
        conditions.append(f"fecha >= '{fechaInicio}'")
    if fechaFinal is not None:
        conditions.append(f"fecha <= '{fechaFinal}'")
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    query = f"""
    SELECT * FROM atencion
    WHERE {where_clause}
    ORDER BY fecha DESC;
    """
    return SELECT(query)

def seleccionarTodasLasAtenciones():
    query = "SELECT * FROM atencion ORDER BY fecha DESC;"
    return SELECT(query)

def seleccionarTipoAtencion():
    query = "SELECT * FROM tipo_atencion ORDER BY nombre;"
    return SELECT(query)

def seleccionarConsultorio():
    query = "SELECT * FROM consultorio ORDER BY nombre;"
    return SELECT(query)

def seleccionarPracticantes():
    query = "SELECT nombre, rut, consultorio, estado FROM practicante ORDER BY nombre;"
    return SELECT(query)

def seleccionarPracticantePorNombre(nombre: str):
    query = f"SELECT * FROM practicante WHERE nombre = '{nombre}';"
    return SELECT(query)

def seleccionarAdministradorPorNombre(nombre: str):
    query = f"SELECT * FROM administrador WHERE nombre = '{nombre}';"
    return SELECT(query)

def seleccionarPracticantePorRut(rut: str):
    query = f"SELECT * FROM practicante WHERE rut = '{rut}';"
    return SELECT(query)

def seleccionarAdministradorPorRut(rut: str):
    query = f"SELECT * FROM administrador WHERE rut = '{rut}';"
    return SELECT(query)

def seleccionarAdministradorPorRutConHash(rut: str, password: str):
    """
    Verifica credenciales de administrador usando hash bcrypt de PostgreSQL.
    Retorna el administrador si las credenciales son correctas, None si no.
    """
    query = f"""
    SELECT nombre, rut 
    FROM administrador 
    WHERE rut = '{rut}' 
    AND password = crypt('{password}', password);
    """
    return SELECT(query)

def seleccionarPracticantePorRutConHash(rut: str, password: str):
    """
    Verifica credenciales de practicante usando hash bcrypt de PostgreSQL.
    Retorna el practicante si las credenciales son correctas, None si no.
    """
    query = f"""
    SELECT nombre, rut, consultorio 
    FROM practicante 
    WHERE rut = '{rut}' 
    AND password = crypt('{password}', password);
    """
    return SELECT(query)
