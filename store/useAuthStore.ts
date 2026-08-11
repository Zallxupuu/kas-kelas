import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'bendahara' | 'ketua' | 'anggota' | null;

interface AuthState {
  user: {
    id: number;
    username: string;
    role: Role;
  } | null;
  login: (user: { id: number; username: string; role: Role }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
