'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, Star, DollarSign, Power, ChevronRight, Navigation, Phone, Clock } from 'lucide-react';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function RiderHomePage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  const load = () => {
    Promise.all([
      api.get('/riders/dashboard'),
      api.get('/riders/orders'),
    ]).then(([dashRes, ordersRes]) => {
      setData(dashRes.data);
      setActiveOrders(ordersRes.data);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleStatus = async () => {
    if (!data?.stats) return;
    const newStatus = data.stats.status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';
    setTogglingStatus(true);
    try {
      await api.put('/riders/status', { status: newStatus });
      setData((d: any) => ({ ...d, stats: { ...d.stats, status: newStatus } }));
      toast.success(newStatus === 'AVAILABLE' ? '🟢 You are now online!' : '⭕ You are now offline');
    } catch { toast.error('Failed to update status'); }
    finally { setTogglingStatus(false); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order ${getStatusLabel(status)}`);
      load();
    } catch { toast.error('Failed to update order'); }
  };

  if (loading) return <div className="flex items-center justify-center h-80"><div className="spinner w-10 h-10" /></div>;

  const stats = data?.stats || {};
  const isOnline = stats.status !== 'OFFLINE';

  const nextStatusMap: Record<string, string> = {
    ACCEPTED: 'PICKED_UP',
    PICKED_UP: 'IN_TRANSIT',
    IN_TRANSIT: 'DELIVERED',
  };

  const nextStatusLabel: Record<string, string> = {
    ACCEPTED: 'Mark as Picked Up',
    PICKED_UP: 'Start Delivery',
    IN_TRANSIT: 'Mark as Delivered',
  };

  return (
    <div className="space-y-5">
      {/* Not approved warning */}
      {!stats.isApproved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-yellow-300 text-sm">Pending Approval</div>
            <div className="text-xs text-yellow-400/70 mt-0.5">Your company needs to approve you before you can receive orders.</div>
          </div>
        </motion.div>
      )}

      {/* Online Toggle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn('rounded-3xl p-6 transition-all duration-500', isOnline ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20' : 'glass border border-white/5')}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Status</div>
            <div className={cn('font-display font-bold text-2xl', isOnline ? 'text-green-400' : 'text-gray-400')}>
              {isOnline ? '🟢 Online' : '⭕ Offline'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {isOnline ? 'You can receive delivery orders' : 'Go online to start receiving orders'}
            </div>
          </div>
          <button
            onClick={toggleStatus}
            disabled={togglingStatus}
            className={cn('w-16 h-9 rounded-full relative transition-all duration-300 flex items-center', isOnline ? 'bg-green-400 justify-end pr-1' : 'bg-dark-600 border border-white/10 justify-start pl-1')}
          >
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-all', isOnline ? 'bg-white' : 'bg-gray-400')}>
              <Power className={cn('w-4 h-4', isOnline ? 'text-green-500' : 'text-gray-600')} />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-4">
          <DollarSign className="w-5 h-5 text-brand-400 mb-2" />
          <div className="font-display font-bold text-xl">{formatCurrency(stats.todayEarnings || 0)}</div>
          <div className="text-xs text-gray-400">Today's Earnings</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass rounded-2xl p-4">
          <Package className="w-5 h-5 text-green-400 mb-2" />
          <div className="font-display font-bold text-xl">{stats.todayDeliveries || 0}</div>
          <div className="text-xs text-gray-400">Today's Deliveries</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="glass rounded-2xl p-4">
          <Star className="w-5 h-5 text-yellow-400 mb-2" />
          <div className="font-display font-bold text-xl">{stats.rating?.toFixed(1) || '—'}</div>
          <div className="text-xs text-gray-400">Your Rating</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="glass rounded-2xl p-4">
          <DollarSign className="w-5 h-5 text-blue-400 mb-2" />
          <div className="font-display font-bold text-xl">{formatCurrency(stats.walletBalance || 0)}</div>
          <div className="text-xs text-gray-400">Wallet Balance</div>
        </motion.div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-lg mb-3">Active Orders ({activeOrders.length})</h3>
          <div className="space-y-4">
            {activeOrders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl overflow-hidden">
                {/* Order Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                  <div>
                    <div className="font-mono text-sm font-bold text-brand-400">{order.orderNumber}</div>
                    <div className={cn('status-badge mt-1.5', getStatusColor(order.status))}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {getStatusLabel(order.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-400">{formatCurrency(order.deliveryFee * 0.7)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Your earnings</div>
                  </div>
                </div>

                {/* Route */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 bg-green-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Pickup</div>
                      <div className="text-sm font-medium">{order.pickupAddress}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {order.pickupContactName} • {order.pickupContactPhone}
                      </div>
                    </div>
                  </div>
                  <div className="border-l-2 border-dashed border-white/10 ml-2.5 h-4" />
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 bg-brand-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3 h-3 text-brand-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Delivery</div>
                      <div className="text-sm font-medium">{order.deliveryAddress}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {order.deliveryContactName} • {order.deliveryContactPhone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package info */}
                {order.packageDescription && (
                  <div className="px-5 pb-4">
                    <div className="glass rounded-xl p-3 text-sm text-gray-400">
                      📦 {order.packageDescription}
                      {order.isFragile && <span className="ml-2 text-yellow-400 font-semibold">⚠️ Fragile</span>}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${order.pickupContactPhone}`}
                    className="btn-ghost flex items-center justify-center gap-2 text-sm py-3"
                  >
                    <Phone className="w-4 h-4 text-brand-400" /> Call Pickup
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLat},${order.deliveryLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost flex items-center justify-center gap-2 text-sm py-3"
                  >
                    <Navigation className="w-4 h-4 text-brand-400" /> Navigate
                  </a>
                  {nextStatusMap[order.status] && (
                    <button
                      onClick={() => updateOrderStatus(order.id, nextStatusMap[order.status])}
                      className="btn-primary col-span-2 flex items-center justify-center gap-2 py-3"
                    >
                      {nextStatusLabel[order.status]}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeOrders.length === 0 && isOnline && stats.isApproved && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-10 text-center">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-brand-400" />
          </div>
          <div className="font-display font-semibold text-lg mb-2">Ready for orders</div>
          <div className="text-sm text-gray-400">You'll be notified when your company assigns you an order</div>
        </motion.div>
      )}

      {/* Delivery History Link */}
      <Link href="/rider/orders" className="glass rounded-2xl p-5 flex items-center justify-between group hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dark-700 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="font-semibold">Delivery History</div>
            <div className="text-xs text-gray-500">{stats.totalDeliveries || 0} total deliveries</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      </Link>
    </div>
  );
}
