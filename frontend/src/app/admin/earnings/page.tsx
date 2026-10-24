'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Package, Users, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Legend } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/revenue')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load revenue data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-60"><div className="spinner w-8 h-8" /></div>;

  const summary = data?.summary || {};
  const monthlyData = data?.monthly || [
    { month: 'Jul', revenue: 420000, orders: 120 },
    { month: 'Aug', revenue: 680000, orders: 195 },
    { month: 'Sep', revenue: 540000, orders: 155 },
    { month: 'Oct', revenue: 890000, orders: 254 },
    { month: 'Nov', revenue: 1200000, orders: 342 },
    { month: 'Dec', revenue: 980000, orders: 281 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Platform Revenue</h1>
        <p className="text-gray-400 text-sm mt-1">Financial overview across all companies</p>
      </div>

      {/* Revenue Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-dark-700 to-dark-800 border border-brand-500/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative">
          <p className="text-gray-400 text-sm mb-1">Total Platform Revenue</p>
          <p className="font-display font-bold text-5xl gradient-text mb-1">{formatCurrency(summary.totalRevenue || 0)}</p>
          <div className="flex items-center gap-2 text-green-400 text-sm mt-3">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{summary.revenueGrowth || 18}% compared to last month</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="This Month" value={formatCurrency(summary.thisMonth || 0)} trend="+15%" positive delay={0} />
        <StatCard icon={TrendingUp} label="Last Month" value={formatCurrency(summary.lastMonth || 0)} delay={0.05} />
        <StatCard icon={Package} label="Total Orders" value={(summary.totalOrders || 0).toLocaleString()} delay={0.1} />
        <StatCard icon={Users} label="Active Companies" value={summary.activeCompanies || 0} delay={0.15} />
      </div>

      {/* Monthly Revenue Chart */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg mb-6">Monthly Revenue vs Orders</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} barCategoryGap="25%">
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 13 }}
              formatter={(v: number, name: string) => [name === 'revenue' ? formatCurrency(v) : v, name === 'revenue' ? 'Revenue' : 'Orders']}
            />
            <Legend formatter={v => v === 'revenue' ? 'Revenue' : 'Orders'} />
            <Bar yAxisId="left" dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} fillOpacity={0.9} />
            <Bar yAxisId="right" dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Trend */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg mb-6">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 13 }}
              formatter={(v: number) => [formatCurrency(v), 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#f97316' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Companies */}
      {data?.topCompanies && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-display font-semibold">Top Earning Companies</h3>
          </div>
          <div className="divide-y divide-white/5">
            {data.topCompanies.map((co: any, i: number) => (
              <div key={co.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-brand-500/20 rounded-xl flex items-center justify-center text-sm font-bold text-brand-400">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-medium">{co.name}</div>
                    <div className="text-sm text-gray-500">{co.state?.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-brand-400">{formatCurrency(co.totalRevenue || 0)}</div>
                  <div className="text-xs text-gray-500">{co._count?.orders || 0} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
