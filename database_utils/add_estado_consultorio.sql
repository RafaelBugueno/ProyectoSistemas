-- Agregar columna "estado" a la tabla consultorio
-- Estado puede ser 'activo' o 'inactivo'

ALTER TABLE consultorio
ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'activo';

-- Verificar la estructura de la tabla
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'consultorio'
ORDER BY ordinal_position;
