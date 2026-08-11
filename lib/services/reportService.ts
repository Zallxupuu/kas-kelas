import { supabase } from '../supabase';
import { startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import { userService } from './userService';
import { periodService } from './periodService';

export const reportService = {
  async getCurrentBalance() {
    const { data: transactions } = await supabase.from('transactions').select('type, amount');
    if (!transactions) return 0;
    
    return transactions.reduce((balance, t) => {
      return t.type === 'income' ? balance + t.amount : balance - t.amount;
    }, 0);
  },

  async getMonthlyReport(month: number, year: number) {
    const start = startOfMonth(new Date(year, month)).toISOString();
    const end = endOfMonth(new Date(year, month)).toISOString();

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', start)
      .lte('date', end);

    const txs = transactions || [];

    const income = txs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = txs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      transactions: txs
    };
  },

  async getExpenseBreakdownByCategory(month: number, year: number) {
    const start = startOfMonth(new Date(year, month)).toISOString();
    const end = endOfMonth(new Date(year, month)).toISOString();

    const { data: expenses } = await supabase
      .from('transactions')
      .select('amount, categoryId')
      .eq('type', 'expense')
      .gte('date', start)
      .lte('date', end);

    const { data: categories } = await supabase.from('categories').select('*');
    
    if (!expenses || !categories) return [];

    const categoryMap = new Map(categories.map(c => [c.id, c]));

    const breakdown = expenses.reduce((acc, t) => {
      const catId = t.categoryId;
      if (catId) {
        if (!acc[catId]) {
          acc[catId] = {
            category: categoryMap.get(catId),
            total: 0
          };
        }
        acc[catId].total += t.amount;
      }
      return acc;
    }, {} as Record<number, { category: any, total: number }>);

    return Object.values(breakdown);
  },

  async getUnpaidUsers(periodId: number) {
    const period = await periodService.getPeriodById(periodId);
    if (!period) return [];

    const paymentStatus = await userService.getPaymentStatusByPeriod(periodId);
    
    return paymentStatus
      .filter((status: any) => status.totalPaid < period.defaultNominal)
      .map((status: any) => ({
        user: status.user,
        paid: status.totalPaid,
        remaining: period.defaultNominal - status.totalPaid
      }));
  },

  async getCashFlowTrend(days: number = 30) {
    const endDate = new Date();
    // Tambahkan 1 hari untuk safety margin zona waktu di filter Supabase
    const safeEndDate = new Date(endDate);
    safeEndDate.setDate(safeEndDate.getDate() + 1);
    
    const startDate = subDays(endDate, days);
    startDate.setHours(0, 0, 0, 0);
    
    const { data: transactions } = await supabase
      .from('transactions')
      .select('type, amount, date')
      .gte('date', startDate.toISOString())
      .lte('date', safeEndDate.toISOString());

    const txs = transactions || [];

    // Group by day
    const trend = new Map<string, { income: number, expense: number }>();
    
    // Initialize all days with 0 (menggunakan timezone lokal)
    for (let i = 0; i <= days; i++) {
      const dateStr = format(subDays(endDate, days - i), 'yyyy-MM-dd');
      trend.set(dateStr, { income: 0, expense: 0 });
    }

    // Populate data
    txs.forEach(t => {
      // Parse tanggal UTC ke lokal, lalu format ke YYYY-MM-DD
      const localDate = new Date(t.date);
      const dateStr = format(localDate, 'yyyy-MM-dd');
      
      const existing = trend.get(dateStr);
      if (existing) {
        if (t.type === 'income') existing.income += t.amount;
        else existing.expense += t.amount;
      }
    });

    return Array.from(trend.entries()).map(([date, data]) => ({
      date,
      ...data,
      balance: data.income - data.expense
    }));
  },

  async getCashFlowByPeriod() {
    const { data: transactions } = await supabase.from('transactions').select('type, amount, date');
    const { data: periods } = await supabase.from('payment_periods').select('*').order('startDate', { ascending: true });

    if (!transactions || !periods) return this.getCashFlowTrend(7);

    let runningBalance = 0;
    const result = [];

    for (const period of periods) {
      const start = new Date(period.startDate).getTime();
      const end = new Date(period.endDate).getTime();

      const periodTxs = transactions.filter(t => {
        const txDate = new Date(t.date).getTime();
        return txDate >= start && txDate <= end;
      });

      const income = periodTxs.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
      const expense = periodTxs.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
      
      runningBalance += (income - expense);

      result.push({
        date: period.label, // Using label for chart X-axis
        balance: runningBalance,
        income,
        expense
      });
    }

    if (result.length === 0) {
      return this.getCashFlowTrend(7); // Fallback if no periods
    }

    return result;
  }
};
