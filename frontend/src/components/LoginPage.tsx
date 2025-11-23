import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Heart } from "lucide-react";

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Usuarios predefinidos
    const users = [
      { id: 1, username: "admin", password: "admin123", tipo: "admin", nombre: "Dr. Admin", especialidad: "Administrador" },
      { id: 2, username: "kinesiologo", password: "kine123", tipo: "kinesiologo", nombre: "Lic. Juan Pérez", especialidad: "Kinesiología Deportiva" },
      { id: 3, username: "kinesiologo2", password: "kine123", tipo: "kinesiologo", nombre: "Lic. María González", especialidad: "Kinesiología Traumatológica" },
    ];

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 p-4">
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
              <Label htmlFor="username" className="text-gray-700">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-gray-300"
                required
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
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">{error}</div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              Acceder al Sistema
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">
              Usuarios de prueba:
            </p>
            <div className="text-xs text-gray-500 space-y-2 bg-gray-50 p-3 rounded-md">
              <p><span className="text-gray-700">Administrador:</span> usuario: <span className="font-mono bg-white px-1 rounded">admin</span> / contraseña: <span className="font-mono bg-white px-1 rounded">admin123</span></p>
              <p><span className="text-gray-700">Kinesiólogo:</span> usuario: <span className="font-mono bg-white px-1 rounded">kinesiologo</span> / contraseña: <span className="font-mono bg-white px-1 rounded">kine123</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
