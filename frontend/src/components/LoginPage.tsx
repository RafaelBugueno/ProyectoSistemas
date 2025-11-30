import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Heart } from "lucide-react";
import { apiRequest } from "../api/config";
import { toast } from "./ui/simple-toast";

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: rut,
          password: password
        })
      });

      if (response.status === "ok" && response.user) {
        // Persistir token + usuario
        if (response.token && response.expiresAt) {
          localStorage.setItem('auth', JSON.stringify({
            user: response.user,
            token: response.token,
            expiresAt: response.expiresAt
          }));
        }
        toast.success(`Bienvenido ${response.user.nombre}`);
        onLogin(response.user);
      } else {
        setError("RUT o contraseña incorrectos");
      }
    } catch (err: any) {
      console.error("Error en login:", err);
      
      // Determinar el tipo de error
      const errorMessage = err.message || "Error desconocido";
      
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        setError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución en el puerto 8000.");
        toast.error("Servidor no disponible");
      } else if (errorMessage.includes("base de datos") || errorMessage.includes("PostgreSQL")) {
        setError("Error de base de datos. Verifica que PostgreSQL esté en ejecución.");
        toast.error("Error de base de datos");
      } else if (errorMessage.includes("incorrectos") || errorMessage.includes("inválidas")) {
        setError("RUT o contraseña incorrectos. Verifica tus credenciales.");
        toast.error("Credenciales incorrectas");
      } else {
        setError(errorMessage);
        toast.error("Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 p-4 min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <img src="/src/assets/icono-kine.png" alt="kine" className="h-16 w-16 mx-auto" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center border-4 border-white">
                <Heart className="h-4 w-4 text-white" fill="white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-center text-gray-800">Sistema de Gestión Kinesiológica</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Ingresa tus credenciales profesionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rut" className="text-gray-700">RUT</Label>
              <Input
                id="rut"
                type="text"
                inputMode="text"
                placeholder="Ejemplo: 12345678-K"
                value={rut}
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

                  setRut(v);
                }}
                className="border-gray-300"
                required
                disabled={loading}
                pattern="^[0-9]{1,8}-[0-9K]$"
                title="Formato: 1-8 dígitos, guión y dígito o K (ej: 12345678-K)"
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-300"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Acceder al Sistema"}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">
              Credenciales de prueba:
            </p>
            <div className="text-xs text-gray-500 space-y-2 bg-gray-50 p-3 rounded-md">
              <p><span className="text-gray-700">Administrador:</span> RUT: <span className="font-mono bg-white px-1 rounded">11111111-1</span> / contraseña: <span className="font-mono bg-white px-1 rounded">admin123</span></p>
              <p><span className="text-gray-700">Practicante:</span> RUT: <span className="font-mono bg-white px-1 rounded">22222222-2</span> / contraseña: <span className="font-mono bg-white px-1 rounded">prac123</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
