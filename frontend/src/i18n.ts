import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { format, formatDistance, formatRelative } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

// Кеш для формату дат
const dateFormatsCache = new Map();

const getDateFormats = (lng: string) => {
  if (dateFormatsCache.has(lng)) {
    return dateFormatsCache.get(lng);
  }

  const formats = {
    uk: {
      short: 'dd.MM.yyyy',
      medium: 'd MMM yyyy',
      long: 'd MMMM yyyy',
      numeric: 'dd.MM.yyyy HH:mm',
      datetime: 'dd.MM.yyyy, HH:mm',
      time: 'HH:mm',
      relative: 'PPP',
    },
    en: {
      short: 'MM/dd/yyyy',
      medium: 'MMM d, yyyy',
      long: 'MMMM d, yyyy',
      numeric: 'MM/dd/yyyy, h:mm a',
      datetime: 'MMM d, yyyy, h:mm a',
      time: 'h:mm a',
      relative: 'PPP',
    },
  };

  const result = lng === 'uk' ? formats.uk : formats.en;
  dateFormatsCache.set(lng, result);
  return result;
};

const getLocale = (lng: string) => {
  return lng === 'uk' ? uk : enUS;
};

i18n
  .use(Backend) // Використовуємо стандартний Backend замість HttpApi
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'uk'],
    fallbackLng: 'uk',
    debug: process.env.NODE_ENV === 'development',
    
    // Детекція мови
    detection: {
      order: ['localStorage', 'sessionStorage', 'cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      lookupCookie: 'i18next',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      cookieMinutes: 60 * 24 * 7, // 1 тиждень
      cookieDomain: window.location.hostname,
    },
    
    // Завантаження ресурсів
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      crossDomain: true,
      withCredentials: true,
      requestOptions: {
        cache: 'default',
        mode: 'cors',
      },
    },
    
    // Інтерполяція
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (value instanceof Date) {
          const locale = getLocale(lng || 'uk');
          const formats = getDateFormats(lng || 'uk');
          
          switch (format) {
            case 'short':
              return format(value, formats.short, { locale });
            case 'medium':
              return format(value, formats.medium, { locale });
            case 'long':
              return format(value, formats.long, { locale });
            case 'numeric':
              return format(value, formats.numeric, { locale });
            case 'datetime':
              return format(value, formats.datetime, { locale });
            case 'time':
              return format(value, formats.time, { locale });
            case 'relative':
              return formatRelative(value, new Date(), { locale });
            case 'distance':
              return formatDistance(value, new Date(), { 
                addSuffix: true, 
                locale 
              });
            default:
              return format(value, formats.medium, { locale });
          }
        }
        
        if (typeof value === 'number') {
          return new Intl.NumberFormat(lng, {
            style: format || 'decimal',
            currency: format === 'currency' ? 'UAH' : undefined,
          }).format(value);
        }
        
        return value;
      },
    },
    
    // React інтеграція
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    
    // Оптимізація
    load: 'currentOnly',
    cleanCode: true,
    keySeparator: false,
    nsSeparator: false,
    pluralSeparator: '_',
    contextSeparator: '_',
    partialBundledLanguages: true,
    
    // Налаштування неймспейсів
    ns: ['translation'],
    defaultNS: 'translation',
    fallbackNS: 'translation',
  });

// Обробники подій
i18n.on('initialized', () => {
  console.log('i18n initialized successfully');
});

i18n.on('loaded', (loaded) => {
  console.log('i18n resources loaded', loaded);
});

i18n.on('failedLoading', (lng, ns, msg) => {
  console.warn(`Failed to load i18n resource: ${lng}, ${ns}`, msg);
});

i18n.on('languageChanged', (lng) => {
  // Оновлюємо атрибути HTML
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
  
  // Оновлюємо заголовок сторінки
  const titleKey = `pageTitle.${window.location.pathname.slice(1) || 'dashboard'}`;
  document.title = i18n.t(titleKey, { defaultValue: 'Lawyer CRM' });
  
  // Зберігаємо налаштування
  localStorage.setItem('i18nextLng', lng);
  document.cookie = `i18next=${lng}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
});

i18n.on('missingKey', (lng, ns, key) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Missing translation key: ${key} in ${ns} for ${lng}`);
  }
});

// Допоміжні функції
export const changeLanguage = (lng: string) => {
  return i18n.changeLanguage(lng);
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const getAvailableLanguages = () => {
  return i18n.options.supportedLngs || ['en', 'uk'];
};

export default i18n;