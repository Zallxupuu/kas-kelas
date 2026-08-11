# Kas Kelas - Aplikasi Keuangan Kelas Pintar

Aplikasi berbasis Next.js untuk mencatat dan melacak sistem keuangan kas kelas secara transparan dan mudah diakses oleh seluruh anggota kelas.

## 🚀 Fitur Utama
- **Sistem Akun (User Management)**: Autentikasi untuk Ketua, Bendahara, dan Anggota (read-only).
- **Dashboard Arus Kas**: Pantau uang masuk & keluar dan grafik pengeluaran 6 bulan terakhir.
- **Transaksi Real-Time**: Catat pemasukan (iuran) dan pengeluaran secara cepat.
- **Support PWA**: Aplikasi dapat di-install dan diakses selayaknya aplikasi native di HP.
- **Laporan Otomatis**: Generate laporan ke PDF & JSON (Backup).

## 💻 Tech Stack
- **Framework**: Next.js 14+ (App Router) dengan TypeScript
- **Styling**: Tailwind CSS & Framer Motion (Animasi UI / Glassmorphism)
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **PWA**: @serwist/next

## ⚙️ Persiapan & Instalasi
1. Clone repositori ini:
   ```bash
   git clone https://github.com/Zallxupuu/kas-kelas.git
   cd kas-kelas
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Siapkan environment variables. Buat file `.env.local` di root proyek:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Eksekusi kode tabel database melalui menu **SQL Editor** pada Dashboard Supabase. (Bisa merujuk dari schema tabel).
5. Jalankan aplikasi di mode development:
   ```bash
   npm run dev
   ```

## 👩‍💻 Struktur Role
- **Ketua**: Bisa mengatur/mengubah data siswa, _password_ (PIN), nomor absen, serta mengelola fitur manajemen tingkat lanjut.
- **Bendahara**: Bisa mencatat Pemasukan & Pengeluaran, mengatur kategori transaksi.
- **Anggota (Siswa Biasa)**: _Read-only_ untuk melihat riwayat dan melihat transparansi saldo kas.

## 📂 Supabase Schema Database
Tabel utama meliputi:
- `app_users`: Akun anggota dan otoritas role.
- `transactions`: Log transaksi kas kelas.
- `categories`: Kategori pemasukan / pengeluaran.
- `payment_periods`: Periode rentang wajib bayar.

---
_Dibuat dengan ❤️ untuk sistem keuangan kelas yang jujur, transparan, dan inovatif!_
