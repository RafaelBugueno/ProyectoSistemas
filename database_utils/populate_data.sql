-- ============================================
-- Script de Población de Datos - Sistema Kinesiología
-- PostgreSQL
-- ============================================
-- INSTRUCCIONES:
-- 1. Ajusta las variables de cantidad según necesites
-- 2. Ejecuta: psql -U postgres -d kinesiologia -f populate_data.sql
-- ============================================

-- Limpiar datos existentes (opcional - comentar si no quieres borrar)
-- TRUNCATE TABLE atencion, practicante, administrador, tipo_atencion, consultorio CASCADE;

-- ============================================
-- TABLA: consultorio
-- ============================================
-- Ajustar cantidad: Actualmente 10 consultorios
INSERT INTO consultorio (nombre, direccion) VALUES
('Consultorio Central', 'Av. Libertador Bernardo O''Higgins 1234, Santiago'),
('Clínica Las Condes', 'Estoril 450, Las Condes, Santiago'),
('Centro Médico Providencia', 'Av. Providencia 2653, Providencia'),
('Hospital Clínico Universidad de Chile', 'Santos Dumont 999, Independencia'),
('Clínica Santa María', 'Av. Santa María 0500, Providencia'),
('Centro de Rehabilitación Viña', 'Av. San Martín 598, Viña del Mar'),
('Consultorio Maipú', 'Camino a Melipilla 10.500, Maipú'),
('Clínica Alemana', 'Av. Vitacura 5951, Vitacura'),
('Centro Kinésico Ñuñoa', 'Av. Irarrázaval 2930, Ñuñoa'),
('Policlínico San Joaquín', 'Av. Vicuña Mackenna 4686, San Joaquín');

-- ============================================
-- TABLA: tipo_atencion
-- ============================================
-- Ajustar cantidad: Actualmente 13 tipos de atención
INSERT INTO tipo_atencion (nombre) VALUES
('Masaje Terapéutico'),
('Electroterapia'),
('Ultrasonido'),
('Laser Terapéutico'),
('Magnetoterapia'),
('Termoterapia'),
('Crioterapia'),
('Ejercicios Terapéuticos'),
('Movilizaciones Articulares'),
('Reeducación Postural'),
('Terapia Manual'),
('Drenaje Linfático'),
('Rehabilitación Deportiva');

-- ============================================
-- TABLA: administrador
-- ============================================
-- Ajustar cantidad: Actualmente 3 administradores
-- NOTA: Las contraseñas están en texto plano - implementar hashing en el backend
INSERT INTO administrador (nombre, password, rut) VALUES
('Dr. Carlos Administrador', 'admin123', '12345678-9'),
('Dra. María González Admin', 'admin456', '11111111-1'),
('Dr. Pedro Supervisor', 'admin789', '22222222-2');

-- ============================================
-- TABLA: practicante
-- ============================================
-- Ajustar cantidad: Actualmente 20 practicantes
-- NOTA: Las contraseñas están en texto plano - implementar hashing en el backend
INSERT INTO practicante (nombre, password, rut, consultorio) VALUES
('Juan Pérez López', 'prac123', '16789012-3', 'Consultorio Central'),
('María González Silva', 'prac123', '17890123-4', 'Clínica Las Condes'),
('Carlos Rodríguez Muñoz', 'prac123', '18901234-5', 'Centro Médico Providencia'),
('Ana Martínez Torres', 'prac123', '19012345-6', 'Hospital Clínico Universidad de Chile'),
('Luis Hernández Castro', 'prac123', '15678901-2', 'Clínica Santa María'),
('Patricia Díaz Rojas', 'prac123', '14567890-1', 'Centro de Rehabilitación Viña'),
('Roberto Sánchez Pérez', 'prac123', '13456789-0', 'Consultorio Maipú'),
('Carmen Ramírez Flores', 'prac123', '18765432-1', 'Clínica Alemana'),
('Jorge Morales Vera', 'prac123', '17654321-0', 'Centro Kinésico Ñuñoa'),
('Mónica Castro Núñez', 'prac123', '16543210-9', 'Policlínico San Joaquín'),
('Francisco Vargas Pinto', 'prac123', '15432109-8', 'Consultorio Central'),
('Laura Jiménez Soto', 'prac123', '14321098-7', 'Clínica Las Condes'),
('Diego Torres Campos', 'prac123', '13210987-6', 'Centro Médico Providencia'),
('Gabriela Ruiz Medina', 'prac123', '12109876-5', 'Hospital Clínico Universidad de Chile'),
('Andrés Figueroa Bravo', 'prac123', '11098765-4', 'Clínica Santa María'),
('Valentina Silva Espinoza', 'prac123', '10987654-3', 'Centro de Rehabilitación Viña'),
('Sebastián Cortés Ramos', 'prac123', '19876543-2', 'Consultorio Maipú'),
('Catalina Muñoz Ortiz', 'prac123', '18987654-3', 'Clínica Alemana'),
('Felipe Fuentes Navarro', 'prac123', '17098765-4', 'Centro Kinésico Ñuñoa'),
('Daniela Campos Vega', 'prac123', '16109876-5', 'Policlínico San Joaquín');

