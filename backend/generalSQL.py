import psycopg2
from typing import Dict, Any

# Configuración de la base de datos
HOST = "localhost"
DATABASE = "kinesiologia"
USER = "postgres"
PASSWORD = "cacaseca000"  # Cambiar por tu contraseña
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
    from datetime import datetime
    conexion, cursor = None, None
    try:
        conexion, cursor = __conectar()
        cursor.execute(query)
        filas = cursor.fetchall()
        columnas = [description[0] for description in cursor.description]
        resultados = []
        
        for fila in filas:
            registro = dict(zip(columnas, fila))
            
            # Si hay un campo 'fecha' que es datetime, separarlo en fecha y hora
            if 'fecha' in registro and isinstance(registro['fecha'], datetime):
                dt = registro['fecha']
                registro['fechaSolo'] = dt.strftime('%Y-%m-%d')  # YYYY-MM-DD
                registro['hora'] = dt.strftime('%H:%M:%S')  # HH:MM:SS
                registro['fecha'] = dt.isoformat()  # ISO string completo
            
            resultados.append(registro)
        
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
    except psycopg2.OperationalError as e:
        print(f"\n❌ ERROR DE CONEXIÓN A POSTGRESQL ❌")
        print(f"Host: {HOST}:{PORT}")
        print(f"Database: {DATABASE}")
        print(f"User: {USER}")
        print(f"Error: {str(e)}")
        print(f"\n💡 Verifica que:")
        print(f"   1. PostgreSQL esté en ejecución")
        print(f"   2. La base de datos '{DATABASE}' exista")
        print(f"   3. Las credenciales sean correctas")
        print(f"   4. El puerto {PORT} esté accesible\n")
        raise Exception(f"No se pudo conectar a PostgreSQL: {str(e)}")
    except Exception as e:
        print(f"❌ Error inesperado al conectar a la base de datos: {str(e)}")
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

