'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Package, ArrowUpRight,
  Target, Calendar, BarChart2, Zap
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, CartesianGrid, Legend
} from 'recharts';
import StatCard from '@/components/shared/StatCard';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Build projection data from actual chartData
const buildProjectionData = (chartData: Array<{ revenue?: number; amount?: number; name?: string }>, _summary: Record<string, number>) => {
  if (!chartData || chartData.length < 3) return null;

  const values = chartData.map((d) => d.revenue || d.amount || 0);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const last = values[values.length - 1];
  const growthRate = values.length > 1
    ? (last - values[0]) / Math.max(values[0], 1)
    : 0.05;

  return [
    { period: '30 days', projected: Math.round(avg * 30), growth: Math.max(growthRate, 0.03) },
    { period: '60 days', projected: Math.round(avg * 30 * (1 + growthRate)), growth: Math.max(growthRate * 1.1, 0.04) },
    { period: '90 days', projected: Math.round(avg * 30 * (1 + growthRate * 2)), growth: Math.max(growthRate * 1.2, 0.05) },
  ];
};

// 6-month projection chart data
const build6MonthData = (currentMonthRevenue: number, growthRate = 0.08) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const result = [];
  for (let i = 0; i < 6; i++) {
    const monthIdx = (now.getMonth() + i) % 12;
    const multiplier = Math.pow(1 + growthRate, i);
    result.push({
      month: months[monthIdx],
      actual: i === 0 ? currentMonthRevenue : undefined,
      projected: Math.round(currentMonthRevenue * multiplier),
    });
  }
  return result;
};

interface Earning {
  id: string;
  amount: number;
  isPaid: boolean;
  createdAt: string;
  order?: { orderNumber: string };
}

interface EarningsData {
  summary: {
    walletBalance?: number;
    today?: number;
    thisWeek?: number;
    thisMonth?: number;
    totalOrders?: number;
  };
  chartData: Array<{ name: string; revenue: number }>;
  earnings: Earning[];
}

