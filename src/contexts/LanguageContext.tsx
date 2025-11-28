import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  changeLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const AVAILABLE_LANGUAGES = [
  {
    value: 'fr',
    label: 'FR',
    fullLabel: 'Français',
    direction: 'ltr' as const,
  },
  {
    value: 'en',
    label: 'ENG',
    fullLabel: 'English',
    direction: 'ltr' as const,
  },
  {
    value: 'ar',
    label: 'AR',
    fullLabel: 'العربية',
    direction: 'rtl' as const,
  },
];

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isRTL, setIsRTL] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    // Get saved language from localStorage or use i18n's detected language
    const savedLanguage = localStorage.getItem('i18nextLng') || i18n.language || 'fr';
    const currentLang = AVAILABLE_LANGUAGES.find(lang => lang.value === savedLanguage) || AVAILABLE_LANGUAGES[0];
    
    // Ensure i18n is set to the saved language
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
    
    setCurrentLanguage(savedLanguage);
    setIsRTL(currentLang.direction === 'rtl');
    setDirection(currentLang.direction);
    
    // Apply language changes
    applyLanguageChanges(savedLanguage, currentLang.direction);
  }, [i18n]);

  const applyLanguageChanges = (language: string, dir: 'ltr' | 'rtl') => {
    // Change document direction and language
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Apply RTL-specific styles
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
      document.body.style.direction = 'rtl';
      document.body.style.textAlign = 'right';
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
      document.body.style.direction = 'ltr';
      document.body.style.textAlign = 'left';
    }
  };

  const changeLanguage = (language: string) => {
    // Save to localStorage first
    localStorage.setItem('i18nextLng', language);
    
    // Change i18n language - this will trigger languageChanged event
    // The event handler will update state and apply document changes
    i18n.changeLanguage(language).catch((err) => {
      console.error('Error changing language:', err);
    });
  };

  // Listen to i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const selectedLang = AVAILABLE_LANGUAGES.find(lang => lang.value === lng) || AVAILABLE_LANGUAGES[0];
      setCurrentLanguage(lng);
      setIsRTL(selectedLang.direction === 'rtl');
      setDirection(selectedLang.direction);
      
      // Apply document changes
      applyLanguageChanges(lng, selectedLang.direction);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const value: LanguageContextType = {
    currentLanguage,
    isRTL,
    direction,
    changeLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

