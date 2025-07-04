import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const Login = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleDigit = (d: string) => {
    setCode((prev) => prev + d);
  };
  const handleBackspace = () => setCode((prev) => prev.slice(0, -1));
  const handleClear = () => setCode("");

  const handleSubmit = async () => {
    if (!code) {
      toast({ title: t("Ingresa el código"), description: t("Por favor ingresa un código de acceso."), variant: "destructive" });
      return;
    }
    try {
      const employees = await getEmployees();
      const emp = employees.find((e: any) => e.access_code === code);
      if (emp) {
        toast({ title: `${t("Bienvenido")}, ${emp.name}` });
        login(emp);
        navigate("/pos");
      } else {
        toast({ title: t("Código inválido"), description: t("Código de acceso no reconocido."), variant: "destructive" });
        setCode("");
      }
    } catch (error) {
      console.error(error);
      toast({ title: t("Error"), description: t("Error al validar el código."), variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-2xl font-bold mb-4">{t("Introduce el código de acceso")}</h1>
      <div className="mb-4 text-3xl tracking-widest">{code || ' '}</div>
      <div className="grid grid-cols-3 gap-2">
        {[...'123456789'].map((d) => (
          <Button key={d} onClick={() => handleDigit(d)}>{d}</Button>
        ))}
        <Button onClick={handleClear}>C</Button>
        <Button onClick={() => handleDigit('0')}>0</Button>
        <Button onClick={handleBackspace}>&lArr;</Button>
      </div>
      <Button className="mt-6 w-1/2" onClick={handleSubmit}>{t("Entrar")}</Button>
    </div>
  );
};

export default Login;