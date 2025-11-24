--
-- PostgreSQL database dump
--

\restrict 4LQd8LTTj6jcIYavZD55IPgliQ2zjGhbGlf6vIeRgeYwhX1E7SkJuvTZ0aIE0CQ

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administrador; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administrador (
    nombre character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    rut character varying(20) NOT NULL
);


--
-- Name: atencion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.atencion (
    id integer NOT NULL,
    fecha timestamp without time zone NOT NULL,
    consultorio character varying(100) NOT NULL,
    tipo_atencion character varying(100) NOT NULL,
    nombre_practicante character varying(100) NOT NULL,
    latitud double precision,
    longitud double precision
);


--
-- Name: atencion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.atencion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: atencion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.atencion_id_seq OWNED BY public.atencion.id;


--
-- Name: consultorio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultorio (
    nombre character varying(100) NOT NULL,
    direccion character varying(200) NOT NULL
);


--
-- Name: practicante; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practicante (
    nombre character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    rut character varying(20) NOT NULL,
    consultorio character varying(100) NOT NULL
);


--
-- Name: tipo_atencion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_atencion (
    nombre character varying(100) NOT NULL
);


--
-- Name: atencion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atencion ALTER COLUMN id SET DEFAULT nextval('public.atencion_id_seq'::regclass);


--
-- Name: administrador administrador_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT administrador_pkey PRIMARY KEY (nombre);


--
-- Name: administrador administrador_rut_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT administrador_rut_key UNIQUE (rut);


--
-- Name: atencion atencion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atencion
    ADD CONSTRAINT atencion_pkey PRIMARY KEY (id);


--
-- Name: consultorio consultorio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultorio
    ADD CONSTRAINT consultorio_pkey PRIMARY KEY (nombre);


--
-- Name: practicante practicante_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practicante
    ADD CONSTRAINT practicante_pkey PRIMARY KEY (nombre);


--
-- Name: practicante practicante_rut_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practicante
    ADD CONSTRAINT practicante_rut_key UNIQUE (rut);


--
-- Name: tipo_atencion tipo_atencion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_atencion
    ADD CONSTRAINT tipo_atencion_pkey PRIMARY KEY (nombre);


--
-- Name: atencion atencion_consultorio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atencion
    ADD CONSTRAINT atencion_consultorio_fkey FOREIGN KEY (consultorio) REFERENCES public.consultorio(nombre);


--
-- Name: atencion atencion_nombre_practicante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atencion
    ADD CONSTRAINT atencion_nombre_practicante_fkey FOREIGN KEY (nombre_practicante) REFERENCES public.practicante(nombre);


--
-- Name: atencion atencion_tipo_atencion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atencion
    ADD CONSTRAINT atencion_tipo_atencion_fkey FOREIGN KEY (tipo_atencion) REFERENCES public.tipo_atencion(nombre);


--
-- Name: practicante practicante_consultorio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practicante
    ADD CONSTRAINT practicante_consultorio_fkey FOREIGN KEY (consultorio) REFERENCES public.consultorio(nombre);


--
-- PostgreSQL database dump complete
--

\unrestrict 4LQd8LTTj6jcIYavZD55IPgliQ2zjGhbGlf6vIeRgeYwhX1E7SkJuvTZ0aIE0CQ

