import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { format, formatDistance, formatRelative } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

// Розширені фолбек переклади з вашими перекладами
const fallbackResources = {
  en: {
    translation: {
      // Загальні
      "dashboard": "Dashboard",
      "cases": "Cases",
      "clients": "Clients",
      "profile": "Profile",
      "logout": "Logout",
      "login": "Login",
      "register": "Register",
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "search": "Search",
      "filter": "Filter",
      "refresh": "Refresh",
      
      // Auth
      "email": "Email",
      "password": "Password",
      "fullName": "Full Name",
      "role": "Role",
      "loginSuccess": "Login successful",
      "logoutSuccess": "Logout successful",
      "registerSuccess": "Registration successful",
      "invalidCredentials": "Invalid email or password",
      "networkError": "Network error. Please check your connection.",
      
      // Dashboard
      "hoursTracked": "Hours Tracked",
      "income": "Income",
      "quickActions": "Quick Actions",
      "addCase": "Add Case",
      "addClient": "Add Client",
      "createInvoice": "Create Invoice",
      "startTimer": "Start Timer",
      "upcomingHearings": "Upcoming Hearings",
      "recentActivity": "Recent Activity",
      
      // Demo mode
      "demoMode": "Demo Mode",
      "realMode": "Real Mode",

      // Нові переклади з вашого файлу
      "welcome": "Welcome to Lawyer Dmitry LAPOSHA's CRM",
      "hearings": "Hearings",
      "tasks": "Tasks",
      "invoices": "Invoices",
      "kanban": "Kanban Board",
      "calendar": "Calendar",
      "timeTracker": "Time Tracker",
      "reports": "Reports",
      "noAccount": "Don't have an account?",
      "haveAccount": "Already have an account?",
      "emailRequired": "Please enter email!",
      "passwordRequired": "Please enter password!",
      "fullNameRequired": "Please enter full name!",
      "roleRequired": "Please select role!",
      "loginError": "Login error. Please check credentials.",
      "registerError": "Registration error. Please check data.",

      // Ролі
      "admin": "Administrator",
      "lawyer": "Lawyer", 
      "assistant": "Assistant",
      "paralegal": "Paralegal",
      "accountant": "Accountant",
      "viewer": "Viewer",

      // Статуси
      "open": "Open",
      "on_hold": "On Hold",
      "closed": "Closed",
      "archived": "Archived",
      "in_progress": "In Progress",
      "draft": "Draft",
      "sent": "Sent",
      "paid": "Paid",
      "overdue": "Overdue",

      // Стадії справ
      "pre_trial": "Pre-trial",
      "first_instance": "First Instance", 
      "appeal": "Appeal",
      "cassation": "Cassation",
      "enforcement": "Enforcement",

      // Додаткові переклади
      "number": "Number",
      "title": "Title",
      "client": "Client",
      "status": "Status",
      "stage": "Stage",
      "dueDate": "Due Date",
      "hourlyRate": "Hourly Rate",
      "budget": "Budget",
      "actions": "Actions",
      "view": "View",
      "description": "Description",
      "noDescription": "No description",
      "lastUpdated": "Last updated",
      "settings": "Settings"
    }
  },
  uk: {
    translation: {
      // Загальні
      "dashboard": "Панель керування",
      "cases": "Справи",
      "clients": "Клієнти",
      "profile": "Профіль",
      "logout": "Вихід",
      "login": "Вхід",
      "register": "Реєстрація",
      "loading": "Завантаження...",
      "error": "Помилка",
      "success": "Успіх",
      "save": "Зберегти",
      "cancel": "Скасувати",
      "delete": "Видалити",
      "edit": "Редагувати",
      "create": "Створити",
      "search": "Пошук",
      "filter": "Фільтр",
      "refresh": "Оновити",
      
      // Auth
      "email": "Електронна пошта",
      "password": "Пароль",
      "fullName": "Повне ім'я",
      "role": "Роль",
      "loginSuccess": "Вхід успішний",
      "logoutSuccess": "Вихід успішний",
      "registerSuccess": "Реєстрація успішна",
      "invalidCredentials": "Невірний email або пароль",
      "networkError": "Помилка мережі. Перевірте підключення.",
      
      // Dashboard
      "hoursTracked": "Відстежено годин",
      "income": "Дохід",
      "quickActions": "Швидкі дії",
      "addCase": "Додати справу",
      "addClient": "Додати клієнта",
      "createInvoice": "Створити рахунок",
      "startTimer": "Запустити таймер",
      "upcomingHearings": "Майбутні засідання",
      "recentActivity": "Остання активність",
      
      // Demo mode
      "demoMode": "Демо-режим",
      "realMode": "Реальний режим",

      // Нові переклади з вашого файлу
      "welcome": "Ласкаво просимо до CRM адвоката Дмитра ЛАПОШІ",
      "hearings": "Засідання",
      "tasks": "Завдання",
      "invoices": "Рахунки",
      "kanban": "Дошка завдань",
      "calendar": "Календар",
      "timeTracker": "Тайм-трекер",
      "reports": "Звіти",
      "noAccount": "Немає акаунта?",
      "haveAccount": "Вже маєте акаунт?",
      "emailRequired": "Будь ласка, введіть електронну пошту!",
      "passwordRequired": "Будь ласка, введіть пароль!",
      "fullNameRequired": "Будь ласка, введіть повне ім'я!",
      "roleRequired": "Будь ласка, виберіть роль!",
      "loginError": "Помилка входу. Перевірте логін та пароль.",
      "registerError": "Помилка реєстрації. Перевірте дані.",

      // Ролі
      "admin": "Адміністратор",
      "lawyer": "Адвокат",
      "assistant": "Помічник",
      "paralegal": "Юрист",
      "accountant": "Бухгалтер",
      "viewer": "Переглядач",

      // Статуси
      "open": "Відкрита",
      "on_hold": "На паузі",
      "closed": "Закрита",
      "archived": "Архів",
      "in_progress": "В роботі",
      "draft": "Чернетка",
      "sent": "Надіслано",
      "paid": "Оплачено",
      "overdue": "Протерміновано",

      // Стадії справ
      "pre_trial": "Досудове",
      "first_instance": "Перша інстанція",
      "appeal": "Апеляція",
      "cassation": "Касація",
      "enforcement": "Виконавче провадження",

      // Додаткові переклади
      "number": "Номер",
      "title": "Назва",
      "client": "Клієнт",
      "status": "Статус",
      "stage": "Стадія",
      "dueDate": "Кінцевий термін",
      "hourlyRate": "Погодинна ставка",
      "budget": "Бюджет",
      "actions": "Дії",
      "view": "Переглянути",
      "description": "Опис",
      "noDescription": "Опис відсутній",
      "lastUpdated": "Останнє оновлення",
      "settings": "Налаштування"
    }
  }
};

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

