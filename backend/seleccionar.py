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
    query = "SELECT nombre, rut, consultorio FROM practicante ORDER BY nombre;"
    return SELECT(query)

def seleccionarPracticantePorNombre(nombre: str):
    query = f"SELECT * FROM practicante WHERE nombre = '{nombre}';"
    return SELECT(query)

def seleccionarAdministradorPorNombre(nombre: str):
    query = f"SELECT * FROM administrador WHERE nombre = '{nombre}';"
    return SELECT(query)
