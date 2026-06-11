import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import TR from '@site/src/data/translations';

const STORAGE_KEY = 'site_language';

function getInitialLang() {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
  } catch {}
  return 'en';
}

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Shared translation hook — use in any component that renders user-facing text.
 * Returns a t(key, vars?) function that looks up the current language dictionary.
 */
export function useTranslation() {
  const { lang } = useLanguage();
  return useMemo(() => {
    const dict = TR[lang] || TR.en;
    return (key, vars) => {
      let s = dict[key] || key;
      if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replace(`{${k}}`, v); });
      return s;
    };
  }, [lang]);
}
