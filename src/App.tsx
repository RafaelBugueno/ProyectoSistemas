import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { KinesiologoPage } from "./components/KinesiologoPage";
import { AdminPage } from "./components/AdminPage";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [user, setUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : user.tipo === "admin" ? (
        <AdminPage user={user} onLogout={handleLogout} />
      ) : (
        <KinesiologoPage user={user} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}
