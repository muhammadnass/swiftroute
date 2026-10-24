'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import OrderCard from '@/components/shared/OrderCard';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const FILTERS = [
  { label: 'Active', status: '' },
  { label: 'Delivered', status: 'DELIVERED' },
  { label: 'All', status: 'ALL' },
];

export default function RiderOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter === 'ALL' ? '' : filter ? `?status=${filter}` : '';
    api.get(`/riders/orders${params}`)
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold">My Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button
            key={f.label}
            onClick={() => setFilter(f.status)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', filter === f.status ? 'bg-brand-500 text-white' : 'glass text-gray-400 hover:text-white')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner w-8 h-8" /></div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <OrderCard key={order.id} order={order} showCustomer delay={i * 0.04} />
          ))}
        </div>
      )}
    </div>
  );
}
