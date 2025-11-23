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
  id: number;
  nombre: string;
  direccion?: string;
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
  const [consultorioActivoId, setConsultorioActivoId] = useState<number | null>(null);
  const [nuevoConsultorioNombre, setNuevoConsultorioNombre] = useState<string>("");
  const [nuevoConsultorioDireccion, setNuevoConsultorioDireccion] = useState<string>("");

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
          id: c.id || Math.random(),
          nombre: c.nombre,
          direccion: c.direccion,
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
          id: 1,
          nombre: "Consultorio Principal",
        },
      ];
      localStorage.setItem("consultorios", JSON.stringify(consultoriosIniciales));
    }

    setConsultorios(consultoriosIniciales);

    const consultorioActivoGuardado = localStorage.getItem("consultorioActivoId");
    let idActivo: number | null = null;

    if (consultorioActivoGuardado) {
      const parsed = Number(consultorioActivoGuardado);
      idActivo = Number.isNaN(parsed) ? null : parsed;
    }

    if (idActivo === null && consultoriosIniciales[0]) {
      idActivo = consultoriosIniciales[0].id;
    }

    if (idActivo !== null) {
      setConsultorioActivoId(idActivo);
      localStorage.setItem("consultorioActivoId", String(idActivo));
    } else {
      setConsultorioActivoId(null);
      localStorage.removeItem("consultorioActivoId");
    }
  };

  useEffect(() => {
    console.log("🚀 AdminPage: Componente montado, iniciando carga de datos...");
    console.log("👤 Usuario actual:", user);
    
    const inicializar = async () => {
      try {
        await Promise.all([cargarRegistros(), cargarConsultorios()]);
        console.log("✅ AdminPage: Datos iniciales cargados correctamente");
      } catch (error) {
        console.error("❌ AdminPage: Error al inicializar:", error);
      }
    };
    
    inicializar();
  }, []);

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

  const manejarCambioConsultorioActivo = (id: number | null) => {
    setConsultorioActivoId(id);
    if (id === null) {
      localStorage.removeItem("consultorioActivoId");
    } else {
      localStorage.setItem("consultorioActivoId", String(id));
    }
  };

  const handleAgregarConsultorio = () => {
    const nombre = nuevoConsultorioNombre.trim();
    const direccion = nuevoConsultorioDireccion.trim();

    if (!nombre) {
      return;
    }

    const nuevo: Consultorio = {
      id: Date.now(),
      nombre,
      ...(direccion ? { direccion } : {}),
    };

    const actualizados = [...consultorios, nuevo];
    actualizarConsultoriosEnStorage(actualizados);

    if (!consultorioActivoId) {
      manejarCambioConsultorioActivo(nuevo.id);
    }

    setNuevoConsultorioNombre("");
    setNuevoConsultorioDireccion("");
  };

  const handleEliminarConsultorio = (id: number) => {
    const actualizados = consultorios.filter((c) => c.id !== id);
    actualizarConsultoriosEnStorage(actualizados);

    if (consultorioActivoId === id) {
      manejarCambioConsultorioActivo(actualizados[0]?.id ?? null);
    }
  };

  const handleRestablecerConsultorios = () => {
    const porDefecto: Consultorio[] = [
      { id: 1, nombre: "Consultorio Principal" },
    ];
    actualizarConsultoriosEnStorage(porDefecto);
    manejarCambioConsultorioActivo(porDefecto[0].id);
    setNuevoConsultorioNombre("");
    setNuevoConsultorioDireccion("");
  };

  const consultorioActivo = useMemo(
    () => consultorios.find((c) => c.id === consultorioActivoId) || null,
    [consultorios, consultorioActivoId]
  );

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
          (registro.especialidad || "").toLowerCase().includes(busqueda) ||
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
  const kinesiologosActivosCount = new Set(
    registrosFiltrados.map((r) => r.kinesiologo_id || r.practicante_id)
  ).size;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
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
            <Button variant="outline" onClick={onLogout} className="border-gray-300">
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
                  Define el consultorio actual y administra las sedes disponibles.
                </CardDescription>
              </div>
            </div>
            {consultorioActivo && (
              <div className="text-sm text-right space-y-1">
                <p className="text-gray-500">Consultorio actual</p>
                <p className="font-medium text-gray-900">
                  {consultorioActivo.nombre}
                </p>
                {consultorioActivo.direccion && (
                  <p className="text-xs text-gray-500">
                    {consultorioActivo.direccion}
                  </p>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="space-y-2">
                <Label htmlFor="consultorioActivo" className="text-gray-700">
                  Consultorio activo
                </Label>
                <Select
                  value={consultorioActivoId ? String(consultorioActivoId) : ""}
                  onValueChange={(value: string) => {
                    if (!value) {
                      manejarCambioConsultorioActivo(null);
                      return;
                    }
                    const id = Number(value);
                    manejarCambioConsultorioActivo(Number.isNaN(id) ? null : id);
                  }}
                >
                  <SelectTrigger id="consultorioActivo" className="border-gray-300">
                    <SelectValue placeholder="Selecciona un consultorio" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultorios.length === 0 && (
                      <SelectItem value="none" disabled>
                        No hay consultorios configurados
                      </SelectItem>
                    )}
                    {consultorios.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Este consultorio se utilizará al registrar nuevas sesiones en el sistema.
                </p>
              </div>

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
                  {consultorios.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRestablecerConsultorios}
                      className="border-gray-300"
                    >
                      Restablecer consultorios
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {consultorios.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">
                  Consultorios registrados
                </p>
                <div className="flex flex-wrap gap-2">
                  {consultorios.map((c) => (
                    <Badge
                      key={c.id}
                      variant={consultorioActivoId === c.id ? "default" : "outline"}
                      className={
                        consultorioActivoId === c.id
                          ? "bg-cyan-600 text-white"
                          : "border-gray-300 text-gray-700"
                      }
                    >
                      {c.nombre}
                      {consultorioActivoId === c.id && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide">
                          Activo
                        </span>
                      )}
                      <button
                        type="button"
                        className="ml-2 text-[10px] underline"
                        onClick={() => handleEliminarConsultorio(c.id)}
                      >
                        Quitar
                      </button>
                    </Badge>
                  ))}
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
                {ultimaSesion ? ultimaSesion.fecha : "Sin registros"}
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
                        <TableHead className="text-gray-700">Especialidad</TableHead>
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
                            <Badge variant="outline" className="border-cyan-200 text-cyan-700 bg-cyan-50">
                              {registro.especialidad || "Sin especificar"}
                            </Badge>
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
    </div>
  );
}
