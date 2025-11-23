import psycopg2
from typing import Dict, Any

# Configuración de la base de datos
HOST = "localhost"
DATABASE = "kinesiologia"
USER = "postgres"
PASSWORD = "postgres"  # Cambiar por tu contraseña
PORT = 5432

def INSERT(query: str) -> Dict[str, Any]:
    """Ejecuta una query INSERT y retorna el resultado"""
    conexion, cursor = None, None
    try:
        conexion, cursor = __conectar()
        cursor.execute(query)
        conexion.commit()
        return {"status": "ok", "message": "INSERT exitoso"}
    except Exception as e:
        if conexion:
            conexion.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        __desconectar(conexion, cursor)

def SELECT(query: str) -> Dict[str, Any]:
    """Ejecuta una query SELECT y retorna los resultados"""
    conexion, cursor = None, None
    try:
        conexion, cursor = __conectar()
        cursor.execute(query)
        filas = cursor.fetchall()
        columnas = [description[0] for description in cursor.description]
        resultados = [dict(zip(columnas, fila)) for fila in filas]
        return {"status": "ok", "data": resultados}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        __desconectar(conexion, cursor)

def UPDATE(query: str) -> Dict[str, Any]:
    """Ejecuta una query UPDATE y retorna el resultado"""
    conexion, cursor = None, None
    try:
        conexion, cursor = __conectar()
        cursor.execute(query)
        conexion.commit()
        filas_afectadas = cursor.rowcount
        return {"status": "ok", "message": f"UPDATE exitoso - {filas_afectadas} fila(s) actualizada(s)"}
    except Exception as e:
        if conexion:
            conexion.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        __desconectar(conexion, cursor)

def DELETE(query: str) -> Dict[str, Any]:
    """Ejecuta una query DELETE y retorna el resultado"""
    conexion, cursor = None, None
    try:
        conexion, cursor = __conectar()
        cursor.execute(query)
        conexion.commit()
        filas_afectadas = cursor.rowcount
        return {"status": "ok", "message": f"DELETE exitoso - {filas_afectadas} fila(s) eliminada(s)"}
    except Exception as e:
        if conexion:
            conexion.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        __desconectar(conexion, cursor)

def __conectar():
    """Establece conexión con la base de datos PostgreSQL"""
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
        raise Exception(f"Error al conectar a la base de datos: {str(e)}")

def __desconectar(conexion, cursor):
    """Cierra la conexión con la base de datos"""
    try:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()
    except Exception as e:
        print(f"Error al desconectar: {str(e)}")

