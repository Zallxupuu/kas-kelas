import { supabase } from '../supabase';
import { User } from '@/types';
import { fetchInitialData } from '@/store/useStore';

export const userService = {
  async getAllUsers() {
    const { data } = await supabase.from('app_users').select('*').order('absenNumber');
    return data || [];
  },

  async getActiveUsers() {
    const { data } = await supabase.from('app_users').select('*').eq('isActive', true).order('absenNumber');
    return data || [];
  },

  async getUserById(id: number) {
    const { data } = await supabase.from('app_users').select('*').eq('id', id).single();
    return data;
  },

  async addUser(user: Omit<User, 'id' | 'createdAt'>) {
    const { data, error } = await supabase.from('app_users').insert([user]).select().single();
    if (error) throw error;
    await fetchInitialData();
    return data.id;
  },

  async updateUser(id: number, data: Partial<Omit<User, 'id'>>) {
    const { error } = await supabase.from('app_users').update(data).eq('id', id);
    if (error) throw error;
    await fetchInitialData();
  },

  async deleteUser(id: number) {
    const { error } = await supabase.from('app_users').delete().eq('id', id);
    if (error) throw error;
    await fetchInitialData();
  },

  async getPaymentStatusByPeriod(periodId: number) {
    const users = await userService.getActiveUsers();
    const { data: periodTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('periodId', periodId)
      .eq('type', 'income');

    const transactions = periodTransactions || [];

    return users.map((user: User) => {
      const userTransactions = transactions.filter(
        t => t.userId === user.id
      );
      const totalPaid = userTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        user,
        totalPaid,
        transactions: userTransactions
      };
    });
  }
};
