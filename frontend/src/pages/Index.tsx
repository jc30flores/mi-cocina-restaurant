
import React from "react";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t("Welcome to Your Restaurant POS")}</h1>
        <p className="text-xl text-gray-600">{t("Start managing your restaurant operations")}</p>
      </div>
    </div>
  );
};

export default Index;
