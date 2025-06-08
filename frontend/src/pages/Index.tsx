
import React from "react";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a tu sistema POS</h1>
        <p className="text-xl text-gray-600">Comienza a administrar las operaciones de tu restaurante</p>
      </div>
    </div>
  );
};

export default Index;