-- ============================================
-- TABLA: atencion
-- ============================================
-- Ajustar cantidad: Actualmente 100 atenciones
-- Se generan atenciones de los últimos 30 días con horarios variados

INSERT INTO atencion (fecha, consultorio, tipo_atencion, nombre_practicante, latitud, longitud) VALUES
-- Día 1 (hace 30 días)
(CURRENT_TIMESTAMP - INTERVAL '30 days' - INTERVAL '8 hours', 'Consultorio Central', 'Masaje Terapéutico', 'Juan Pérez López', -33.4489, -70.6693),
(CURRENT_TIMESTAMP - INTERVAL '30 days' - INTERVAL '10 hours', 'Clínica Las Condes', 'Electroterapia', 'María González Silva', -33.4089, -70.5783),
(CURRENT_TIMESTAMP - INTERVAL '30 days' - INTERVAL '14 hours', 'Centro Médico Providencia', 'Ultrasonido', 'Carlos Rodríguez Muñoz', -33.4296, -70.6105),

-- Día 2 (hace 29 días)
(CURRENT_TIMESTAMP - INTERVAL '29 days' - INTERVAL '9 hours', 'Hospital Clínico Universidad de Chile', 'Ejercicios Terapéuticos', 'Ana Martínez Torres', -33.4559, -70.6422),
(CURRENT_TIMESTAMP - INTERVAL '29 days' - INTERVAL '11 hours', 'Clínica Santa María', 'Movilizaciones Articulares', 'Luis Hernández Castro', -33.4245, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '29 days' - INTERVAL '15 hours', 'Centro de Rehabilitación Viña', 'Terapia Manual', 'Patricia Díaz Rojas', -33.0245, -71.5516),

-- Día 3 (hace 28 días)
(CURRENT_TIMESTAMP - INTERVAL '28 days' - INTERVAL '8 hours', 'Consultorio Maipú', 'Movilizaciones Articulares', 'Roberto Sánchez Pérez', -33.5115, -70.7591),
(CURRENT_TIMESTAMP - INTERVAL '28 days' - INTERVAL '12 hours', 'Clínica Alemana', 'Reeducación Postural', 'Carmen Ramírez Flores', -33.3893, -70.5464),
(CURRENT_TIMESTAMP - INTERVAL '28 days' - INTERVAL '16 hours', 'Centro Kinésico Ñuñoa', 'Drenaje Linfático', 'Jorge Morales Vera', -33.4575, -70.5950),

-- Día 4 (hace 27 días)
(CURRENT_TIMESTAMP - INTERVAL '27 days' - INTERVAL '9 hours', 'Policlínico San Joaquín', 'Rehabilitación Deportiva', 'Mónica Castro Núñez', -33.4948, -70.6178),
(CURRENT_TIMESTAMP - INTERVAL '27 days' - INTERVAL '13 hours', 'Consultorio Central', 'Termoterapia', 'Francisco Vargas Pinto', -33.4489, -70.6693),
(CURRENT_TIMESTAMP - INTERVAL '27 days' - INTERVAL '17 hours', 'Clínica Las Condes', 'Crioterapia', 'Laura Jiménez Soto', -33.4089, -70.5783),

