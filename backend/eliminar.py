from generalSQL import DELETE
HOST="IP_HOST"
DATABASE="NOMBRE_BASE_DE_DATOS"
USER="NOMBRE_USUARIO"
PASSWORD="CONTRASEÑA"
PORT=5432

def eliminarPracticante(nombre: str):
    query = f”””
    DELETE FROM Practicante
    WHERE Nombre = {nombre};
    “””
    return DELETE(query)
