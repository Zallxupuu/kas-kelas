import { create } from 'zustand';


import { User, Category, Transaction } from '@/types';

interface AppState {
  users: User[];
  categories: Category[];
  transactions: Transaction[];
  currentBalance: number;
  isLoading: boolean;
  
  // Actions
  setUsers: (users: User[]) => void;
  setCategories: (categories: Category[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setCurrentBalance: (balance: number) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  users: [],
  categories: [],
  transactions: [],
  currentBalance: 0,
  isLoading: true,

  setUsers: (users) => set({ users }),
  setCategories: (categories) => set({ categories }),
  setTransactions: (transactions) => set({ transactions }),
  setCurrentBalance: (currentBalance) => set({ currentBalance }),
  setLoading: (isLoading) => set({ isLoading })
}));

import { supabase } from '@/lib/supabase';
import { reportService } from '@/lib/services/reportService';

// Fetch all data from Supabase
export const fetchInitialData = async () => {
  const store = useStore.getState();
  store.setLoading(true);

  try {
    const [usersRes, categoriesRes, transactionsRes, balance] = await Promise.all([
      supabase.from('app_users').select('*').order('absenNumber'),
      supabase.from('categories').select('*'),
      supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100),
      reportService.getCurrentBalance()
    ]);

    if (usersRes.data) store.setUsers(usersRes.data);
    if (categoriesRes.data) store.setCategories(categoriesRes.data);
    if (transactionsRes.data) store.setTransactions(transactionsRes.data);
    store.setCurrentBalance(balance);

  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
  } finally {
    store.setLoading(false);
  }
};
