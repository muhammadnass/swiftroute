'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Package, Star, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RiderEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/riders/earnings').then(r => setData(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-60"><div className="spinner w-8 h-8" /></div>;

  const summary = data?.summary || {};

  const weeklyData = [
    { day: 'Mon', amount: 3200 }, { day: 'Tue', amount: 4800 },
    { day: 'Wed', amount: 2100 }, { day: 'Thu', amount: 6500 },
    { day: 'Fri', amount: 5800 }, { day: 'Sat', amount: 8200 },
    { day: 'Sun', amount: 4100 },
  ];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold">My Earnings</h1>

      {/* Wallet */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-6">
        <div className="text-sm text-brand-100 mb-2">Wallet Balance</div>
        <div className="font-display font-bold text-4xl text-white mb-4">{formatCurrency(summary.walletBalance || 0)}</div>
        <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Request Withdrawal
        </button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Today', value: summary.today || 0 },
          { label: 'This Week', value: summary.thisWeek || 0 },
          { label: 'This Month', value: summary.thisMonth || 0 },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass rounded-2xl p-4 text-center">
            <div className="font-display font-bold text-base text-brand-400">{formatCurrency(item.value)}</div>
            <div className="text-xs text-gray-400 mt-1">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="font-bold">{summary.rating?.toFixed(1) || '—'}</div>
            <div className="text-xs text-gray-400">Your Rating</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="font-bold">{summary.totalDeliveries || 0}</div>
            <div className="text-xs text-gray-400">Total Deliveries</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold mb-4">This Week</h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 12 }} formatter={(v: number) => [formatCurrency(v), '']} />
            <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2} fill="url(#grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="font-semibold mb-3">Recent Earnings</h3>
        <div className="space-y-2">
          {data?.earnings?.map((e: any, i: number) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-400/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">{e.order?.orderNumber}</div>
                  <div className="text-xs text-gray-500">{e.order?.deliveredAt ? formatDate(e.order.deliveredAt) : '—'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-400">+{formatCurrency(e.amount)}</div>
                <div className={`text-xs ${e.isPaid ? 'text-green-500' : 'text-yellow-500'}`}>{e.isPaid ? 'Paid' : 'Pending'}</div>
              </div>
            </motion.div>
          ))}
          {(!data?.earnings || data.earnings.length === 0) && (
            <div className="glass rounded-xl p-8 text-center text-gray-400 text-sm">No earnings yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
