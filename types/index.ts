export type Role = 'bendahara' | 'ketua' | 'anggota';

export interface User {
  id?: number;
  name: string;
  username: string;
  password_pin: string;
  role: Role;
  absenNumber?: number | null;
  isActive: boolean;
  createdAt?: string;
}

export interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  iconKey: string;
  colorHex: string;
  createdAt: string;
}

export interface PaymentPeriod {
  id?: number;
  label: string;
  startDate: string;
  endDate: string;
  defaultNominal: number;
  createdAt: string;
}

export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  amount: number;
  categoryId: number;
  userId?: number | null;
  periodId?: number | null;
  date: string;
  description: string;
  proofImageBlob?: Blob | null;
  createdAt: string;
  updatedAt: string;
}
