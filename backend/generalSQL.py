def INSERT(query: str):
    conexion, cursor = __conectar()
    cursor.execute(query)
    conexion.commit()
    return {"status": "ok", "message": "INSERT exitoso"}
    __desconectar(conexion, cursor)

def SELECT(query: str):
    conexion, cursor = __conectar()
    cursor.execute(query)
    filas = cursor.fetchall()
    columnas = [description[0] for description in cursor.description]
    resultados = [dict(zip(columnas, fila)) for fila in filas]
    return {"status": "ok", "data": resultados}
    __desconectar(conexion, cursor)

def DELETE(query: str):
    conexion, cursor = __conectar()
    cursor.execute(query)
    conexion.commit()
    return {"status": "ok", "message": "DELETE exitoso"}
    __desconectar(conexion, cursor)

def __conectar():
    conexion = None
    cursor = None
    try:
        conexion = psycopg2.connect(
            host=HOST,
            database=DATABASE,
            user=USER,
            password=PASSWORD,
            port=PORT
        )
        cursor = conexion.cursor()
        return conexion, cursor
    except Exception as e:
        print("Error", e) # ELIMINAR #
        return {"status": "error", "message": "Error"}

def __desconectar(conexion, cursor):
    if conexion:
        cursor.close()
        conexion.close()