-- Día 5 (hace 26 días)
(CURRENT_TIMESTAMP - INTERVAL '26 days' - INTERVAL '10 hours', 'Hospital Clínico Universidad de Chile', 'Laser Terapéutico', 'Gabriela Ruiz Medina', -33.4559, -70.6422),
(CURRENT_TIMESTAMP - INTERVAL '26 days' - INTERVAL '14 hours', 'Clínica Santa María', 'Magnetoterapia', 'Andrés Figueroa Bravo', -33.4245, -70.6105),

-- Día 6 (hace 25 días)
(CURRENT_TIMESTAMP - INTERVAL '25 days' - INTERVAL '9 hours', 'Centro de Rehabilitación Viña', 'Masaje Terapéutico', 'Valentina Silva Espinoza', -33.0245, -71.5516),
(CURRENT_TIMESTAMP - INTERVAL '25 days' - INTERVAL '11 hours', 'Consultorio Maipú', 'Electroterapia', 'Sebastián Cortés Ramos', -33.5115, -70.7591),
(CURRENT_TIMESTAMP - INTERVAL '25 days' - INTERVAL '15 hours', 'Clínica Alemana', 'Ultrasonido', 'Catalina Muñoz Ortiz', -33.3893, -70.5464),

-- Día 7 (hace 24 días)
(CURRENT_TIMESTAMP - INTERVAL '24 days' - INTERVAL '8 hours', 'Centro Kinésico Ñuñoa', 'Reeducación Postural', 'Felipe Fuentes Navarro', -33.4575, -70.5950),
(CURRENT_TIMESTAMP - INTERVAL '24 days' - INTERVAL '12 hours', 'Policlínico San Joaquín', 'Ejercicios Terapéuticos', 'Daniela Campos Vega', -33.4948, -70.6178),
(CURRENT_TIMESTAMP - INTERVAL '24 days' - INTERVAL '16 hours', 'Consultorio Central', 'Terapia Manual', 'Juan Pérez López', -33.4489, -70.6693),

-- Día 8-15 (hace 23-16 días) - Patrón repetitivo con variaciones
(CURRENT_TIMESTAMP - INTERVAL '23 days' - INTERVAL '9 hours', 'Clínica Las Condes', 'Movilizaciones Articulares', 'María González Silva', -33.4089, -70.5783),
(CURRENT_TIMESTAMP - INTERVAL '23 days' - INTERVAL '13 hours', 'Centro Médico Providencia', 'Reeducación Postural', 'Carlos Rodríguez Muñoz', -33.4296, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '22 days' - INTERVAL '8 hours', 'Hospital Clínico Universidad de Chile', 'Drenaje Linfático', 'Ana Martínez Torres', -33.4559, -70.6422),
(CURRENT_TIMESTAMP - INTERVAL '22 days' - INTERVAL '10 hours', 'Clínica Santa María', 'Rehabilitación Deportiva', 'Luis Hernández Castro', -33.4245, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '22 days' - INTERVAL '14 hours', 'Centro de Rehabilitación Viña', 'Termoterapia', 'Patricia Díaz Rojas', -33.0245, -71.5516),
(CURRENT_TIMESTAMP - INTERVAL '21 days' - INTERVAL '9 hours', 'Consultorio Maipú', 'Crioterapia', 'Roberto Sánchez Pérez', -33.5115, -70.7591),
(CURRENT_TIMESTAMP - INTERVAL '21 days' - INTERVAL '15 hours', 'Centro Kinésico Ñuñoa', 'Laser Terapéutico', 'Jorge Morales Vera', -33.4575, -70.5950),
(CURRENT_TIMESTAMP - INTERVAL '20 days' - INTERVAL '8 hours', 'Policlínico San Joaquín', 'Magnetoterapia', 'Mónica Castro Núñez', -33.4948, -70.6178),
(CURRENT_TIMESTAMP - INTERVAL '20 days' - INTERVAL '12 hours', 'Consultorio Central', 'Masaje Terapéutico', 'Francisco Vargas Pinto', -33.4489, -70.6693),
(CURRENT_TIMESTAMP - INTERVAL '19 days' - INTERVAL '9 hours', 'Clínica Las Condes', 'Electroterapia', 'Laura Jiménez Soto', -33.4089, -70.5783),
(CURRENT_TIMESTAMP - INTERVAL '19 days' - INTERVAL '13 hours', 'Centro Médico Providencia', 'Ultrasonido', 'Diego Torres Campos', -33.4296, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '18 days' - INTERVAL '8 hours', 'Hospital Clínico Universidad de Chile', 'Masaje Terapéutico', 'Gabriela Ruiz Medina', -33.4559, -70.6422),
(CURRENT_TIMESTAMP - INTERVAL '18 days' - INTERVAL '10 hours', 'Clínica Santa María', 'Ejercicios Terapéuticos', 'Andrés Figueroa Bravo', -33.4245, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '18 days' - INTERVAL '14 hours', 'Centro de Rehabilitación Viña', 'Terapia Manual', 'Valentina Silva Espinoza', -33.0245, -71.5516),
(CURRENT_TIMESTAMP - INTERVAL '17 days' - INTERVAL '9 hours', 'Consultorio Maipú', 'Movilizaciones Articulares', 'Sebastián Cortés Ramos', -33.5115, -70.7591),
(CURRENT_TIMESTAMP - INTERVAL '17 days' - INTERVAL '11 hours', 'Clínica Alemana', 'Reeducación Postural', 'Catalina Muñoz Ortiz', -33.3893, -70.5464),
(CURRENT_TIMESTAMP - INTERVAL '16 days' - INTERVAL '8 hours', 'Centro Kinésico Ñuñoa', 'Drenaje Linfático', 'Felipe Fuentes Navarro', -33.4575, -70.5950),
(CURRENT_TIMESTAMP - INTERVAL '16 days' - INTERVAL '12 hours', 'Policlínico San Joaquín', 'Rehabilitación Deportiva', 'Daniela Campos Vega', -33.4948, -70.6178),

