import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import iconoKine from "../assets/icono-kine.png";
import { LogOut, CheckCircle2, Activity, QrCode, RefreshCw } from "lucide-react";
import { toast } from "./ui/sonner";
import { Badge } from "./ui/badge";
import { apiRequest } from "../api/config";

interface KinesiologoPageProps {
  user: any;
  onLogout: () => void;
}

export function KinesiologoPage({ user, onLogout }: KinesiologoPageProps) {
  const [tratamiento, setTratamiento] = useState("");
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState("");
  const [consultorios, setConsultorios] = useState<string[]>([]);
  const [tiposAtencion, setTiposAtencion] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

const obtenerUbicacion = (opts?: PositionOptions, onSuccess?: () => void, onFail?: () => void) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(false);
        if (onSuccess) onSuccess();
      },
      (error) => {
        console.warn("No se pudo obtener la ubicación:", error.message || "Permiso denegado");
        setLocationError(true);
        // Usar ubicación por defecto si falla
        setLocation({
          lat: 0,
          lng: 0,
        });
        if (onFail) onFail();
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        ...opts,
      }
    );
  } else {
    setLocationError(true);
    setLocation({
      lat: 0,
      lng: 0,
    });
  }
};

const cargarDatosIniciales = async () => {
  try {
    setLoadingData(true);

    // Cargar consultorios asignados al practicante desde la tabla practicante_consultorio
    console.log("👤 Usuario:", user);
    console.log("📋 RUT del usuario:", user.rut);
    
    if (user.rut) {
      console.log("🏥 Cargando consultorios para RUT:", user.rut);
      const responseConsultorios = await apiRequest(`/api/practicantes/${encodeURIComponent(user.rut)}/consultorios`);
      console.log("📊 Respuesta de consultorios:", responseConsultorios);
      
      if (responseConsultorios.status === "ok" && responseConsultorios.data) {
        console.log("✅ Datos de consultorios recibidos:", responseConsultorios.data);
        
        // Filtrar solo consultorios activos
        const consultoriosActivos = responseConsultorios.data
          .filter((c: any) => c.estado === 'activo')
          .map((c: any) => c.nombre);
        
        console.log("🟢 Consultorios activos:", consultoriosActivos);
        setConsultorios(consultoriosActivos);
        
        // Preseleccionar el primer consultorio si hay al menos uno
        if (consultoriosActivos.length > 0) {
          setConsultorioSeleccionado(consultoriosActivos[0]);
          console.log("✅ Auto-seleccionado:", consultoriosActivos[0]);
        }
      } else {
        console.log("⚠️ No se recibieron datos de consultorios");
        setConsultorios([]);
        setConsultorioSeleccionado("");
      }
    } else {
      console.log("❌ Usuario no tiene RUT");
      setConsultorios([]);
      setConsultorioSeleccionado("");
    }

    // Cargar tipos de atención
    const responseTipos = await apiRequest("/api/tipos-atencion");
    if (responseTipos.status === "ok" && responseTipos.data) {
      const nombresTipos = responseTipos.data.map((t: any) => t.nombre);
      setTiposAtencion(nombresTipos);
    }

    setLoadingData(false);
  } catch (error) {
    console.error("Error cargando datos iniciales:", error);
    toast.error("Error al cargar datos.");
    setLoadingData(false);
  }
};

