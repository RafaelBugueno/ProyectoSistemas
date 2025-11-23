import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LogOut, CheckCircle2, Activity, QrCode, RefreshCw } from "lucide-react";
import { toast } from "./ui/sonner";
import { Badge } from "./ui/badge";

interface KinesiologoPageProps {
  user: any;
  onLogout: () => void;
}

export function KinesiologoPage({ user, onLogout }: KinesiologoPageProps) {
  const [tratamiento, setTratamiento] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

const obtenerUbicacion = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(false);
      },
      (error) => {
        console.warn("No se pudo obtener la ubicación:", error.message || "Permiso denegado");
        setLocationError(true);
        // Usar ubicación por defecto si falla
        setLocation({
          lat: 0,
          lng: 0,
        });
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
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

const handleSincronizarDatos = () => {
  obtenerUbicacion();
  toast.success("Datos sincronizados correctamente");
};

  const tratamientos = [
    "Rehabilitación Traumatológica",
    "Terapia Deportiva",
    "Masoterapia",
    "Electroterapia",
    "Kinesiología Respiratoria",
    "Rehabilitación Neurológica",
    "Ejercicios Terapéuticos",
    "Reeducación Postural",
    "Drenaje Linfático",
    "Terapia Manual",
    "Ultrasonido Terapéutico",
    "Crioterapia",
  ];

    useEffect(() => {
    obtenerUbicacion();
  }, []);


  const handleRegistrar = () => {
    if (!tratamiento) {
      toast.error("Por favor selecciona un tratamiento");
      return;
    }

    setLoading(true);

    // Simular petición
    setTimeout(() => {
      const ahora = new Date();

      const consultoriosGuardados = localStorage.getItem("consultorios");
      const consultorioActivoId = localStorage.getItem("consultorioActivoId");
      let consultorioNombre: string | null = null;

      if (consultoriosGuardados && consultorioActivoId) {
        try {
          const lista = JSON.parse(consultoriosGuardados) as { id: number; nombre: string }[];
          const encontrado = lista.find((c) => String(c.id) === consultorioActivoId);
          if (encontrado) {
            consultorioNombre = encontrado.nombre;
          }
        } catch {
          consultorioNombre = null;
        }
      }

      const registro = {
        id: Date.now(),
        kinesiologo_id: user.id,
        kinesiologo_nombre: user.nombre,
        especialidad: user.especialidad,
        tratamiento,
        consultorioId: consultorioActivoId ? Number(consultorioActivoId) : null,
        consultorioNombre,
        fecha: ahora.toLocaleDateString("es-ES"),
        hora: ahora.toLocaleTimeString("es-ES"),
        latitud: location?.lat || 0,
        longitud: location?.lng || 0,
      };

      // Guardar en localStorage
      const registros = JSON.parse(localStorage.getItem("registros") || "[]");
      registros.push(registro);
      localStorage.setItem("registros", JSON.stringify(registros));

      toast.success("Sesión registrada correctamente");
      setTratamiento("");
      setLoading(false);
    }, 500);
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-cyan-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <img src="/src/assets/icono-kine.png" alt="Ícono de Kinesiología" className="h-9 w-9" />
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
              <Button
                variant="outline"
                onClick={() => setShowQR(!showQR)}
                className="h-10 px-4 border-cyan-300 text-cyan-700 hover:bg-cyan-50"
              >
                <QrCode className="mr-2 h-4 w-4" />
                {showQR ? "Ocultar QR" : "Mostrar QR"}
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="h-10 px-4 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
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
              <div className="space-y-2">
                <Label htmlFor="tratamiento" className="text-gray-700">Tipo de Tratamiento</Label>
                <Select value={tratamiento} onValueChange={setTratamiento}>
                  <SelectTrigger id="tratamiento" className="border-gray-300">
                    <SelectValue placeholder="Selecciona el tratamiento realizado" />
                  </SelectTrigger>
                  <SelectContent>
                    {tratamientos.map((trat) => (
                      <SelectItem key={trat} value={trat}>
                        {trat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  La fecha, hora y ubicación se registrarán automáticamente
                </p>
              </div>

              <Button
                onClick={handleRegistrar}
                disabled={loading || !tratamiento}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                size="lg"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {loading ? "Registrando Sesión..." : "Registrar Sesión"}
              </Button>
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
    </div>
  );
}