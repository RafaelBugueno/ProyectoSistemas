import { useEffect, useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { KinesiologoPage } from "./components/KinesiologoPage";
import { AdminPage } from "./components/AdminPage";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [user, setUser] = useState<any>(null);

  // Cargar sesión persistida al iniciar
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const auth = JSON.parse(raw);
        if (auth?.user && auth?.expiresAt) {
          const now = Math.floor(Date.now() / 1000);
          if (now < Number(auth.expiresAt)) {
            setUser(auth.user);
          } else {
            localStorage.removeItem('auth');
          }
        }
      }
    } catch {
      // Ignorar errores de parseo
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setUser(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : user.tipo === "admin" ? (
          <AdminPage user={user} onLogout={handleLogout} />
        ) : (
          <KinesiologoPage user={user} onLogout={handleLogout} />
        )}
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}
