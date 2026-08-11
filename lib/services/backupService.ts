import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { reportService } from './reportService';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useStore } from '@/store/useStore';

export const backupService = {
  async exportDatabase() {
    try {
      const state = useStore.getState();
      const data = {
        users: state.users,
        categories: state.categories,
        transactions: state.transactions,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kas-kelas-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  },

  async importDatabase(file: File) {
    alert("Import data langsung ke Cloud tidak didukung dari web. Silakan gunakan dashboard Supabase.");
    return false;
  },

  async generateMonthlyReportPDF(month: number, year: number) {
    const report = await reportService.getMonthlyReport(month, year);
    const doc = new jsPDF();
    
    const monthName = format(new Date(year, month), 'MMMM yyyy', { locale: id });
    
    // Header
    doc.setFontSize(18);
    doc.text('Laporan Kas Kelas', 14, 20);
    doc.setFontSize(12);
    doc.text(`Periode: ${monthName}`, 14, 28);
    
    // Summary
    doc.text(`Total Pemasukan: Rp ${report.income.toLocaleString('id-ID')}`, 14, 40);
    doc.text(`Total Pengeluaran: Rp ${report.expense.toLocaleString('id-ID')}`, 14, 48);
    doc.text(`Saldo Akhir: Rp ${report.balance.toLocaleString('id-ID')}`, 14, 56);

    // Table
    const tableData = report.transactions.map((t: any, index: number) => [
      index + 1,
      format(new Date(t.date), 'dd MMM yyyy', { locale: id }),
      t.description || '-',
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `Rp ${t.amount.toLocaleString('id-ID')}`
    ]);

    (doc as any).autoTable({
      startY: 65,
      head: [['No', 'Tanggal', 'Keterangan', 'Jenis', 'Nominal']],
      body: tableData,
    });

    const fileName = `Laporan-Kas-${monthName.replace(' ', '-')}.pdf`;
    doc.save(fileName);
  }
};
