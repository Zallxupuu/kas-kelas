import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const currencyFormatter = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const dateFormatter = (dateString: string, formatStr: string = 'dd MMMM yyyy'): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, formatStr, { locale: id });
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return dateString;
  }
};