-- Día 16-23 (hace 15-8 días) - Mayor actividad
(CURRENT_TIMESTAMP - INTERVAL '15 days' - INTERVAL '8 hours', 'Consultorio Central', 'Termoterapia', 'Juan Pérez López', -33.4489, -70.6693),
(CURRENT_TIMESTAMP - INTERVAL '15 days' - INTERVAL '10 hours', 'Clínica Las Condes', 'Crioterapia', 'María González Silva', -33.4089, -70.5783),
(CURRENT_TIMESTAMP - INTERVAL '15 days' - INTERVAL '16 hours', 'Hospital Clínico Universidad de Chile', 'Laser Terapéutico', 'Ana Martínez Torres', -33.4559, -70.6422),
(CURRENT_TIMESTAMP - INTERVAL '14 days' - INTERVAL '9 hours', 'Clínica Santa María', 'Magnetoterapia', 'Luis Hernández Castro', -33.4245, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '14 days' - INTERVAL '11 hours', 'Centro de Rehabilitación Viña', 'Masaje Terapéutico', 'Patricia Díaz Rojas', -33.0245, -71.5516),
(CURRENT_TIMESTAMP - INTERVAL '14 days' - INTERVAL '14 hours', 'Consultorio Maipú', 'Electroterapia', 'Roberto Sánchez Pérez', -33.5115, -70.7591),
(CURRENT_TIMESTAMP - INTERVAL '14 days' - INTERVAL '17 hours', 'Clínica Alemana', 'Ultrasonido', 'Carmen Ramírez Flores', -33.3893, -70.5464),
(CURRENT_TIMESTAMP - INTERVAL '13 days' - INTERVAL '8 hours', 'Centro Kinésico Ñuñoa', 'Terapia Manual', 'Jorge Morales Vera', -33.4575, -70.5950),
(CURRENT_TIMESTAMP - INTERVAL '13 days' - INTERVAL '10 hours', 'Policlínico San Joaquín', 'Ejercicios Terapéuticos', 'Mónica Castro Núñez', -33.4948, -70.6178),
(CURRENT_TIMESTAMP - INTERVAL '13 days' - INTERVAL '13 hours', 'Consultorio Central', 'Terapia Manual', 'Francisco Vargas Pinto', -33.4489, -70.6693),
(CURRENT_TIMESTAMP - INTERVAL '13 days' - INTERVAL '16 hours', 'Clínica Las Condes', 'Movilizaciones Articulares', 'Laura Jiménez Soto', -33.4089, -70.5783),
(CURRENT_TIMESTAMP - INTERVAL '12 days' - INTERVAL '9 hours', 'Centro Médico Providencia', 'Reeducación Postural', 'Diego Torres Campos', -33.4296, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '12 days' - INTERVAL '11 hours', 'Hospital Clínico Universidad de Chile', 'Drenaje Linfático', 'Gabriela Ruiz Medina', -33.4559, -70.6422),
(CURRENT_TIMESTAMP - INTERVAL '12 days' - INTERVAL '14 hours', 'Clínica Santa María', 'Rehabilitación Deportiva', 'Andrés Figueroa Bravo', -33.4245, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '11 days' - INTERVAL '8 hours', 'Centro de Rehabilitación Viña', 'Termoterapia', 'Valentina Silva Espinoza', -33.0245, -71.5516),
(CURRENT_TIMESTAMP - INTERVAL '11 days' - INTERVAL '10 hours', 'Consultorio Maipú', 'Crioterapia', 'Sebastián Cortés Ramos', -33.5115, -70.7591),
(CURRENT_TIMESTAMP - INTERVAL '10 days' - INTERVAL '9 hours', 'Centro Kinésico Ñuñoa', 'Laser Terapéutico', 'Felipe Fuentes Navarro', -33.4575, -70.5950),
(CURRENT_TIMESTAMP - INTERVAL '10 days' - INTERVAL '11 hours', 'Policlínico San Joaquín', 'Magnetoterapia', 'Daniela Campos Vega', -33.4948, -70.6178),
(CURRENT_TIMESTAMP - INTERVAL '10 days' - INTERVAL '14 hours', 'Consultorio Central', 'Masaje Terapéutico', 'Juan Pérez López', -33.4489, -70.6693),
(CURRENT_TIMESTAMP - INTERVAL '9 days' - INTERVAL '8 hours', 'Clínica Las Condes', 'Electroterapia', 'María González Silva', -33.4089, -70.5783),
(CURRENT_TIMESTAMP - INTERVAL '9 days' - INTERVAL '10 hours', 'Centro Médico Providencia', 'Ultrasonido', 'Carlos Rodríguez Muñoz', -33.4296, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '9 days' - INTERVAL '13 hours', 'Hospital Clínico Universidad de Chile', 'Drenaje Linfático', 'Ana Martínez Torres', -33.4559, -70.6422),
(CURRENT_TIMESTAMP - INTERVAL '8 days' - INTERVAL '9 hours', 'Clínica Santa María', 'Ejercicios Terapéuticos', 'Luis Hernández Castro', -33.4245, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '8 days' - INTERVAL '11 hours', 'Centro de Rehabilitación Viña', 'Terapia Manual', 'Patricia Díaz Rojas', -33.0245, -71.5516),

