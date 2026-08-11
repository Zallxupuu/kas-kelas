import { supabase } from '../supabase';
import { Transaction } from '@/types';
import { useStore, fetchInitialData } from '@/store/useStore';

export interface GetTransactionsOptions {
  type?: 'income' | 'expense';
  categoryId?: number;
  userId?: number;
  periodId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const transactionService = {
  async getTransactions(options?: GetTransactionsOptions) {
    let query = supabase.from('transactions').select('*').order('date', { ascending: false });

    if (options?.type) query = query.eq('type', options.type);
    if (options?.categoryId) query = query.eq('categoryId', options.categoryId);
    if (options?.userId) query = query.eq('userId', options.userId);
    if (options?.periodId) query = query.eq('periodId', options.periodId);
    if (options?.startDate) query = query.gte('date', options.startDate);
    if (options?.endDate) query = query.lte('date', options.endDate);
    if (options?.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    return data;
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase.from('transactions').insert([transaction]).select().single();
    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
    
    await fetchInitialData();
    return data.id;
  },

  async updateTransaction(id: number, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) {
    const { error } = await supabase.from('transactions').update(data).eq('id', id);
    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
    await fetchInitialData();
  },

  async deleteTransaction(id: number) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
    await fetchInitialData();
  },

  async bulkInsertForUsers(
    userIds: number[], 
    baseTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ) {
    const transactions = userIds.map(userId => ({
      ...baseTransaction,
      userId
    }));
    
    const { error } = await supabase.from('transactions').insert(transactions);
    if (error) {
      console.error('Error bulk adding transactions:', error);
      throw error;
    }
    await fetchInitialData();
  }
};