// Покращений кастомний бекенд
class RobustBackend extends Backend {
  private loadAttempts = new Map<string, number>();
  private readonly MAX_RETRIES = 2;

  read(language: string, namespace: string, callback: Function) {
    const key = `${language}/${namespace}`;
    const attempts = this.loadAttempts.get(key) || 0;

    // Якщо перевищено кількість спроб, використовуємо фолбек
    if (attempts >= this.MAX_RETRIES) {
      console.warn(`Max retries reached for ${key}, using fallback`);
      callback(null, fallbackResources[language as keyof typeof fallbackResources]?.translation || {});
      return;
    }

    super.read(language, namespace, (err: any, data: any) => {
      if (err) {
        console.warn(`Attempt ${attempts + 1} failed to load ${key}:`, err);
        this.loadAttempts.set(key, attempts + 1);
        
        // Використовуємо фолбек переклади
        const fallbackData = fallbackResources[language as keyof typeof fallbackResources]?.translation || {};
        callback(null, fallbackData);
        return;
      }
      
      // Скидаємо лічильник при успішному завантаженні
      this.loadAttempts.delete(key);
      
      // Мерджимо з фолбеком для заповнення відсутніх ключів
      const mergedData = {
        ...fallbackResources[language as keyof typeof fallbackResources]?.translation,
        ...data
      };
      
      callback(null, mergedData);
    });
  }
}

