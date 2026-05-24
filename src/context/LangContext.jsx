import { createContext, useContext, useState, useEffect } from "react";
import ar from "../i18n/ar";
import en from "../i18n/en";

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("lemo_lang") || "ar");

  const t = lang === "ar" ? ar : en;
  const isRTL = lang === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("lemo_lang", lang);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, dir]);

  const toggleLang = () => setLang((prev) => (prev === "ar" ? "en" : "ar"));

  // helper: get bilingual field from product (nameAr/nameEn, descAr/descEn)
  const field = (obj, key) => {
    if (!obj) return "";
    return lang === "ar" ? obj[`${key}Ar`] || obj[`${key}En`] : obj[`${key}En`] || obj[`${key}Ar`];
  };

  return (
    <LangContext.Provider value={{ lang, t, isRTL, dir, toggleLang, field }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
};