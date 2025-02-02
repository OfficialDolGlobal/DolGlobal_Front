import React, { createContext, useContext, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

// Array de idiomas com suas configurações
const LANGUAGES = [
  { code: "pt", name: "Português", countryCode: "BR" },
  { code: "en", name: "English", countryCode: "US" },
  { code: "es", name: "Español", countryCode: "ES" },
  { code: "fr", name: "Français", countryCode: "FR" },
  { code: "it", name: "Italiano", countryCode: "IT" },
  { code: "th", name: "ไทย", countryCode: "TH" },
  { code: "zh", name: "中文", countryCode: "CN" },
  { code: "ru", name: "Русский", countryCode: "RU" }
];

// Criando o contexto de idioma
const LanguageContext = createContext();

// Provedor do contexto de idioma
export const LanguageManager = ({ children, translations }) => {
  const [currentLang, setCurrentLang] = useState("pt");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Detecta o idioma do navegador ao carregar
  useEffect(() => {
    const browserLang = navigator.language.split("-")[0];
    if (translations[browserLang]) {
      setCurrentLang(browserLang);
    }
  }, [translations]);

  // Função para trocar o idioma
  const changeLang = (lang) => {
    setCurrentLang(lang);
    setIsLangMenuOpen(false);
  };

  // Componente do seletor de idioma
  const LanguageSelector = () => {
    const currentLanguage = LANGUAGES.find(lang => lang.code === currentLang);

    return (
      <div className="relative">
        <button
          onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ReactCountryFlag
            countryCode={currentLanguage?.countryCode}
            svg
            className="rounded-sm"
            style={{
              width: '20px',
              height: '15px'
            }}
          />
          <span className="uppercase ml-2">{currentLang}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isLangMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 py-2 bg-[#000c2a] rounded-lg shadow-xl border border-white/10">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center space-x-3 ${
                  currentLang === lang.code ? "bg-white/5" : ""
                }`}
              >
                <ReactCountryFlag
                  countryCode={lang.countryCode}
                  svg
                  className="rounded-sm"
                  style={{
                    width: '20px',
                    height: '15px'
                  }}
                />
                <span className="ml-2">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        t: translations[currentLang],
        LanguageSelector,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personalizado para usar o contexto de idioma
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageManager;