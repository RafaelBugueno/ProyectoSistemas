from generalSQL import INSERT

def agregarRegistroAtencion(fecha: str, consultorio: str, tipoAtencion: str, nombrePracticante: str, latitud: float, longitud: float):
    query = '''
    INSERT INTO atencion (fecha, consultorio, tipo_atencion, nombre_practicante, latitud, longitud)
    VALUES (%s, %s, %s, %s, %s, %s);
    '''
    params = (fecha, consultorio, tipoAtencion, nombrePracticante, latitud, longitud)
    return INSERT((query, params))

def agregarTipoAtencion(nombre: str):
    query = '''
    INSERT INTO tipo_atencion (nombre)
    VALUES (%s);
    '''
    params = (nombre,)
    return INSERT((query, params))

def agregarConsultorio(nombre: str, direccion: str):
    query = '''
    INSERT INTO consultorio (nombre, direccion)
    VALUES (%s, %s);
    '''
    params = (nombre, direccion)
    return INSERT((query, params))

def agregarPracticante(nombre: str, password: str, rut: str, consultorio: str):
    # Usar crypt de PostgreSQL para hashear la contraseña con bcrypt
    query = '''
    INSERT INTO practicante (nombre, password, rut, consultorio)
    VALUES (%s, crypt(%s, gen_salt('bf')), %s, %s);
    '''
    params = (nombre, password, rut, consultorio)
    return INSERT((query, params))

def agregarAdministrador(nombre: str, password: str, rut: str):
    # Usar crypt de PostgreSQL para hashear la contraseña con bcrypt
    query = '''
    INSERT INTO administrador (nombre, password, rut)
    VALUES (%s, crypt(%s, gen_salt('bf')), %s);
    '''
    params = (nombre, password, rut)
    return INSERT((query, params))

def asignarConsultorioAPracticante(rut: str, consultorio: str):
    query = '''
    INSERT INTO practicante_consultorio (rut_practicante, consultorio_nombre)
    VALUES (%s, %s)
    ON CONFLICT (rut_practicante, consultorio_nombre) DO NOTHING;
    '''
    params = (rut, consultorio)
    return INSERT((query, params))
