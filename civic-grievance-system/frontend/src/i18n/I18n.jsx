import { createContext, useContext, useMemo, useState } from 'react';
import en from './en.js';
import kn from './kn.js';
import hi from './hi.js';

const dictionaries = { en, kn, hi };
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(localStorage.getItem('language') || 'en');
  const setLanguage = (next) => { localStorage.setItem('language', next); setLanguageState(next); };
  const value = useMemo(() => ({ language, setLanguage, t: (key) => dictionaries[language][key] || dictionaries.en[key] || key }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }
