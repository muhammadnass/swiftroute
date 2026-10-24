'use client';
import { useEffect, useState } from 'react';
import { Search, Package, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'ALL') params.set('status', status);
    if (search) params.set('search', search);
    api.get(`/admin/orders?${params}`)
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [status, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">All Orders</h1>
        <p className="text-gray-400 text-sm mt-1">{orders.length} orders platform-wide</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders by number, tracking code, address..." className="input-dark pl-11" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)} className={cn('px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all', status === s ? 'bg-brand-500 text-white' : 'glass text-gray-400 hover:text-white')}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-60"><div className="spinner w-8 h-8" /></div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-sm">{order.orderNumber}</div>
                    <div className="text-xs text-gray-500">{order.company?.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn('status-badge', getStatusColor(order.status))}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {getStatusLabel(order.status)}
                  </div>
                  <div className="text-sm font-bold text-brand-400 mt-1">{formatCurrency(order.deliveryFee)}</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Pickup</div>
                    <div className="text-gray-300 truncate">{order.pickupAddress}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Delivery</div>
                    <div className="text-gray-300 truncate">{order.deliveryAddress}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(order.createdAt)}
                </div>
                {order.rider && (
                  <div>
                    Rider: <span className="text-gray-300">{order.rider.user?.firstName} {order.rider.user?.lastName}</span>
                  </div>
                )}
                <div>
                  Platform fee: <span className="text-brand-400">{formatCurrency(order.platformFee)}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {orders.length === 0 && (
            <div className="glass rounded-2xl p-14 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
