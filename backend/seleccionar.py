from generalSQL import SELECT
HOST="IP_HOST"
DATABASE="NOMBRE_BASE_DE_DATOS"
USER="NOMBRE_USUARIO"
PASSWORD="CONTRASEÑA"
PORT=5432

def seleccionarAtencion(*, nombrePracticante=None, consultorio=None, tipoAtencion=None, fechaInicio=None, fechaFinal=None):
    query = f”””
    SELECT * FROM Atencion
    WHERE NombrePracticante = {nombrePracticante if nombrePracticante is not None else ‘NombrePracticante’}
    AND Consultorio = {consultorio if consultorio is not None else “Consultorio”}
    AND TipoAtencion = {tipoAtencion if tipoAtencion is not None else ‘TipoAtencion’}
    AND {fechaInicio if fechaInicio is not None else ‘0000-00-00’} <= fecha
    AND fecha >= {fechaFinal if fechaFinal is not None else ‘9999-12-31};
    “””
    return = SELECT(query)

def seleccionarTipoAtencion():
    query = ”SELECT * FROM TipoAtencion;”
    return = SELECT(query)

def seleccionarConsultorio():
    query = ”SELECT * FROM consultorio;”
    return = SELECT(query)



