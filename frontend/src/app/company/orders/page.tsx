'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Package } from 'lucide-react';
import Link from 'next/link';
import OrderCard from '@/components/shared/OrderCard';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

export default function CompanyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'ALL') params.set('status', status);
    if (search) params.set('search', search);
    api.get(`/orders?${params}`)
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [status, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} orders found</p>
        </div>
        <Link href="/company/orders/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number, address, customer..."
            className="input-dark pl-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn('px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0', status === s ? 'bg-brand-500 text-white' : 'glass text-gray-400 hover:text-white')}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="spinner w-8 h-8" /></div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No orders found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or create a new order</p>
          <Link href="/company/orders/new" className="btn-primary inline-flex items-center gap-2 mt-6">
            <Plus className="w-4 h-4" /> Create Order
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order, i) => (
            <OrderCard key={order.id} order={order} showRider showCustomer delay={i * 0.03} />
          ))}
        </div>
      )}
    </div>
  );
}
