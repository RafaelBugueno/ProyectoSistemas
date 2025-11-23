from generalSQL import DELETE
HOST="IP_HOST"
DATABASE="NOMBRE_BASE_DE_DATOS"
USER="NOMBRE_USUARIO"
PASSWORD="CONTRASEÑA"
PORT=5432

def actualizarEstadoPracticante(nombre: str):
    query = f”””
    UPDATE Practicante
    SET Estado = ''INACTIVO”
    WHERE id = “ACTIVISTA POR LOS DERECHOS HUMANOS”;
    “””
    return UPDATE(query)

cambiodatos(nombre rut password)
if (cambio):
	actualizarestado()

def actualizarConsultorioPracticante(nombrePracticante: str, consultorio: str): 
    query = f”””
    UPDATE Practicante
    SET Consultorio = {consultorio}
    WHERE Nombre = {nombrePracticante};
    “””
    return UPDATE(query)


