'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Users, DollarSign, TrendingUp, Plus, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import OrderCard from '@/components/shared/OrderCard';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function CompanyDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/companies/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-10 h-10" /></div>;

  const stats = data?.stats || {};

  // Mock weekly data for chart
  const weekData = [
    { day: 'Mon', orders: 12, earnings: 24000 },
    { day: 'Tue', orders: 18, earnings: 36000 },
    { day: 'Wed', orders: 15, earnings: 30000 },
    { day: 'Thu', orders: 22, earnings: 44000 },
    { day: 'Fri', orders: 28, earnings: 56000 },
    { day: 'Sat', orders: 35, earnings: 70000 },
    { day: 'Sun', orders: 20, earnings: 40000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Good day, {user?.firstName} 👋</h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your deliveries today</p>
        </div>
        <Link href="/company/orders/new" className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-5 h-5" />
          New Order
        </Link>
      </div>

      {/* Status Banner (if not approved) */}
      {stats.walletBalance !== undefined && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-orange rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="font-semibold">Wallet Balance</div>
            <div className="text-2xl font-display font-bold text-brand-400">{formatCurrency(stats.walletBalance)}</div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={stats.totalOrders || 0} icon={Package} delay={0} />
        <StatCard label="Today's Orders" value={stats.todayOrders || 0} icon={TrendingUp} color="text-green-400" bgColor="bg-green-400/10" delay={0.05} />
        <StatCard label="Pending Orders" value={stats.pendingOrders || 0} icon={AlertCircle} color="text-yellow-400" bgColor="bg-yellow-400/10" delay={0.1} />
        <StatCard label="Active Riders" value={stats.activeRiders || 0} icon={Users} color="text-blue-400" bgColor="bg-blue-400/10" delay={0.15} />
      </div>

      {/* Chart */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">Weekly Performance</h3>
          <div className="text-sm text-gray-400">
            This Week: <span className="text-brand-400 font-semibold">{formatCurrency(stats.todayEarnings * 7 || 0)}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weekData}>
            <defs>
              <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} formatter={(v: number) => [formatCurrency(v), 'Earnings']} />
            <Area type="monotone" dataKey="earnings" stroke="#f97316" strokeWidth={2} fill="url(#earningsGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-lg">Recent Orders</h3>
          <Link href="/company/orders" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">View all</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {data?.recentOrders?.slice(0, 6).map((order: any, i: number) => (
            <OrderCard key={order.id} order={order} showRider showCustomer delay={i * 0.05} />
          ))}
        </div>
        {(!data?.recentOrders || data.recentOrders.length === 0) && (
          <div className="glass rounded-2xl p-12 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No orders yet</p>
            <p className="text-sm mt-1">Create your first order to get started</p>
            <Link href="/company/orders/new" className="btn-primary inline-flex items-center gap-2 mt-6">
              <Plus className="w-4 h-4" /> Create Order
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
