from generalSQL import INSERT
HOST="IP_HOST"
DATABASE="NOMBRE_BASE_DE_DATOS"
USER="NOMBRE_USUARIO"
PASSWORD="CONTRASEÑA"
PORT=5432

def agregarRegistroAtencion(fecha: str, consultorio: str, tipoAtencion: str, nombrePracticante: str, latitud: float, longitud: float):
    query = f’’’
    INSERT INTO RegistroAtencion (Fecha, Consultorio, TipoAtencion, NombrePracticante, Latitud, Longitud)
    VALUES ({fecha}, {consultorio}, {tipoAtencion}, {nombrePracticante}, {latitud}, {longitud});
    ‘’’
    return INSERT(query)

def agregarTipoAtencion(tipoAtencion: str):
    query = f’’’
    INSERT INTO TipoAtencion (TipoAtencion)
    VALUES ({tipoAtencion});
    ‘’’
    return INSERT(query)

def agregarConsultorio(nombre: str):
    query = f’’’
    INSERT INTO Consultorio (Nombre)
    VALUES ({nombre});
    ‘’’
    return INSERT(query)

def agregarPracticante(nombre: str, password: str, rut: str, consultorio: str):
    query = f’’’
    INSERT INTO Practicante (Nombre, Password, Rut, Consultorio)
    VALUES ({nombre}, {password}, {rut}, {consultorio});
    ‘’’
    return INSERT(query)

def agregarAdministrador(nombre: str, password: str, rut: str):
    query = f’’’
    INSERT INTO Administrador (Nombre, Password, Rut)
    VALUES ({nombre}, {password}, {rut});
    ‘’’
    return INSERT(query)