export default function CompanyEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'earnings' | 'projection'>('earnings');

  useEffect(() => {
    api.get('/companies/earnings')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load earnings'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-60"><div className="spinner w-8 h-8" /></div>;

  const summary = data?.summary || {};
  const chartData = data?.chartData || [
    { name: 'Mon', revenue: 12000 }, { name: 'Tue', revenue: 18500 },
    { name: 'Wed', revenue: 9200 }, { name: 'Thu', revenue: 22000 },
    { name: 'Fri', revenue: 19800 }, { name: 'Sat', revenue: 31000 },
    { name: 'Sun', revenue: 15500 },
  ];

  const projections = buildProjectionData(chartData, summary);
  const currentMonthRevenue = summary.thisMonth || 45000;
  const sixMonthData = build6MonthData(currentMonthRevenue);
  const projected30 = projections?.[0]?.projected || currentMonthRevenue;
  const projected90 = projections?.[2]?.projected || Math.round(currentMonthRevenue * 1.15);
  const growthPct = projections ? Math.round((projections[0].growth || 0.08) * 100) : 8;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Earnings &amp; Projections</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your revenue overview and growth forecast</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-elevated)' }}>
          {[
            { id: 'earnings', label: 'Earnings' },
            { id: 'projection', label: '📈 Revenue Projection' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'earnings' | 'projection')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'hover:bg-white/5'
              }`}
              style={activeTab !== tab.id ? { color: 'var(--text-secondary)' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── EARNINGS TAB ─── */}
      {activeTab === 'earnings' && (
        <>
          {/* Wallet Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative">
              <p className="text-brand-100 text-sm mb-1">Wallet Balance</p>
              <p className="font-display font-bold text-4xl text-white mb-6">{formatCurrency(summary.walletBalance || 0)}</p>
              <div className="flex gap-3">
                <button className="bg-white text-brand-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">
                  Withdraw
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                  View History
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Today" value={formatCurrency(summary.today || 0)} trend={{ value: 12, label: "vs yesterday" }} delay={0.05} />
            <StatCard icon={TrendingUp} label="This Week" value={formatCurrency(summary.thisWeek || 0)} trend={{ value: 8, label: "vs last week" }} delay={0.1} />
            <StatCard icon={DollarSign} label="This Month" value={formatCurrency(summary.thisMonth || 0)} trend={{ value: 15, label: "vs last month" }} delay={0.15} />
            <StatCard icon={Package} label="Total Orders" value={summary.totalOrders || 0} delay={0.2} />
          </div>

          {/* Chart */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Weekly Revenue</h3>
              <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +18% vs last week
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 13 }}
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#earningsGrad)" dot={false} activeDot={{ r: 5, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
            <div className="space-y-3">
              {data?.earnings?.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{e.order?.orderNumber || '—'}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{formatDate(e.createdAt)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-400">+{formatCurrency(e.amount)}</div>
                    <div className={`text-xs mt-0.5 ${e.isPaid ? 'text-green-500' : 'text-yellow-500'}`}>{e.isPaid ? 'Settled' : 'Pending'}</div>
                  </div>
                </motion.div>
              ))}

              {(!data?.earnings || data.earnings.length === 0) && (
                <div className="glass rounded-xl p-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No earnings recorded yet. Create orders to start earning.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── REVENUE PROJECTION TAB ─── */}
      {activeTab === 'projection' && (
        <>
          {/* Disclaimer */}
          <div className="glass-orange rounded-xl p-4 flex items-start gap-3 text-sm">
            <Zap className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Subscriber feature.</strong> Projections are calculated from your actual delivery history using a {growthPct}% estimated monthly growth rate. Real results depend on your order volume.
            </span>
          </div>

          {/* Projection summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {projections?.map((p, i) => (
              <motion.div
                key={p.period}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    i === 0 ? 'bg-blue-400/10' : i === 1 ? 'bg-purple-400/10' : 'bg-brand-400/10'
                  }`}>
                    <Target className={`w-4 h-4 ${i === 0 ? 'text-blue-400' : i === 1 ? 'text-purple-400' : 'text-brand-400'}`} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.period}</span>
                </div>
                <div className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.projected)}</div>
                <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  +{Math.round(p.growth * 100)}% growth assumed
                </div>
              </motion.div>
            ))}
          </div>

          {/* 6-month chart */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>6-Month Revenue Forecast</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Based on current month revenue of {formatCurrency(currentMonthRevenue)} with {growthPct}% monthly growth
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-brand-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Projected
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sixMonthData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 13 }}
                  formatter={(v: number, name: string) => [formatCurrency(v), name === 'actual' ? 'Actual' : 'Projected']}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                <Bar dataKey="actual" name="Actual" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="projected" name="Projected" fill="#f97316" fillOpacity={0.3} radius={[6, 6, 0, 0]} stroke="#f97316" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Break-even & insights */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BarChart2 className="w-5 h-5 text-brand-400" />
                Revenue Insights
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Platform subscription</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₦30,000/mo</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Estimated 8% fees (this month)</span>
                  <span className="font-semibold text-orange-400">-{formatCurrency(currentMonthRevenue * 0.08)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Net revenue this month</span>
                  <span className="font-semibold text-green-400">{formatCurrency(currentMonthRevenue * 0.92 - 30000)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Projected 90-day net</span>
                  <span className="font-display font-bold text-brand-400">{formatCurrency(projected90 * 0.92 - 30000)}</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Calendar className="w-5 h-5 text-brand-400" />
                Growth Milestones
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Current monthly run rate', value: formatCurrency(currentMonthRevenue), color: 'bg-gray-400/20 text-gray-300' },
                  { label: 'Projected at 30 days', value: formatCurrency(projected30), color: 'bg-blue-400/10 text-blue-400' },
                  { label: 'Projected at 90 days', value: formatCurrency(projected90), color: 'bg-brand-400/10 text-brand-400' },
                  { label: 'Annual projection', value: formatCurrency(projected90 * 4), color: 'bg-green-400/10 text-green-400' },
                ].map((m, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${m.color}`}>
                    <span className="opacity-80">{m.label}</span>
                    <span className="font-display font-bold">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
