'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Package, Zap, CheckCircle, Clock, Bike, ArrowRight } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STEPS = ['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

export default function TrackPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/track/${code.trim().toUpperCase()}`);
      setOrder(data);
    } catch {
      toast.error('Order not found. Check your tracking code.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = order ? STEPS.indexOf(order.status) : -1;

  const stepLabels: Record<string, string> = {
    PENDING: 'Order Placed',
    ACCEPTED: 'Rider Assigned',
    PICKED_UP: 'Package Picked Up',
    IN_TRANSIT: 'Out for Delivery',
    DELIVERED: 'Delivered ✓',
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Nav */}
      <nav className="glass border-b border-white/5 px-4 py-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold">Swift<span className="text-brand-400">Route</span></span>
        </Link>
        <ChevronDivider />
        <span className="text-gray-400 text-sm">Track Package</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Track Your Package</h1>
          <p className="text-gray-400">Enter your tracking code to see real-time delivery status</p>
        </div>

        {/* Search */}
        <form onSubmit={handleTrack} className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Enter tracking code (e.g. TRK3K9XZY2)"
            className="input-dark pl-14 pr-36 py-5 text-base font-mono rounded-2xl"
          />
          <button type="submit" disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2.5 px-5 text-sm">
            {loading ? <div className="spinner w-4 h-4" /> : 'Track'}
          </button>
        </form>

        {/* Result */}
        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Header */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono text-lg font-bold text-brand-400">{order.trackingCode}</div>
                    <div className="text-sm text-gray-400 mt-1">Order #{order.orderNumber}</div>
                  </div>
                  <div className={cn('status-badge', getStatusColor(order.status))}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  {STEPS.filter(s => s !== 'CANCELLED').map((step, i) => {
                    const done = i <= stepIndex;
                    const current = i === stepIndex;
                    return (
                      <div key={step} className="flex items-center gap-4">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all', done ? 'bg-brand-500' : 'bg-dark-700 border border-white/10')}>
                          {done ? <CheckCircle className="w-4 h-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <div className={cn('text-sm font-medium', done ? 'text-white' : 'text-gray-500', current && 'text-brand-400')}>
                            {stepLabels[step]}
                          </div>
                          {current && <div className="text-xs text-brand-300 mt-0.5">Current status</div>}
                        </div>
                        {i < STEPS.length - 2 && <div className={cn('text-xs', done ? 'text-gray-500' : 'text-gray-700')}>↓</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Route */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Delivery Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Pickup</div>
                      <div className="text-sm">{order.pickupAddress}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Delivery</div>
                      <div className="text-sm">{order.deliveryAddress}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rider info */}
              {order.rider && (
                <div className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/20 rounded-2xl flex items-center justify-center">
                    <Bike className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <div className="font-semibold">{order.rider.user.firstName}</div>
                    <div className="text-sm text-gray-400">Your delivery rider</div>
                  </div>
                  {order.status === 'IN_TRANSIT' && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      Live
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-sm text-gray-400">
                Placed: {formatDate(order.createdAt)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">Are you a logistics company?</p>
          <Link href="/register" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1 justify-center">
            Join SwiftRoute <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const ChevronDivider = () => (
  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
