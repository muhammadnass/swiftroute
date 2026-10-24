'use client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; label: string };
  color?: string;
  bgColor?: string;
  delay?: number;
}

export default function StatCard({ label, value, icon: Icon, trend, color = 'text-brand-400', bgColor = 'bg-brand-400/10', delay = 0 }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', bgColor)}>
          <Icon className={cn('w-6 h-6', color)} />
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full', isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10')}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="font-display font-bold text-2xl mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {trend && <div className="text-xs text-gray-500 mt-1">{trend.label}</div>}
    </motion.div>
  );
}