-- Últimos 7 días - Alta actividad
(CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '8 hours', 'Consultorio Maipú', 'Movilizaciones Articulares', 'Roberto Sánchez Pérez', -33.5115, -70.7591),
(CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '10 hours', 'Clínica Alemana', 'Reeducación Postural', 'Carmen Ramírez Flores', -33.3893, -70.5464),
(CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '13 hours', 'Centro Kinésico Ñuñoa', 'Drenaje Linfático', 'Jorge Morales Vera', -33.4575, -70.5950),
(CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '16 hours', 'Policlínico San Joaquín', 'Rehabilitación Deportiva', 'Mónica Castro Núñez', -33.4948, -70.6178),
(CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '9 hours', 'Consultorio Central', 'Termoterapia', 'Francisco Vargas Pinto', -33.4489, -70.6693),
(CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '11 hours', 'Clínica Las Condes', 'Crioterapia', 'Laura Jiménez Soto', -33.4089, -70.5783),
(CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '14 hours', 'Centro Médico Providencia', 'Termoterapia', 'Diego Torres Campos', -33.4296, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '8 hours', 'Hospital Clínico Universidad de Chile', 'Laser Terapéutico', 'Gabriela Ruiz Medina', -33.4559, -70.6422),
(CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '10 hours', 'Clínica Santa María', 'Magnetoterapia', 'Andrés Figueroa Bravo', -33.4245, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '13 hours', 'Centro de Rehabilitación Viña', 'Masaje Terapéutico', 'Valentina Silva Espinoza', -33.0245, -71.5516),
(CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '9 hours', 'Consultorio Maipú', 'Electroterapia', 'Sebastián Cortés Ramos', -33.5115, -70.7591),
(CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '11 hours', 'Clínica Alemana', 'Ultrasonido', 'Catalina Muñoz Ortiz', -33.3893, -70.5464),
(CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '14 hours', 'Centro Kinésico Ñuñoa', 'Rehabilitación Deportiva', 'Felipe Fuentes Navarro', -33.4575, -70.5950),
(CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '8 hours', 'Policlínico San Joaquín', 'Ejercicios Terapéuticos', 'Daniela Campos Vega', -33.4948, -70.6178),
(CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '10 hours', 'Consultorio Central', 'Terapia Manual', 'Juan Pérez López', -33.4489, -70.6693),
(CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '13 hours', 'Clínica Las Condes', 'Movilizaciones Articulares', 'María González Silva', -33.4089, -70.5783),
(CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '9 hours', 'Centro Médico Providencia', 'Reeducación Postural', 'Carlos Rodríguez Muñoz', -33.4296, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '11 hours', 'Hospital Clínico Universidad de Chile', 'Drenaje Linfático', 'Ana Martínez Torres', -33.4559, -70.6422),
(CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '14 hours', 'Clínica Santa María', 'Rehabilitación Deportiva', 'Luis Hernández Castro', -33.4245, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '8 hours', 'Centro de Rehabilitación Viña', 'Termoterapia', 'Patricia Díaz Rojas', -33.0245, -71.5516),
(CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '10 hours', 'Consultorio Maipú', 'Crioterapia', 'Roberto Sánchez Pérez', -33.5115, -70.7591),
(CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '16 hours', 'Centro Kinésico Ñuñoa', 'Laser Terapéutico', 'Jorge Morales Vera', -33.4575, -70.5950),

