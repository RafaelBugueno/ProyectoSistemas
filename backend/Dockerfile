# Usar imagen oficial de Python
FROM python:3.11-slim

# Instalar dependencias del sistema para psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements y instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del backend
COPY . .

# Exponer puerto
EXPOSE 8000

# Variables de entorno con valores por defecto (pueden sobrescribirse)
ENV DB_HOST=host.docker.internal
ENV DB_PORT=5432
ENV DB_NAME=kinesiologia
ENV DB_USER=postgres
ENV DB_PASSWORD=cacaseca000

# Comando para iniciar la aplicación
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
