import { supabase } from '../supabase';
import { PaymentPeriod } from '@/types';
import { fetchInitialData } from '@/store/useStore';

export const periodService = {
  async getAllPeriods() {
    const { data } = await supabase.from('payment_periods').select('*').order('startDate', { ascending: false });
    return data || [];
  },

  async getPeriodById(id: number) {
    const { data } = await supabase.from('payment_periods').select('*').eq('id', id).single();
    return data;
  },

  async addPeriod(period: Omit<PaymentPeriod, 'id' | 'createdAt'>) {
    const { data, error } = await supabase.from('payment_periods').insert([period]).select().single();
    if (error) throw error;
    await fetchInitialData();
    return data.id;
  },

  async updatePeriod(id: number, data: Partial<Omit<PaymentPeriod, 'id'>>) {
    const { error } = await supabase.from('payment_periods').update(data).eq('id', id);
    if (error) throw error;
    await fetchInitialData();
  },

  async deletePeriod(id: number) {
    const { error } = await supabase.from('payment_periods').delete().eq('id', id);
    if (error) throw error;
    await fetchInitialData();
  }
};
