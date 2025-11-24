from generalSQL import INSERT

def agregarRegistroAtencion(fecha: str, consultorio: str, tipoAtencion: str, nombrePracticante: str, latitud: float, longitud: float):
    query = f'''
    INSERT INTO atencion (fecha, consultorio, tipo_atencion, nombre_practicante, latitud, longitud)
    VALUES ('{fecha}', '{consultorio}', '{tipoAtencion}', '{nombrePracticante}', {latitud}, {longitud});
    '''
    return INSERT(query)

def agregarTipoAtencion(nombre: str):
    query = f'''
    INSERT INTO tipo_atencion (nombre)
    VALUES ('{nombre}');
    '''
    return INSERT(query)

def agregarConsultorio(nombre: str, direccion: str):
    query = f'''
    INSERT INTO consultorio (nombre, direccion)
    VALUES ('{nombre}', '{direccion}');
    '''
    return INSERT(query)

def agregarPracticante(nombre: str, password: str, rut: str, consultorio: str):
    # Usar crypt de PostgreSQL para hashear la contraseña con bcrypt
    query = f'''
    INSERT INTO practicante (nombre, password, rut, consultorio)
    VALUES ('{nombre}', crypt('{password}', gen_salt('bf')), '{rut}', '{consultorio}');
    '''
    return INSERT(query)

def agregarAdministrador(nombre: str, password: str, rut: str):
    # Usar crypt de PostgreSQL para hashear la contraseña con bcrypt
    query = f'''
    INSERT INTO administrador (nombre, password, rut)
    VALUES ('{nombre}', crypt('{password}', gen_salt('bf')), '{rut}');
    '''
    return INSERT(query)
