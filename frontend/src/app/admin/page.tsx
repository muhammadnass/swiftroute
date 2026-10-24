'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Package, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import OrderCard from '@/components/shared/OrderCard';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner w-10 h-10" />
    </div>
  );

  const stats = data?.stats || {};

  // Mock chart data
  const chartData = [
    { month: 'Jul', orders: 420, revenue: 180000 },
    { month: 'Aug', orders: 580, revenue: 245000 },
    { month: 'Sep', orders: 720, revenue: 312000 },
    { month: 'Oct', orders: 650, revenue: 276000 },
    { month: 'Nov', orders: 890, revenue: 398000 },
    { month: 'Dec', orders: 1020, revenue: 456000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">SwiftRoute — Full platform overview</p>
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-green-400">All Systems Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Companies" value={stats.totalCompanies || 0} icon={Building2} color="text-blue-400" bgColor="bg-blue-400/10" trend={{ value: 12, label: 'this month' }} delay={0} />
        <StatCard label="Total Riders" value={stats.totalRiders || 0} icon={Users} color="text-green-400" bgColor="bg-green-400/10" trend={{ value: 8, label: 'this month' }} delay={0.05} />
        <StatCard label="Total Orders" value={stats.totalOrders || 0} icon={Package} color="text-brand-400" bgColor="bg-brand-400/10" trend={{ value: 24, label: 'this month' }} delay={0.1} />
        <StatCard label="Platform Revenue" value={formatCurrency(stats.totalRevenue || 0)} icon={DollarSign} color="text-yellow-400" bgColor="bg-yellow-400/10" trend={{ value: 18, label: 'this month' }} delay={0.15} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Companies', value: stats.activeCompanies || 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Pending Approval', value: stats.pendingCompanies || 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Online Riders', value: stats.activeRiders || 0, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: "Today's Orders", value: stats.todayOrders || 0, icon: AlertCircle, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="stat-card flex items-center gap-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
              <s.icon className={cn('w-5 h-5', s.color)} />
            </div>
            <div>
              <div className="font-display font-bold text-xl">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-6">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }}
              />
              <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-6">Platform Revenue (₦)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }}
                formatter={(v: number) => [formatCurrency(v), 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div>
          <h3 className="font-display font-semibold text-lg mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {data?.recentOrders?.slice(0, 5).map((order: any, i: number) => (
              <OrderCard key={order.id} order={order} showCustomer delay={i * 0.05} />
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div>
          <h3 className="font-display font-semibold text-lg mb-4">Pending Company Approvals</h3>
          <div className="space-y-3">
            {data?.pendingApprovals?.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-400" />
                No pending approvals
              </div>
            )}
            {data?.pendingApprovals?.map((company: any, i: number) => (
              <motion.div key={company.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">{company.name}</div>
                    <div className="text-sm text-gray-400">{company.state} • {company.city}</div>
                  </div>
                  <div className={cn('status-badge', getStatusColor('PENDING_APPROVAL'))}>
                    {getStatusLabel('PENDING_APPROVAL')}
                  </div>
                </div>
                <div className="text-sm text-gray-400">{company.owner.firstName} {company.owner.lastName} • {company.owner.email}</div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => api.put(`/admin/companies/${company.id}/status`, { status: 'ACTIVE' }).then(() => toast.success('Company approved!')).catch(() => toast.error('Failed'))}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => api.put(`/admin/companies/${company.id}/status`, { status: 'SUSPENDED' }).then(() => toast.success('Company rejected')).catch(() => toast.error('Failed'))}
                    className="btn-ghost text-sm py-2 px-4 text-red-400 border-red-400/20"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