// Функція для безпечної ініціалізації
const initializeI18n = async () => {
  try {
    const options = {
      supportedLngs: ['en', 'uk'],
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      
      // Детекція мови
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
        checkWhitelist: true,
      },
      
      // Завантаження ресурсів
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        addPath: '/locales/add/{{lng}}/{{ns}}',
        allowMultiLoading: false,
        crossDomain: false,
      },
      
      // Інтерполяція
      interpolation: {
        escapeValue: false,
        format: (value: any, format: string, lng: string) => {
          if (value instanceof Date) {
            const locale = getLocale(lng || 'en');
            const formats = getDateFormats(lng || 'en');
            
            try {
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
            } catch (error) {
              console.warn('Date formatting error:', error);
              return value.toISOString().split('T')[0];
            }
          }
          
          if (typeof value === 'number') {
            try {
              return new Intl.NumberFormat(lng, {
                style: format || 'decimal',
                currency: format === 'currency' ? 'UAH' : undefined,
              }).format(value);
            } catch (error) {
              console.warn('Number formatting error:', error);
              return value.toString();
            }
          }
          
          return value;
        },
      },
      
      // React інтеграція
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
      },
      
      // Запобігання помилок відсутніх ключів
      saveMissing: process.env.NODE_ENV === 'development',
      missingKeyHandler: (lng: string[], ns: string, key: string) => {
        console.warn(`Missing translation: ${ns}.${key} for language: ${lng}`);
      },
      
      // Налаштування для кращої продуктивності
      partialBundledLanguages: true,
      keySeparator: false,
      nsSeparator: false,

      // Ресурси за замовчуванням
      resources: fallbackResources
    };

    await i18n
      .use(RobustBackend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init(options);

    console.log('✅ i18n initialized successfully');
  } catch (error) {
    console.error('❌ i18n initialization failed:', error);
    // Аварійна ініціалізація з фолбек даними
    i18n.init({
      lng: 'en',
      resources: fallbackResources,
      interpolation: {
        escapeValue: false,
      },
    });
  }
};

// Обробники подій
i18n.on('initialized', () => {
  console.log('🌍 i18n initialized with language:', i18n.language);
});

i18n.on('loaded', (loaded) => {
  console.log('📦 i18n loaded:', loaded);
});

i18n.on('failedLoading', (lng: string, ns: string, msg: string) => {
  console.warn(`🚫 Failed to load ${ns} for ${lng}:`, msg);
});

i18n.on('languageChanged', (lng: string) => {
  console.log('🔄 Language changed to:', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
  localStorage.setItem('i18nextLng', lng);
});

i18n.on('missingKey', (lng: string[], ns: string, key: string) => {
  console.warn(`🔍 Missing translation key: ${ns}.${key} for language: ${lng}`);
});

// Утиліти для роботи з i18n
export const i18nUtils = {
  // Безпечне отримання перекладу
  t: (key: string, options?: any): string => {
    try {
      const result = i18n.t(key, options);
      return result || key;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }
  },

  // Зміна мови з обробкою помилок
  changeLanguage: async (lng: string): Promise<boolean> => {
    try {
      await i18n.changeLanguage(lng);
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  },

  // Отримання поточної мови
  getCurrentLanguage: (): string => {
    return i18n.language || 'en';
  },

  // Перевірка підтримки мови
  isLanguageSupported: (lng: string): boolean => {
    return i18n.languages.includes(lng);
  },

  // Отримання напрямку тексту
  getTextDirection: (lng?: string): 'ltr' | 'rtl' => {
    const language = lng || i18n.language;
    return i18n.dir(language);
  }
};

// Ініціалізація при імпорті
initializeI18n();

export default i18n;