import { useEffect, useState } from 'react';
import type { ThemeConfig } from 'antd';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('system');

  /* зчитуємо системні/збережені налаштування */
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) setTheme(saved);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
        setTheme('system');
      }
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  /* зберігаємо вибір користувача */
  const saveTheme = (t: Theme) => {
    setTheme(t);
    localStorage.setItem('theme', t);
  };

  /* обчислюємо, чи темна тема зараз */
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && systemDark);

  /* базова конфігурація Ant Design */
  const themeConfig: ThemeConfig = {
    token: {
      colorPrimary: isDark ? '#13c2c2' : '#1DA57A',
    },
  };

  return { theme, setTheme: saveTheme, themeConfig };
};