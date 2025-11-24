from generalSQL import UPDATE

def actualizarConsultorioPracticante(nombrePracticante: str, consultorio: str): 
    query = f"""
    UPDATE practicante
    SET consultorio = '{consultorio}'
    WHERE nombre = '{nombrePracticante}';
    """
    return UPDATE(query)

def actualizarPasswordPracticante(nombre: str, nuevaPassword: str):
    query = f"""
    UPDATE practicante
    SET password = '{nuevaPassword}'
    WHERE nombre = '{nombre}';
    """
    return UPDATE(query)

def actualizarPasswordAdministrador(nombre: str, nuevaPassword: str):
    query = f"""
    UPDATE administrador
    SET password = '{nuevaPassword}'
    WHERE nombre = '{nombre}';
    """
    return UPDATE(query)

def actualizarEstadoPracticante(nombre: str, estado: str):
    query = f"""
    UPDATE practicante
    SET estado = '{estado}'
    WHERE nombre = '{nombre}';
    """
    return UPDATE(query)

