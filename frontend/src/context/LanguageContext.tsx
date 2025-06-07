import React, { createContext, useContext, ReactNode } from "react";

type Language = "es";

interface LanguageProviderProps {
  children: ReactNode;
}

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "es",
  t: (key) => key,
});

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const t = (key: string) => key;

  return (
    <LanguageContext.Provider value={{ language: "es", t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
