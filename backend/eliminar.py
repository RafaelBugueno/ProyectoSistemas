from generalSQL import DELETE

def eliminarAtencion(id: int):
    query = """
    DELETE FROM atencion
    WHERE id = %s;
    """
    params = (id,)
    return DELETE((query, params))

def eliminarPracticante(nombre: str):
    query = """
    DELETE FROM practicante
    WHERE nombre = %s;
    """
    params = (nombre,)
    return DELETE((query, params))

def eliminarConsultorio(nombre: str):
    query = """
    DELETE FROM consultorio
    WHERE nombre = %s;
    """
    params = (nombre,)
    return DELETE((query, params))

def eliminarTipoAtencion(nombre: str):
    query = """
    DELETE FROM tipo_atencion
    WHERE nombre = %s;
    """
    params = (nombre,)
    return DELETE((query, params))

def eliminarConsultorioDePracticante(rut: str, consultorio: str):
    query = """
    DELETE FROM practicante_consultorio
    WHERE rut_practicante = %s AND consultorio_nombre = %s;
    """
    params = (rut, consultorio)
    return DELETE((query, params))