const handleSincronizarDatos = async () => {
  try {
    // Obtener registros del localStorage
    const registrosLocales = JSON.parse(localStorage.getItem("registros") || "[]");
    
    console.log("🔄 Iniciando sincronización...");
    console.log("Registros a sincronizar:", registrosLocales.length);
    console.log("Datos:", registrosLocales);
    
    if (registrosLocales.length === 0) {
      toast.success("No hay registros pendientes para sincronizar");
      return;
    }

    // Enviar al backend
    const response = await apiRequest("/api/sincronizar", {
      method: "POST",
      body: JSON.stringify({ atenciones: registrosLocales }),
    });
    
    console.log("Respuesta de sincronización:", response);

    if (response.status === "ok" || response.status === "partial") {
      toast.success(`${response.exitosos} registros sincronizados correctamente`);
      
      if (response.fallidos > 0) {
        toast.error(`${response.fallidos} registros fallaron al sincronizar`);
      }
      
      // Limpiar localStorage después de sincronización exitosa
      if (response.status === "ok") {
        localStorage.removeItem("registros");
      }
    }
    
    // Actualizar ubicación
    obtenerUbicacion();
  } catch (error) {
    toast.error("Error al sincronizar datos. Intenta nuevamente.");
    console.error("Error en sincronización:", error);
  }
};

  useEffect(() => {
    // Cargamos datos, pero pediremos ubicación justo al registrar
    cargarDatosIniciales();
  }, []);


  const handleRegistrar = () => {
    if (!tratamiento) {
      toast.error("Por favor selecciona un tipo de atención");
      return;
    }

    if (!consultorioSeleccionado) {
      toast.error("Por favor selecciona un consultorio");
      return;
    }

    // Si no tenemos ubicación válida, pedir activación justo ahora
    const needsLocation = !location || (location.lat === 0 && location.lng === 0);
    if (needsLocation) {
      // Intentar obtener directamente; si el usuario deniega, mostramos prompt
      obtenerUbicacion(
        { enableHighAccuracy: true, timeout: 10000 },
        () => setShowConfirmDialog(true),
        () => setShowLocationPrompt(true)
      );
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmarRegistro = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      const ahora = new Date();
      const fechaSolo = ahora.toISOString().split('T')[0]; // YYYY-MM-DD
      const horaSolo = ahora.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // HH:MM:SS

      const registro = {
        id: Date.now(),
        nombre_practicante: user.nombre,
        tipo_atencion: tratamiento,
        consultorio: consultorioSeleccionado,
        fecha: ahora.toISOString(), // Para backend (timestamp completo)
        fechaSolo: fechaSolo, // Para mostrar en admin
        hora: horaSolo,
        latitud: location?.lat || 0,
        longitud: location?.lng || 0,
      };

      // Intentar guardar en el backend primero
      try {
        console.log("Enviando atención al backend:", {
          fecha: registro.fecha,
          consultorio: consultorioSeleccionado,
          tipo_atencion: tratamiento,
          nombre_practicante: user.nombre,
          latitud: registro.latitud,
          longitud: registro.longitud,
        });
        
        const response = await apiRequest("/api/atenciones", {
          method: "POST",
          body: JSON.stringify({
            fecha: registro.fecha,
            consultorio: consultorioSeleccionado,
            tipo_atencion: tratamiento,
            nombre_practicante: user.nombre,
            latitud: registro.latitud,
            longitud: registro.longitud,
          }),
        });
        
        console.log("Respuesta del backend:", response);
        toast.success("Sesión registrada y sincronizada correctamente");
      } catch (error: any) {
        // Si falla, guardar en localStorage para sincronizar después
        console.error("Error al sincronizar:", error);
        console.error("Mensaje de error:", error.message);
        
        const registros = JSON.parse(localStorage.getItem("registros") || "[]");
        registros.push(registro);
        localStorage.setItem("registros", JSON.stringify(registros));
        
        toast.error(`Sesión guardada localmente: ${error.message}`);
      }

      setTratamiento("");
      // Mantener el consultorio seleccionado para facilitar registros múltiples
      setLoading(false);
    } catch (error) {
      console.error("Error al registrar:", error);
      toast.error("Error al registrar la sesión");
      setLoading(false);
    }
  };

  // Datos para el código QR
  const qrData = JSON.stringify({
    id: user.id,
    nombre: user.nombre,
    especialidad: user.especialidad,
    tipo: "kinesiologo",
    sistema: "Gestión Kinesiológica"
  });

  // URL para generar QR code usando API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=0891b2&bgcolor=ffffff`;

  return (
    <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 p-4 min-h-[calc(100vh-80px)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-cyan-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <img src={iconoKine} alt="Ícono de Kinesiología" className="h-9 w-9" />
              </div>
              <div>
                <h1 className="text-gray-900 flex items-center gap-2">
                  {user.nombre}
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                    Kinesiólogo
                  </Badge>
                </h1>
                <p className="text-gray-600">{user.especialidad}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSincronizarDatos}
                className="h-10 px-4 border-cyan-300 text-cyan-700 hover:bg-cyan-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar Datos
              </Button>
              {/* <Button
                variant="outline"
                onClick={() => setShowQR(!showQR)}
                className="h-10 px-4 border-cyan-300 text-cyan-700 hover:bg-cyan-50"
              >
                <QrCode className="mr-2 h-4 w-4" />
                {showQR ? "Ocultar QR" : "Mostrar QR"}
              </Button> */}
              <Button
                variant="outline"
                onClick={() => setShowConfirmLogout(true)}
                className="h-10 px-4 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Diálogo: Activar ubicación */}
        <div 
          className={showLocationPrompt ? "confirm-overlay show" : "confirm-overlay"}
          onClick={() => setShowLocationPrompt(false)}
        />
        <div className={showLocationPrompt ? "confirm-dialog show" : "confirm-dialog"}>
          <div className="confirm-title">Activar ubicación</div>
          <div className="confirm-message">
            Para registrar la sesión necesitamos tu ubicación actual. Por favor permite el acceso a la ubicación del navegador.
          </div>
          <div className="confirm-buttons">
            <button className="confirm-btn-cancel" onClick={() => setShowLocationPrompt(false)}>Cancelar</button>
            <button
              className="confirm-btn-confirm"
              onClick={() => {
                obtenerUbicacion(
                  { enableHighAccuracy: true, timeout: 10000 },
                  () => { setShowLocationPrompt(false); setShowConfirmDialog(true); },
                  () => toast.error("No se pudo activar la ubicación. Revisa los permisos del navegador.")
                );
              }}
            >
              Activar ubicación
            </button>
          </div>
        </div>

        {/* Código QR */}
        {showQR && (
          <Card className="border-0 shadow-lg mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Código QR de Identificación
              </CardTitle>
              <CardDescription className="text-purple-50">
                Escanea este código para verificar la identidad del profesional
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-6 rounded-lg shadow-inner border-4 border-cyan-100">
                  <img 
                    src={qrCodeUrl} 
                    alt="Código QR del Kinesiólogo"
                    className="w-[200px] h-[200px]"
                  />
                </div>
                <div className="text-center">
                  <p className="text-gray-900">{user.nombre}</p>
                  <p className="text-sm text-gray-600">{user.especialidad}</p>
                  <p className="text-xs text-gray-500 mt-2">ID: {user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulario de Registro */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Registrar Sesión de Tratamiento
              </CardTitle>
              <CardDescription className="text-cyan-50">
                Documenta la sesión realizada con el paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-cyan-600" />
                  <span className="ml-2 text-gray-600">Cargando datos...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="consultorio" className="text-gray-700">Consultorio</Label>
                    <Select value={consultorioSeleccionado} onValueChange={setConsultorioSeleccionado}>
                      <SelectTrigger id="consultorio" className="border-gray-300">
                        <SelectValue placeholder="Selecciona el consultorio" />
                      </SelectTrigger>
                      <SelectContent>
                        {consultorios.length > 0 ? (
                          consultorios.map((consultorio) => (
                            <SelectItem key={consultorio} value={consultorio}>
                              {consultorio}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="Sin consultorio" disabled>
                            No hay consultorios disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tratamiento" className="text-gray-700">Tipo de Atención</Label>
                    <Select value={tratamiento} onValueChange={setTratamiento}>
                      <SelectTrigger id="tratamiento" className="border-gray-300">
                        <SelectValue placeholder="Selecciona el tipo de atención" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposAtencion.length > 0 ? (
                          tiposAtencion.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="Sin tipo" disabled>
                            No hay tipos de atención disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">
                      La fecha, hora y ubicación se registrarán automáticamente
                    </p>
                  </div>

                  <Button
                    onClick={handleRegistrar}
                    disabled={loading || !tratamiento || !consultorioSeleccionado}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    size="lg"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {loading ? "Registrando Sesión..." : "Registrar Sesión"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Panel de Instrucciones */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-t-lg">
              <CardTitle>Guía de Uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                  1
                </div>
                <div>
                  <p className="text-gray-900">Selecciona el tratamiento</p>
                  <p className="text-sm text-gray-600">Elige el tipo de sesión realizada con el paciente</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                  2
                </div>
                <div>
                  <p className="text-gray-900">Verificación automática</p>
                  <p className="text-sm text-gray-600">El sistema registrará fecha, hora y ubicación automáticamente</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                  3
                </div>
                <div>
                  <p className="text-gray-900">Confirma el registro</p>
                  <p className="text-sm text-gray-600">Haz clic en el botón para guardar la sesión</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                  4
                </div>
                <div>
                  <p className="text-gray-900">Auditoría</p>
                  <p className="text-sm text-gray-600">Los datos serán visibles para el supervisor administrativo</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Sistema de Gestión Kinesiológica v1.0
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overlay de confirmación */}
      <div 
        className={showConfirmDialog ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmDialog(false)}
      />

      {/* Diálogo de confirmación de registro */}
      <div className={showConfirmDialog ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">
          ¿Confirmar registro de sesión?
        </div>
        <div className="confirm-message">
          Estás a punto de registrar una sesión de <strong>{tratamiento}</strong> en <strong>{consultorioSeleccionado}</strong>.
          <br /><br />
          Esta acción quedará registrada en el sistema y será visible para el administrador.
        </div>
        <div className="confirm-buttons">
          <button 
            className="confirm-btn-cancel"
            onClick={() => setShowConfirmDialog(false)}
          >
            Cancelar
          </button>
          <button 
            className="confirm-btn-confirm"
            onClick={handleConfirmarRegistro}
          >
            Confirmar registro
          </button>
        </div>
      </div>

      {/* Diálogo de confirmación de cierre de sesión */}
      <div 
        className={showConfirmLogout ? "confirm-overlay show" : "confirm-overlay"}
        onClick={() => setShowConfirmLogout(false)}
      />
      <div className={showConfirmLogout ? "confirm-dialog show" : "confirm-dialog"}>
        <div className="confirm-title">¿Cerrar sesión?</div>
        <div className="confirm-message">
          ¿Estás seguro que deseas cerrar tu sesión?
        </div>
        <div className="confirm-buttons">
          <button className="confirm-btn-cancel" onClick={() => setShowConfirmLogout(false)}>Cancelar</button>
          <button className="confirm-btn-confirm" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}