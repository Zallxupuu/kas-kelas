import { Wallet, Gift, PartyPopper, ShoppingCart, MoreHorizontal, HelpCircle, type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Gift,
  PartyPopper,
  ShoppingCart,
  MoreHorizontal
};

interface CategoryIconProps {
  iconKey?: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ iconKey, size = 20, className = "" }: CategoryIconProps) {
  const Icon = iconKey && iconMap[iconKey] ? iconMap[iconKey] : HelpCircle;
  return <Icon size={size} className={className} />;
}
