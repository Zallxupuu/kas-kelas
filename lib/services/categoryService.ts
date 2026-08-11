import { supabase } from '../supabase';
import { Category } from '@/types';
import { fetchInitialData } from '@/store/useStore';

export const categoryService = {
  async getAllCategories() {
    const { data } = await supabase.from('categories').select('*');
    return data || [];
  },

  async getCategoriesByType(type: 'income' | 'expense') {
    const { data } = await supabase.from('categories').select('*').eq('type', type);
    return data || [];
  },

  async getCategoryById(id: number) {
    const { data } = await supabase.from('categories').select('*').eq('id', id).single();
    return data;
  },

  async addCategory(category: Omit<Category, 'id' | 'createdAt'>) {
    const { data, error } = await supabase.from('categories').insert([category]).select().single();
    if (error) throw error;
    await fetchInitialData();
    return data.id;
  },

  async updateCategory(id: number, data: Partial<Omit<Category, 'id'>>) {
    const { error } = await supabase.from('categories').update(data).eq('id', id);
    if (error) throw error;
    await fetchInitialData();
  },

  async deleteCategory(id: number) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    await fetchInitialData();
  }
};
