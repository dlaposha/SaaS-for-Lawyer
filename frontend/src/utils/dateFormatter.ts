import { format, formatDistance } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

export const formatDate = (date: Date | string, formatStr = 'PP', locale = 'uk') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locale === 'uk' ? uk : enUS;
  return format(dateObj, formatStr, { locale: localeObj });
};

export const formatDateDistance = (date: Date | string, locale = 'uk') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locale === 'uk' ? uk : enUS;
  return formatDistance(dateObj, new Date(), { 
    addSuffix: true, 
    locale: localeObj 
  });
};