from generalSQL import DELETE

def eliminarAtencion(id: int):
    query = f"""
    DELETE FROM atencion
    WHERE id = {id};
    """
    return DELETE(query)

def eliminarPracticante(nombre: str):
    query = f"""
    DELETE FROM practicante
    WHERE nombre = '{nombre}';
    """
    return DELETE(query)

def eliminarConsultorio(nombre: str):
    query = f"""
    DELETE FROM consultorio
    WHERE nombre = '{nombre}';
    """
    return DELETE(query)

def eliminarTipoAtencion(nombre: str):
    query = f"""
    DELETE FROM tipo_atencion
    WHERE nombre = '{nombre}';
    """
    return DELETE(query)
