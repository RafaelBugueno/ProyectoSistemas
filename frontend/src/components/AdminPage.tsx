import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LogOut, Activity, MapPin, FileText, Calendar, Shield, Stethoscope, Filter, X, Search, Building2, Download, FileSpreadsheet } from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { apiRequest } from "../api/config";
import { toast } from "./ui/sonner";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminPageProps {
  user: any;
  onLogout: () => void;
}

interface Consultorio {
  nombre: string;
  direccion?: string;
  estado?: string;
}

interface Practicante {
  nombre: string;
  rut: string;
  consultorio: string;
  estado: string;
}

export function AdminPage({ user, onLogout }: AdminPageProps) {
  const [registros, setRegistros] = useState<any[]>([]);
  const [filtroKinesiologo, setFiltroKinesiologo] = useState<string>("todos");
  const [filtroTratamiento, setFiltroTratamiento] = useState<string>("todos");
  const [filtroConsultorio, setFiltroConsultorio] = useState<string>("todos");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState<string>("");
  const [filtroFechaFin, setFiltroFechaFin] = useState<string>("");
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>("");

  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [nuevoConsultorioNombre, setNuevoConsultorioNombre] = useState<string>("");
  const [nuevoConsultorioDireccion, setNuevoConsultorioDireccion] = useState<string>("");

  const [practicantes, setPracticantes] = useState<Practicante[]>([]);
  const [practicanteSeleccionado, setPracticanteSeleccionado] = useState<string>("");
  const [consultoriosAsignados, setConsultoriosAsignados] = useState<string[]>([]);
  const [consultorioParaAsignar, setConsultorioParaAsignar] = useState<string>("");
  const [nuevoPracticanteNombre, setNuevoPracticanteNombre] = useState<string>("");
  const [nuevoPracticanteRut, setNuevoPracticanteRut] = useState<string>("");
  const [nuevoPracticantePassword, setNuevoPracticantePassword] = useState<string>("");
  const [nuevoPracticanteConsultorio, setNuevoPracticanteConsultorio] = useState<string>("");

  // Estados para diálogos de confirmación
  const [showConfirmCrearPracticante, setShowConfirmCrearPracticante] = useState(false);
  const [showConfirmAgregarConsultorio, setShowConfirmAgregarConsultorio] = useState(false);
  const [showConfirmEliminarConsultorio, setShowConfirmEliminarConsultorio] = useState(false);
  const [consultorioAEliminar, setConsultorioAEliminar] = useState<string>("");
  const [showConfirmCambiarEstado, setShowConfirmCambiarEstado] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showConfirmAsignarConsultorio, setShowConfirmAsignarConsultorio] = useState(false);
  const [showConfirmQuitarConsultorio, setShowConfirmQuitarConsultorio] = useState(false);
  const [consultorioParaQuitar, setConsultorioParaQuitar] = useState<string>("");
  const [nuevaPassword, setNuevaPassword] = useState<string>("");
  const [showConfirmCambiarPassword, setShowConfirmCambiarPassword] = useState(false);

  const cargarRegistros = async () => {
    console.log("🔄 AdminPage: Cargando registros...");
    try {
      // Intentar cargar desde el backend
      const response = await apiRequest("/api/atenciones");
      console.log("📊 AdminPage: Respuesta de atenciones:", response);
      if (response.status === "ok") {
        console.log("✅ AdminPage: Registros cargados desde backend:", response.data?.length || 0);
        setRegistros(response.data || []);
        return;
      }
    } catch (error) {
      console.warn("⚠️ AdminPage: Error al cargar desde backend, usando localStorage:", error);
    }
    
    // Fallback a localStorage si falla el backend
    try {
      const data = JSON.parse(localStorage.getItem("registros") || "[]");
      console.log("💾 AdminPage: Registros cargados desde localStorage:", data.length);
      setRegistros(data.reverse());
    } catch (error) {
      console.error("❌ AdminPage: Error al parsear localStorage:", error);
      setRegistros([]);
    }
  };

  const cargarConsultorios = async () => {
    console.log("🏥 AdminPage: Cargando consultorios...");
    try {
      // Intentar cargar desde el backend
      const response = await apiRequest("/api/consultorios");
      console.log("🏢 AdminPage: Respuesta de consultorios:", response);
      if (response.status === "ok") {
        const consultoriosBackend = response.data.map((c: any) => ({
          nombre: c.nombre,
          direccion: c.direccion,
          estado: c.estado || 'activo',
        }));
        console.log("✅ AdminPage: Consultorios cargados desde backend:", consultoriosBackend.length);
        setConsultorios(consultoriosBackend);
        localStorage.setItem("consultorios", JSON.stringify(consultoriosBackend));
        return;
      }
    } catch (error) {
      console.warn("⚠️ AdminPage: Error al cargar consultorios desde backend, usando localStorage:", error);
    }
    
    // Fallback a localStorage
    const consultoriosGuardados = localStorage.getItem("consultorios");
    let consultoriosIniciales: Consultorio[] = [];

    if (consultoriosGuardados) {
      try {
        consultoriosIniciales = JSON.parse(consultoriosGuardados);
      } catch (error) {
        consultoriosIniciales = [];
      }
    }

    if (consultoriosIniciales.length === 0) {
      consultoriosIniciales = [
        {
          nombre: "Consultorio Principal",
        },
      ];
      localStorage.setItem("consultorios", JSON.stringify(consultoriosIniciales));
    }

    setConsultorios(consultoriosIniciales);
  };

  const cargarPracticantes = async () => {
    console.log("👨‍⚕️ AdminPage: Cargando practicantes...");
    try {
      const response = await apiRequest("/api/practicantes");
      console.log("🏥 AdminPage: Respuesta de practicantes:", response);
      if (response.status === "ok") {
        console.log("✅ AdminPage: Practicantes cargados desde backend:", response.data?.length || 0);
        console.log("📊 AdminPage: Primer practicante (ejemplo):", response.data?.[0]);
        setPracticantes(response.data || []);
      }
    } catch (error) {
      console.warn("⚠️ AdminPage: Error al cargar practicantes desde backend:", error);
      setPracticantes([]);
    }
  };

  const cargarConsultoriosAsignados = async (rut: string) => {
    try {
      const response = await apiRequest(`/api/practicantes/${encodeURIComponent(rut)}/consultorios`);
      if (response.status === "ok") {
        const lista = (response.data || []).map((c: any) => c.nombre);
        setConsultoriosAsignados(lista);
      }
    } catch (error) {
      setConsultoriosAsignados([]);
    }
  };

  useEffect(() => {
    console.log("🚀 AdminPage: Componente montado, iniciando carga de datos...");
    console.log("👤 Usuario actual:", user);
    
    const inicializar = async () => {
      try {
        await Promise.all([cargarRegistros(), cargarConsultorios(), cargarPracticantes()]);
        console.log("✅ AdminPage: Datos iniciales cargados correctamente");
      } catch (error) {
        console.error("❌ AdminPage: Error al inicializar:", error);
      }
    };
    
    inicializar();
  }, []);

  // Memo de practicante actual declarado antes de efectos para evitar uso previo
  const practicanteActual = useMemo(
    () => practicantes.find((p) => p.nombre === practicanteSeleccionado) || null,
    [practicantes, practicanteSeleccionado]
  );

  // Cargar consultorios asignados cuando cambia el practicante seleccionado
  useEffect(() => {
    const rutActual = practicanteActual?.rut;
    if (practicanteSeleccionado && rutActual) {
      cargarConsultoriosAsignados(rutActual);
      setConsultorioParaAsignar("");
    } else {
      setConsultoriosAsignados([]);
      setConsultorioParaAsignar("");
    }
  }, [practicanteSeleccionado, practicanteActual]);

  const limpiarFiltros = () => {
    setFiltroKinesiologo("todos");
    setFiltroTratamiento("todos");
    setFiltroConsultorio("todos");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
    setFiltroBusqueda("");
  };

  const aplicarFiltros = () => {
    // Los filtros se aplican automáticamente gracias a useMemo
    // Esta función existe para dar feedback al usuario
  };

  const actualizarConsultoriosEnStorage = (lista: Consultorio[]) => {
    setConsultorios(lista);
    localStorage.setItem("consultorios", JSON.stringify(lista));
  };

  const handleAgregarConsultorio = () => {
    const nombre = nuevoConsultorioNombre.trim();

    if (!nombre) {
      toast.error("El nombre del consultorio es requerido");
      return;
    }

    setShowConfirmAgregarConsultorio(true);
  };

  const confirmarAgregarConsultorio = async () => {
    setShowConfirmAgregarConsultorio(false);
    
    const nombre = nuevoConsultorioNombre.trim();
    const direccion = nuevoConsultorioDireccion.trim();

    if (!nombre) {
      toast.error("El nombre del consultorio es requerido");
      return;
    }

    try {
      await apiRequest("/api/consultorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, direccion }),
      });

    const nuevo: Consultorio = {
      nombre,
      ...(direccion ? { direccion } : {}),
      estado: 'activo',
    };      const actualizados = [...consultorios, nuevo];
      actualizarConsultoriosEnStorage(actualizados);

      setNuevoConsultorioNombre("");
      setNuevoConsultorioDireccion("");
      toast.success("Consultorio agregado exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al agregar consultorio");
    }
  };

  const handleToggleEstadoConsultorio = (nombre: string) => {
    setConsultorioAEliminar(nombre);
    setShowConfirmEliminarConsultorio(true);
  };

  const confirmarToggleEstadoConsultorio = async () => {
    setShowConfirmEliminarConsultorio(false);
    const consultorio = consultorios.find((c) => c.nombre === consultorioAEliminar);
    if (!consultorio) return;

    const nuevoEstado = consultorio.estado === 'activo' ? 'inactivo' : 'activo';
    
    try {
      await apiRequest(`/api/consultorios/${encodeURIComponent(consultorioAEliminar)}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      
      const actualizados = consultorios.map((c) =>
        c.nombre === consultorioAEliminar ? { ...c, estado: nuevoEstado } : c
      );
      actualizarConsultoriosEnStorage(actualizados);
      toast.success(`Consultorio ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar estado del consultorio");
    }
    setConsultorioAEliminar("");
  };

  // Validación matemática del RUT
  const validarRut = (rut: string): boolean => {
    // Formato esperado: 12345678-9 o 12345678-K
    if (!rut || !rut.includes('-')) return false;
    
    const [numero, dvIngresado] = rut.split('-');
    if (!numero || !dvIngresado) return false;
    
    // Validar que el número sea válido
    if (!/^\d+$/.test(numero)) return false;
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    // Recorrer de derecha a izquierda
    for (let i = numero.length - 1; i >= 0; i--) {
      suma += parseInt(numero[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    let dvCalculado: string;
    
    if (resto === 0) {
      dvCalculado = '0';
    } else if (resto === 1) {
      dvCalculado = 'K';
    } else {
      dvCalculado = (11 - resto).toString();
    }
    
    // Comparar con el dígito verificador ingresado
    return dvIngresado.toUpperCase() === dvCalculado;
  };

  // Funciones de gestión de practicantes
  const handleAgregarPracticante = () => {
    const nombre = nuevoPracticanteNombre.trim();
    const rut = nuevoPracticanteRut.trim();
    const password = nuevoPracticantePassword.trim();
    const consultorio = nuevoPracticanteConsultorio;

    if (!nombre || !rut || !password || !consultorio) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    // Validar RUT matemáticamente
    if (!validarRut(rut)) {
      toast.error("El RUT ingresado no es válido. Verifica el dígito verificador.");
      return;
    }

    setShowConfirmCrearPracticante(true);
  };

  const confirmarCrearPracticante = async () => {
    setShowConfirmCrearPracticante(false);
    
    const nombre = nuevoPracticanteNombre.trim();
    const rut = nuevoPracticanteRut.trim();
    const password = nuevoPracticantePassword.trim();
    const consultorio = nuevoPracticanteConsultorio;

    try {
      await apiRequest("/api/practicantes", {
        method: "POST",
        body: JSON.stringify({ nombre, rut, password, consultorio }),
      });
      
      toast.success("Practicante creado exitosamente");
      setNuevoPracticanteNombre("");
      setNuevoPracticanteRut("");
      setNuevoPracticantePassword("");
      setNuevoPracticanteConsultorio("");
      await cargarPracticantes();
    } catch (error: any) {
      toast.error(error.message || "Error al crear practicante");
    }
  };

  const handleCambiarEstadoPracticante = () => {
    if (!practicanteSeleccionado || !practicanteActual) {
      toast.error("Selecciona un practicante primero");
      return;
    }

    setShowConfirmCambiarEstado(true);
  };

  const handleCambiarPassword = () => {
    if (!practicanteSeleccionado) {
      toast.error("Selecciona un practicante primero");
      return;
    }
    if (!nuevaPassword.trim()) {
      toast.error("Ingresa una nueva contraseña");
      return;
    }
    setShowConfirmCambiarPassword(true);
  };

  const confirmarCambiarPassword = async () => {
    setShowConfirmCambiarPassword(false);
    
    if (!practicanteSeleccionado || !nuevaPassword.trim()) {
      return;
    }

    try {
      await apiRequest(`/api/practicantes/${encodeURIComponent(practicanteSeleccionado)}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: nuevaPassword }),
      });
      toast.success("Contraseña actualizada exitosamente");
      setNuevaPassword("");
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar contraseña");
    }
  };

  const confirmarCambiarEstadoPracticante = async () => {
    setShowConfirmCambiarEstado(false);

    if (!practicanteSeleccionado || !practicanteActual) {
      return;
    }

    const esActivo = practicanteActual.estado === "activo";

    try {
      if (esActivo) {
        // Desactivar
        await apiRequest(`/api/practicantes/${encodeURIComponent(practicanteSeleccionado)}`, {
          method: "DELETE",
        });
        toast.success("Practicante desactivado exitosamente");
      } else {
        // Activar
        await apiRequest(`/api/practicantes/${encodeURIComponent(practicanteSeleccionado)}/activar`, {
          method: "PUT",
        });
        toast.success("Practicante activado exitosamente");
      }
      
      await cargarPracticantes();
    } catch (error: any) {
      toast.error(error.message || `Error al ${esActivo ? 'desactivar' : 'activar'} practicante`);
    }
  };

  const handleActualizarConsultorioPracticante = async (nuevoConsultorio: string) => {
    if (!practicanteSeleccionado) {
      toast.error("Selecciona un practicante primero");
      return;
    }

    try {
      await apiRequest(`/api/practicantes/${encodeURIComponent(practicanteSeleccionado)}`, {
        method: "PUT",
        body: JSON.stringify({ consultorio: nuevoConsultorio }),
      });
      
      toast.success("Consultorio actualizado exitosamente");
      await cargarPracticantes();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar consultorio");
    }
  };

  const handleAsignarConsultorio = () => {
    if (!practicanteActual) {
      toast.error("Selecciona un practicante primero");
      return;
    }
    if (!consultorioParaAsignar) {
      toast.error("Selecciona un consultorio a asignar");
      return;
    }
    setShowConfirmAsignarConsultorio(true);
  };

  const confirmarAsignarConsultorio = async () => {
    setShowConfirmAsignarConsultorio(false);
    if (!practicanteActual || !consultorioParaAsignar) return;
    try {
      await apiRequest(`/api/practicantes/${encodeURIComponent(practicanteActual.rut)}/consultorios`, {
        method: "POST",
        body: JSON.stringify({ consultorio: consultorioParaAsignar })
      });
      toast.success("Consultorio asignado");
      await cargarConsultoriosAsignados(practicanteActual.rut);
      setConsultorioParaAsignar("");
    } catch (error: any) {
      toast.error(error.message || "Error al asignar consultorio");
    }
  };

  const handleQuitarConsultorio = async (nombreConsultorio: string) => {
    if (!practicanteActual) return;
    try {
      await apiRequest(`/api/practicantes/${encodeURIComponent(practicanteActual.rut)}/consultorios/${encodeURIComponent(nombreConsultorio)}`, {
        method: "DELETE"
      });
      toast.success("Consultorio removido");
      await cargarConsultoriosAsignados(practicanteActual.rut);
    } catch (error: any) {
      toast.error(error.message || "Error al remover consultorio");
    }
  };

  // moved above

  // Obtener listas únicas para filtros
  const kinesiologosUnicos = useMemo(() => {
    const nombres = new Set(registros.map((r) => r.nombre_practicante || r.kinesiologo_nombre || r.practicante_nombre).filter(Boolean));
    return Array.from(nombres).sort();
  }, [registros]);

  const tratamientosUnicos = useMemo(() => {
    const tratamientos = new Set(registros.map((r) => r.tipo_atencion || r.tratamiento || r.actividad).filter(Boolean));
    return Array.from(tratamientos).sort();
  }, [registros]);

  const consultoriosUnicos = useMemo(() => {
    const nombres = new Set<string>();

    registros.forEach((r) => {
      const nombreConsultorio = r.consultorio || r.consultorioNombre;
      if (nombreConsultorio) {
        nombres.add(nombreConsultorio);
      }
    });

    consultorios.forEach((c) => {
      if (c.nombre) {
        nombres.add(c.nombre);
      }
    });

    return Array.from(nombres).sort();
  }, [registros, consultorios]);

  // Función para convertir fecha en formato DD/MM/YYYY a objeto Date
  const parsearFecha = (fechaStr: string): Date => {
    const partes = fechaStr.split("/");
    if (partes.length === 3) {
      // formato DD/MM/YYYY
      return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
    }
    return new Date(fechaStr);
  };

  // Aplicar filtros
  const registrosFiltrados = useMemo(() => {
    return registros.filter((registro) => {
      const nombreKinesiologo = registro.nombre_practicante || registro.kinesiologo_nombre || registro.practicante_nombre || "";
      const tratamiento = registro.tipo_atencion || registro.tratamiento || registro.actividad || "";
      const nombreConsultorio = registro.consultorio || registro.consultorioNombre || "";
      
      // Filtro por kinesiólogo
      if (filtroKinesiologo !== "todos" && nombreKinesiologo !== filtroKinesiologo) {
        return false;
      }
      
      // Filtro por tratamiento
      if (filtroTratamiento !== "todos" && tratamiento !== filtroTratamiento) {
        return false;
      }

      // Filtro por consultorio
      if (filtroConsultorio !== "todos" && nombreConsultorio !== filtroConsultorio) {
        return false;
      }

// Filtro por rango de fechas
      if (filtroFechaInicio || filtroFechaFin) {
        const fechaRegistro = parsearFecha(registro.fecha);
        
        if (filtroFechaInicio) {
          const fechaInicio = new Date(filtroFechaInicio);
          fechaInicio.setHours(0, 0, 0, 0);
          if (fechaRegistro < fechaInicio) {
            return false;
          }
        }
        
        if (filtroFechaFin) {
          const fechaFin = new Date(filtroFechaFin);
          fechaFin.setHours(23, 59, 59, 999);
          if (fechaRegistro > fechaFin) {
            return false;
          }
        }
      }
      
      // Filtro de búsqueda general
      if (filtroBusqueda) {
        const busqueda = filtroBusqueda.toLowerCase();
        const coincide = 
          nombreKinesiologo.toLowerCase().includes(busqueda) ||
          tratamiento.toLowerCase().includes(busqueda) ||
          registro.fecha.toLowerCase().includes(busqueda) ||
          registro.hora.toLowerCase().includes(busqueda) ||
          nombreConsultorio.toLowerCase().includes(busqueda);
        
        if (!coincide) return false;
      }
      
      return true;
    });
  }, [registros, filtroKinesiologo, filtroTratamiento, filtroConsultorio, filtroFechaInicio, filtroFechaFin, filtroBusqueda]);

  // Estadísticas basadas en registros filtrados
  const totalSesiones = registrosFiltrados.length;
  const kinesiologosActivosCount = practicantes.filter(p => p.estado === "activo").length;
  const ultimaSesion = registrosFiltrados.length > 0 ? registrosFiltrados[0] : null;

  const hayFiltrosActivos = 
    filtroKinesiologo !== "todos" || 
    filtroTratamiento !== "todos" || 
    filtroConsultorio !== "todos" ||
    filtroFechaInicio !== "" || 
    filtroFechaFin !== "" ||
    filtroBusqueda !== "";

  const generarExcel = () => {
    try {
      // Preparar datos para el Excel
      const datosExcel = registrosFiltrados.map((registro) => ({
        "Profesional": registro.nombre_practicante || registro.kinesiologo_nombre || registro.practicante_nombre || "Sin nombre",
        "Tratamiento": registro.tipo_atencion || registro.tratamiento || registro.actividad || "Sin especificar",
        "Consultorio": registro.consultorio || registro.consultorioNombre || "No asignado",
        "Fecha": registro.fechaSolo || registro.fecha?.split('T')[0] || "Sin fecha",
        "Hora": registro.hora || "Sin hora",
        "Latitud": registro.latitud || 0,
        "Longitud": registro.longitud || 0,
      }));

      // Crear libro de Excel
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sesiones Clínicas");

      // Ajustar ancho de columnas
      const maxWidth = 30;
      worksheet['!cols'] = [
        { wch: 25 }, // Profesional
        { wch: 25 }, // Tratamiento
        { wch: 25 }, // Consultorio
        { wch: 12 }, // Fecha
        { wch: 10 }, // Hora
        { wch: 12 }, // Latitud
        { wch: 12 }, // Longitud
      ];

      // Generar nombre de archivo con fecha actual
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `sesiones_clinicas_${fecha}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(workbook, nombreArchivo);
      toast.success(`Excel generado: ${registrosFiltrados.length} registros exportados`);
    } catch (error) {
      console.error("Error al generar Excel:", error);
      toast.error("Error al generar el archivo Excel");
    }
  };

  const generarPDF = () => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text("Historial de Sesiones Clínicas", 14, 20);

      // Fecha de generación
      doc.setFontSize(10);
      doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 14, 28);
      doc.text(`Total de registros: ${registrosFiltrados.length}`, 14, 33);

      // Preparar datos para la tabla
      const datosTabla = registrosFiltrados.map((registro) => [
        registro.nombre_practicante || registro.kinesiologo_nombre || registro.practicante_nombre || "Sin nombre",
        registro.tipo_atencion || registro.tratamiento || registro.actividad || "Sin especificar",
        registro.consultorio || registro.consultorioNombre || "No asignado",
        registro.fechaSolo || registro.fecha?.split('T')[0] || "Sin fecha",
        registro.hora || "Sin hora",
      ]);

      // Generar tabla
      autoTable(doc, {
        head: [["Profesional", "Tratamiento", "Consultorio", "Fecha", "Hora"]],
        body: datosTabla,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [37, 99, 235], // bg-blue-600
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [239, 246, 255], // bg-blue-50
        },
        margin: { top: 40 },
      });

      // Generar nombre de archivo con fecha actual
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `sesiones_clinicas_${fecha}.pdf`;

      // Descargar archivo
      doc.save(nombreArchivo);
      toast.success(`PDF generado: ${registrosFiltrados.length} registros exportados`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el archivo PDF");
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 flex items-center gap-2">
                  Panel de Supervisión
                  <Badge className="bg-blue-600">Administrador</Badge>
                </h1>
                <p className="text-gray-600">{user.nombre}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowConfirmLogout(true)} className="border-gray-300">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Gestión de Consultorios */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-cyan-700" />
              </div>
              <div>
                <CardTitle className="text-sm text-gray-900">Gestión de consultorios</CardTitle>
                <CardDescription className="text-gray-600">
                  Administra las sedes disponibles.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label className="text-gray-700">Registrar nuevo consultorio</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    placeholder="Nombre del consultorio"
                    value={nuevoConsultorioNombre}
                    onChange={(e) => setNuevoConsultorioNombre(e.target.value)}
                    className="border-gray-300"
                  />
                  <Input
                    placeholder="Dirección (opcional)"
                    value={nuevoConsultorioDireccion}
                    onChange={(e) => setNuevoConsultorioDireccion(e.target.value)}
                    className="border-gray-300"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={handleAgregarConsultorio}>
                    Agregar consultorio
                  </Button>
                </div>
            </div>

            {consultorios.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">
                  Consultorios registrados
                </p>
                <div className="overflow-x-auto">
                  <div className="flex gap-2 pb-2 min-w-max">
                    {consultorios.map((c) => (
                      <Badge
                        key={c.nombre}
                        variant="outline"
                        className={c.estado === 'inactivo' ? 'border-gray-300 text-gray-400 line-through whitespace-nowrap' : 'border-gray-300 text-gray-700 whitespace-nowrap'}
                      >
                        {c.nombre}
                        <button
                          type="button"
                          className={c.estado === 'activo' ? 'btn-remove-consultorio' : 'btn-activate-consultorio'}
                          onClick={() => handleToggleEstadoConsultorio(c.nombre)}
                        >
                          {c.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gestión de Practicantes */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-sm text-gray-900">Gestión de practicantes</CardTitle>
                <CardDescription className="text-gray-600">
                  Administra los kinesiólogos y sus consultorios asignados.
                </CardDescription>
              </div>
            </div>
            {practicanteActual && (
              <div className="text-sm text-right space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-gray-700">
                    <strong>{practicanteActual.nombre}</strong>
                  </p>
                  <Badge 
                    className={
                      practicanteActual.estado === "activo"
                        ? "bg-green-600 text-white"
                        : "bg-gray-400 text-white"
                    }
                  >
                    {practicanteActual.estado}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  RUT: {practicanteActual.rut}
                </p>
                <p className="text-xs text-gray-500">
                  Consultorio: {practicanteActual.consultorio}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="practicanteSeleccionado" className="text-gray-700">
                  Seleccionar practicante
                </Label>
                <Select
                  value={practicanteSeleccionado}
                  onValueChange={(value: string) => setPracticanteSeleccionado(value)}
                >
                  <SelectTrigger id="practicanteSeleccionado" className="border-gray-300">
                    <SelectValue placeholder="Selecciona un practicante" />
                  </SelectTrigger>
                  <SelectContent>
                    {practicantes.length === 0 && (
                      <SelectItem value="none" disabled>
                        No hay practicantes registrados
                      </SelectItem>
                    )}
                    {practicantes.map((p) => (
                      <SelectItem key={p.nombre} value={p.nombre}>
                        {p.nombre} ({p.rut})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {practicanteSeleccionado && practicanteActual && (
                  <div className="space-y-3 mt-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCambiarEstadoPracticante}
                        className={
                          practicanteActual.estado === "activo"
                            ? "btn-desactivar-practicante"
                            : "btn-activar-practicante"
                        }
                      >
                        {practicanteActual.estado === "activo" ? "Desactivar" : "Activar"} practicante
                      </Button>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100">
                      <Label className="text-gray-700 text-xs mb-2 block">Cambiar contraseña</Label>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder="Nueva contraseña"
                          value={nuevaPassword}
                          onChange={(e) => setNuevaPassword(e.target.value)}
                          className="border-gray-300"
                        />
                        <Button
                          onClick={handleCambiarPassword}
                          disabled={!nuevaPassword.trim()}
                          style={{
                            backgroundColor: nuevaPassword.trim() ? '#9333ea' : undefined,
                            color: 'white'
                          }}
                          className="hover:bg-purple-700"
                        >
                          Cambiar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Asignar consultorios (múltiples)</Label>
                <div className="space-y-2">
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 pb-2 min-w-max">
                    {consultoriosAsignados.length === 0 ? (
                      <span className="text-sm text-gray-500">Sin consultorios asignados</span>
                    ) : (
                      consultoriosAsignados.map((nombre) => (
                        <Badge key={nombre} className="bg-gray-100 text-gray-700 whitespace-nowrap">
                          {nombre}
                          <button
                            type="button"
                            className="btn-remove-assignment"
                            onClick={() => { setConsultorioParaQuitar(nombre); setShowConfirmQuitarConsultorio(true); }}
                          >
                            Quitar
                          </button>
                        </Badge>
                      ))
                    )}
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <Select
                      value={consultorioParaAsignar}
                      onValueChange={(value: string) => setConsultorioParaAsignar(value)}
                      disabled={!practicanteSeleccionado}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Selecciona consultorio a asignar" />
                      </SelectTrigger>
                      <SelectContent>
                        {consultorios
                          .filter((c) => !consultoriosAsignados.includes(c.nombre))
                          .map((c) => (
                            <SelectItem key={c.nombre} value={c.nombre}>
                              {c.nombre}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={handleAsignarConsultorio}
                      disabled={!consultorioParaAsignar || !practicanteSeleccionado}
                    >
                      Asignar consultorio
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Puedes asignar varios consultorios al practicante.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <Label className="text-gray-700 mb-3 block">Registrar nuevo practicante</Label>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Nombre completo"
                  value={nuevoPracticanteNombre}
                  onChange={(e) => setNuevoPracticanteNombre(e.target.value)}
                  className="border-gray-300"
                />
                <Input
                  placeholder="RUT (ej: 12345678-9)"
                  value={nuevoPracticanteRut}
                  onChange={(e) => {
                    let v = e.target.value.toUpperCase();
                    v = v.replace(/[\.\s]/g, ''); // quitar puntos y espacios
                    v = v.replace(/[^0-9K-]/g, ''); // permitir solo dígitos, K y guión

                    // Normalizar múltiples guiones
                    const parts = v.split('-').filter(p => p !== '');
                    if (v.includes('-')) {
                      // reconstruir como NUMERO-DV (tomar primeras partes)
                      const numero = parts[0] || '';
                      let dv = parts.slice(1).join('');
                      dv = dv.replace(/[^0-9K]/g, '');
                      dv = dv.slice(0,1); // solo un caracter verificador
                      v = numero + (dv ? '-' + dv : '-');
                    }

                    // Si el usuario escribe K sin guión aún, auto-insertar guión
                    if (!v.includes('-')) {
                      const kPos = v.indexOf('K');
                      if (kPos !== -1) {
                        // separar número y K
                        const numero = v.replace(/K/g,'');
                        v = numero + '-' + 'K';
                      }
                    }

                    // Limitar número a 8 dígitos antes del guión
                    if (v.includes('-')) {
                      const [numero, dv] = v.split('-');
                      v = numero.slice(0,8) + '-' + dv;
                    } else {
                      // mientras escribe el cuerpo numérico, limitar a 8
                      v = v.slice(0,8);
                    }

                    // Evitar guión inicial
                    if (v.startsWith('-')) v = v.replace(/^-+/, '');

                    setNuevoPracticanteRut(v);
                  }}
                  className="border-gray-300"
                  pattern="^[0-9]{1,8}-[0-9K]$"
                  title="Formato: 1-8 dígitos, guión y dígito o K (ej: 12345678-K)"
                  maxLength={11}
                />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={nuevoPracticantePassword}
                  onChange={(e) => setNuevoPracticantePassword(e.target.value)}
                  className="border-gray-300"
                />
                <Select
                  value={nuevoPracticanteConsultorio}
                  onValueChange={(value: string) => setNuevoPracticanteConsultorio(value)}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Consultorio asignado" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultorios.map((c) => (
                      <SelectItem key={c.nombre} value={c.nombre}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAgregarPracticante}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Crear practicante
              </Button>
            </div>

            {practicantes.length > 0 && (
              <div className="pt-4 border-t border-gray-100 mt-6">
                <p className="text-xs text-gray-500 mb-2">
                  Practicantes registrados ({practicantes.length})
                </p>
                <div className="overflow-x-auto">
                  <div className="flex gap-2 pb-2 min-w-max">
                    {practicantes.map((p) => (
                      <Badge
                        key={p.nombre}
                        variant={practicanteSeleccionado === p.nombre ? "default" : "outline"}
                        className={
                          practicanteSeleccionado === p.nombre
                            ? "bg-blue-600 text-white whitespace-nowrap"
                            : p.estado === "inactivo"
                            ? "border-gray-300 text-gray-400 whitespace-nowrap opacity-60"
                            : "border-gray-300 text-gray-700 whitespace-nowrap"
                        }
                      >
                        {p.nombre} - {p.consultorio}
                        {p.estado === "inactivo" && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide">
                            Inactivo
                          </span>
                        )}
                        {practicanteSeleccionado === p.nombre && p.estado === "activo" && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide">
                            Seleccionado
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Total Sesiones</CardTitle>
              <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-cyan-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{totalSesiones}</div>
              <p className="text-xs text-gray-500 mt-1">
                {hayFiltrosActivos ? "Según filtros aplicados" : "Tratamientos registrados"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Kinesiólogos</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{kinesiologosActivosCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                Profesionales activos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Última Sesión</CardTitle>
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">
                {ultimaSesion ? ultimaSesion.hora : "--:--"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {ultimaSesion ? (ultimaSesion.fechaSolo || ultimaSesion.fecha?.split('T')[0] || "Sin fecha") : "Sin registros"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Ubicaciones</CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">
                {new Set(registrosFiltrados.map(r => `${r.latitud},${r.longitud}`)).size}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Centros diferentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Filtros */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </CardTitle>
              {hayFiltrosActivos && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={limpiarFiltros}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-2">
                <Label htmlFor="busqueda" className="text-gray-700">Búsqueda General</Label>
                <Input
                  id="busqueda"
                  placeholder="Buscar en todos los campos..."
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kinesiologo" className="text-gray-700">Kinesiólogo</Label>
                <Select value={filtroKinesiologo} onValueChange={setFiltroKinesiologo}>
                  <SelectTrigger id="kinesiologo" className="border-gray-300">
                    <SelectValue placeholder="Todos los profesionales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los profesionales</SelectItem>
                    {kinesiologosUnicos.map((nombre) => (
                      <SelectItem key={nombre} value={nombre}>
                        {nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tratamiento" className="text-gray-700">Tratamiento</Label>
                <Select value={filtroTratamiento} onValueChange={setFiltroTratamiento}>
                  <SelectTrigger id="tratamiento" className="border-gray-300">
                    <SelectValue placeholder="Todos los tratamientos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tratamientos</SelectItem>
                    {tratamientosUnicos.map((tratamiento) => (
                      <SelectItem key={tratamiento} value={tratamiento}>
                        {tratamiento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultorio" className="text-gray-700">Consultorio</Label>
                <Select value={filtroConsultorio} onValueChange={setFiltroConsultorio}>
                  <SelectTrigger id="consultorio" className="border-gray-300">
                    <SelectValue placeholder="Todos los consultorios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los consultorios</SelectItem>
                    {consultoriosUnicos.map((nombre) => (
                      <SelectItem key={nombre} value={nombre}>
                        {nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaInicio" className="text-gray-700">Fecha Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin" className="text-gray-700">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                  className="border-gray-300"
                />
              </div>
            </div>

            {hayFiltrosActivos && (
              <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-700">
                  Mostrando {totalSesiones} de {registros.length} registros según los filtros aplicados
                </p>
                <Button 
                  onClick={aplicarFiltros} 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Aplicar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de Registros */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Historial de Sesiones Clínicas
                </CardTitle>
                <CardDescription className="text-blue-50 mt-1">
                  Registro completo de tratamientos kinesiológicos
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={generarExcel}
                  disabled={registrosFiltrados.length === 0}
                  className="btn-export-excel"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generar Excel
                </Button>
                <Button
                  onClick={generarPDF}
                  disabled={registrosFiltrados.length === 0}
                  className="btn-export-pdf"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generar PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {registrosFiltrados.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-10 w-10 text-gray-300" />
                </div>
                <p className="text-gray-700">
                  {registros.length === 0 
                    ? "No hay registros disponibles" 
                    : "No se encontraron registros con los filtros aplicados"}
                </p>
                <p className="text-sm mt-1">
                  {registros.length === 0 
                    ? "Los kinesiólogos aún no han registrado sesiones" 
                    : "Intenta ajustar los filtros de búsqueda"}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-gray-700">Profesional</TableHead>
                        <TableHead className="text-gray-700">Tratamiento</TableHead>
                        <TableHead className="text-gray-700">Consultorio</TableHead>
                        <TableHead className="text-gray-700">Fecha</TableHead>
                        <TableHead className="text-gray-700">Hora</TableHead>
                        <TableHead className="text-gray-700">Ubicación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrosFiltrados.map((registro) => (
                        <TableRow key={registro.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                                {(registro.nombre_practicante || registro.kinesiologo_nombre || registro.practicante_nombre || "?").charAt(0).toUpperCase()}
                              </div>
                              <span className="text-gray-900">
                                {registro.nombre_practicante || registro.kinesiologo_nombre || registro.practicante_nombre || "Sin nombre"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600">
                              {registro.tipo_atencion || registro.tratamiento || registro.actividad || "Sin especificar"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {registro.consultorio || registro.consultorioNombre || "No asignado"}
                          </TableCell>
                          <TableCell className="text-gray-700">{registro.fechaSolo || registro.fecha?.split('T')[0] || "Sin fecha"}</TableCell>
                          <TableCell className="text-gray-700">{registro.hora || "Sin hora"}</TableCell>
                          <TableCell>
                            <a
                              href={`https://www.google.com/maps?q=${registro.latitud},${registro.longitud}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
                            >
                              <MapPin className="h-4 w-4" />
                              Ver en mapa
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo: Crear Practicante */}
      <div 
        className={showConfirmCrearPracticante ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmCrearPracticante(false)}
      />
      <div className={showConfirmCrearPracticante ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">¿Crear nuevo practicante?</div>
        <div className="confirm-message">
          Estás a punto de crear el practicante <strong>{nuevoPracticanteNombre}</strong> con RUT <strong>{nuevoPracticanteRut}</strong> asignado al consultorio <strong>{nuevoPracticanteConsultorio}</strong>.
        </div>
        <div className="confirm-buttons">
          <button className="confirm-btn-cancel" onClick={() => setShowConfirmCrearPracticante(false)}>Cancelar</button>
          <button className="confirm-btn-confirm" onClick={confirmarCrearPracticante}>Crear practicante</button>
        </div>
      </div>

      {/* Diálogo: Agregar Consultorio */}
      <div 
        className={showConfirmAgregarConsultorio ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmAgregarConsultorio(false)}
      />
      <div className={showConfirmAgregarConsultorio ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">¿Agregar nuevo consultorio?</div>
        <div className="confirm-message">
          Estás a punto de agregar el consultorio <strong>{nuevoConsultorioNombre}</strong>
          {nuevoConsultorioDireccion && (
            <>
              {' '}con dirección <strong>{nuevoConsultorioDireccion}</strong>
            </>
          )}.
        </div>
        <div className="confirm-buttons">
          <button className="confirm-btn-cancel" onClick={() => setShowConfirmAgregarConsultorio(false)}>Cancelar</button>
          <button className="confirm-btn-confirm" onClick={confirmarAgregarConsultorio}>Agregar consultorio</button>
        </div>
      </div>

      {/* Diálogo: Cambiar Estado Consultorio */}
      <div 
        className={showConfirmEliminarConsultorio ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmEliminarConsultorio(false)}
      />
      <div className={showConfirmEliminarConsultorio ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">¿Cambiar estado del consultorio?</div>
        <div className="confirm-message">
          {consultorios.find(c => c.nombre === consultorioAEliminar)?.estado === 'activo' ? (
            <>Estás a punto de <strong>desactivar</strong> el consultorio <strong>{consultorioAEliminar}</strong>.</>
          ) : (
            <>Estás a punto de <strong>activar</strong> el consultorio <strong>{consultorioAEliminar}</strong>.</>
          )}
        </div>
        <div className="confirm-buttons">
          <button className="confirm-btn-cancel" onClick={() => setShowConfirmEliminarConsultorio(false)}>Cancelar</button>
          <button className="confirm-btn-confirm" onClick={confirmarToggleEstadoConsultorio}>
            {consultorios.find(c => c.nombre === consultorioAEliminar)?.estado === 'activo' ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>

      {/* Diálogo: Cambiar Estado Practicante */}
      <div 
        className={showConfirmCambiarEstado ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmCambiarEstado(false)}
      />
      <div className={showConfirmCambiarEstado ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">
          {practicanteActual?.estado === "activo" ? "¿Desactivar practicante?" : "¿Activar practicante?"}
        </div>
        <div className="confirm-message">
          {practicanteActual?.estado === "activo" ? (
            <>
              Estás a punto de desactivar a <strong>{practicanteSeleccionado}</strong>. El practicante no podrá iniciar sesión hasta que sea reactivado.
            </>
          ) : (
            <>
              Estás a punto de activar a <strong>{practicanteSeleccionado}</strong>. El practicante podrá iniciar sesión nuevamente.
            </>
          )}
        </div>
        <div className="confirm-buttons">
          <button className="confirm-btn-cancel" onClick={() => setShowConfirmCambiarEstado(false)}>Cancelar</button>
          <button className="confirm-btn-confirm" onClick={confirmarCambiarEstadoPracticante}>
            {practicanteActual?.estado === "activo" ? "Desactivar" : "Activar"}
          </button>
        </div>
      </div>

      {/* Diálogo: Cambiar Contraseña */}
      <div 
        className={showConfirmCambiarPassword ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmCambiarPassword(false)}
      />
      <div className={showConfirmCambiarPassword ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">¿Cambiar contraseña?</div>
        <div className="confirm-message">
          ¿Estás seguro de que deseas cambiar la contraseña del practicante <strong>{practicanteSeleccionado}</strong>?
        </div>
        <div className="confirm-buttons">
          <button className="confirm-btn-cancel" onClick={() => setShowConfirmCambiarPassword(false)}>Cancelar</button>
          <button className="confirm-btn-confirm" onClick={confirmarCambiarPassword}>Confirmar</button>
        </div>
      </div>

      {/* Diálogo: Cerrar Sesión */}
      <div 
        className={showConfirmLogout ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmLogout(false)}
      />
      <div className={showConfirmLogout ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">¿Cerrar sesión?</div>
        <div className="confirm-message">
          ¿Estás seguro que deseas salir del panel de administración?
        </div>
        <div className="confirm-buttons">
          <button className="confirm-btn-cancel" onClick={() => setShowConfirmLogout(false)}>Cancelar</button>
          <button className="confirm-btn-confirm" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </div>

      {/* Diálogo: Asignar Consultorio a Practicante */}
      <div 
        className={showConfirmAsignarConsultorio ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmAsignarConsultorio(false)}
      />
      <div className={showConfirmAsignarConsultorio ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">¿Asignar consultorio al practicante?</div>
        <div className="confirm-message">
          Se asignará el consultorio <strong>{consultorioParaAsignar}</strong> al practicante <strong>{practicanteActual?.nombre}</strong> (RUT {practicanteActual?.rut}).
        </div>
        <div className="confirm-buttons">
          <button className="confirm-btn-cancel" onClick={() => setShowConfirmAsignarConsultorio(false)}>Cancelar</button>
          <button className="confirm-btn-confirm" onClick={confirmarAsignarConsultorio}>Asignar</button>
        </div>
      </div>

      {/* Diálogo: Quitar Consultorio asignado */}
      <div 
        className={showConfirmQuitarConsultorio ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmQuitarConsultorio(false)}
      />
      <div className={showConfirmQuitarConsultorio ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">¿Quitar consultorio del practicante?</div>
        <div className="confirm-message">
          Se quitará el consultorio <strong>{consultorioParaQuitar}</strong> del practicante <strong>{practicanteActual?.nombre}</strong> (RUT {practicanteActual?.rut}).
        </div>
        <div className="confirm-buttons">
          <button className="confirm-btn-cancel" onClick={() => setShowConfirmQuitarConsultorio(false)}>Cancelar</button>
          <button 
            className="confirm-btn-confirm" 
            onClick={async () => { 
              if (consultorioParaQuitar && practicanteActual) {
                await handleQuitarConsultorio(consultorioParaQuitar);
              }
              setShowConfirmQuitarConsultorio(false);
              setConsultorioParaQuitar("");
            }}
          >
            Quitar
          </button>
        </div>
      </div>
    </div>
  );
}