-- Hoy
(CURRENT_TIMESTAMP - INTERVAL '9 hours', 'Policlínico San Joaquín', 'Magnetoterapia', 'Mónica Castro Núñez', -33.4948, -70.6178),
(CURRENT_TIMESTAMP - INTERVAL '7 hours', 'Consultorio Central', 'Masaje Terapéutico', 'Francisco Vargas Pinto', -33.4489, -70.6693),
(CURRENT_TIMESTAMP - INTERVAL '5 hours', 'Clínica Las Condes', 'Electroterapia', 'Laura Jiménez Soto', -33.4089, -70.5783),
(CURRENT_TIMESTAMP - INTERVAL '3 hours', 'Centro Médico Providencia', 'Ultrasonido', 'Diego Torres Campos', -33.4296, -70.6105),
(CURRENT_TIMESTAMP - INTERVAL '1 hour', 'Hospital Clínico Universidad de Chile', 'Reeducación Postural', 'Gabriela Ruiz Medina', -33.4559, -70.6422);

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================
-- Ejecutar estas consultas para verificar la carga de datos:

-- SELECT COUNT(*) AS total_consultorios FROM consultorio;
-- SELECT COUNT(*) AS total_tipos_atencion FROM tipo_atencion;
-- SELECT COUNT(*) AS total_administradores FROM administrador;
-- SELECT COUNT(*) AS total_practicantes FROM practicante;
-- SELECT COUNT(*) AS total_atenciones FROM atencion;

-- ============================================
-- CONSULTAS ÚTILES
-- ============================================

-- Atenciones por consultorio
-- SELECT consultorio, COUNT(*) as total 
-- FROM atencion 
-- GROUP BY consultorio 
-- ORDER BY total DESC;

-- Atenciones por tipo
-- SELECT tipo_atencion, COUNT(*) as total 
-- FROM atencion 
-- GROUP BY tipo_atencion 
-- ORDER BY total DESC;

-- Atenciones por practicante
-- SELECT nombre_practicante, COUNT(*) as total 
-- FROM atencion 
-- GROUP BY nombre_practicante 
-- ORDER BY total DESC;

-- Atenciones de los últimos 7 días
-- SELECT fecha, consultorio, tipo_atencion, nombre_practicante 
-- FROM atencion 
-- WHERE fecha >= CURRENT_TIMESTAMP - INTERVAL '7 days'
-- ORDER BY fecha DESC;
