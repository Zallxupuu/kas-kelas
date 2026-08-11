"use client";

import { motion } from "framer-motion";
import { GlassCard } from "./ui/GlassCard";
import { currencyFormatter, dateFormatter } from "@/utils/formatters";
import { Transaction, Category, User } from "@/types";
import { CategoryIcon } from "./CategoryIcon";
import { ArrowDown, ArrowUp } from "lucide-react";

interface TransactionListItemProps {
  transaction: Transaction;
  category?: Category;
  user?: User;
  index?: number;
}

export function TransactionListItem({ transaction, category, user, index = 0 }: TransactionListItemProps) {
  const isIncome = transaction.type === "income";
  // Use createdAt for exact time if available, otherwise use date
  const dateObj = transaction.createdAt ? new Date(transaction.createdAt) : new Date(transaction.date);
  const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}.${String(dateObj.getMinutes()).padStart(2, '0')}`;
  const method = "Tunai"; // Mocked payment method

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
    >
      <GlassCard className="p-4 flex items-center gap-4">
        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          <CategoryIcon iconKey={category?.iconKey} size={18} />
        </div>
        
        <div className="flex-1 min-w-0 z-10">
          <p className="font-bold text-slate-200 truncate text-sm">
            {category?.name || "Transaksi"} {user && `— ${user.name}`}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {timeStr} · {method}
          </p>
        </div>
        
        <div className="text-right z-10">
          <p className={`font-bold text-sm ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
            {isIncome ? "+" : "-"}{currencyFormatter(transaction.amount).replace('Rp', '')}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
