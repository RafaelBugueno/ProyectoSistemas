from generalSQL import UPDATE

def actualizarConsultorioPracticante(nombrePracticante: str, consultorio: str): 
    query = """
    UPDATE practicante
    SET consultorio = %s
    WHERE nombre = %s;
    """
    params = (consultorio, nombrePracticante)
    return UPDATE((query, params))

def actualizarPasswordPracticante(nombre: str, nuevaPassword: str):
    query = """
    UPDATE practicante
    SET password = %s
    WHERE nombre = %s;
    """
    params = (nuevaPassword, nombre)
    return UPDATE((query, params))

def actualizarPasswordAdministrador(nombre: str, nuevaPassword: str):
    query = """
    UPDATE administrador
    SET password = %s
    WHERE nombre = %s;
    """
    params = (nuevaPassword, nombre)
    return UPDATE((query, params))

def actualizarEstadoPracticante(nombre: str, estado: str):
    query = """
    UPDATE practicante
    SET estado = %s
    WHERE nombre = %s;
    """
    params = (estado, nombre)
    return UPDATE((query, params))

def actualizarEstadoConsultorio(nombre: str, estado: str):
    query = """
    UPDATE consultorio
    SET estado = %s
    WHERE nombre = %s;
    """
    params = (estado, nombre)
    return UPDATE((query, params))

print("vendo pan")