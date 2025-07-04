import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleDigit = (d: string) => {
    setCode((prev) => prev + d);
  };
  const handleBackspace = () => setCode((prev) => prev.slice(0, -1));
  const handleClear = () => setCode("");

  const handleSubmit = async () => {
    if (!code) {
      toast({ title: "Enter code", description: "Please enter an access code.", variant: "destructive" });
      return;
    }
    try {
      const employees = await getEmployees();
      const emp = employees.find((e: any) => e.access_code === code);
      if (emp) {
        toast({ title: `Welcome, ${emp.name}` });
        login(emp);
        navigate("/pos");
      } else {
        toast({ title: "Invalid Code", description: "Access code not recognized.", variant: "destructive" });
        setCode("");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to validate code.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-2xl font-bold mb-4">Enter Access Code</h1>
      <div className="mb-4 text-3xl tracking-widest">{code || ' '}</div>
      <div className="grid grid-cols-3 gap-2">
        {[...'123456789'].map((d) => (
          <Button key={d} onClick={() => handleDigit(d)}>{d}</Button>
        ))}
        <Button onClick={handleClear}>C</Button>
        <Button onClick={() => handleDigit('0')}>0</Button>
        <Button onClick={handleBackspace}>&lArr;</Button>
      </div>
      <Button className="mt-6 w-1/2" onClick={handleSubmit}>Enter</Button>
    </div>
  );
};

export default Login;