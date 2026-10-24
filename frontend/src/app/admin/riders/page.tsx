'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Bike, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const FILTERS = ['ALL', 'AVAILABLE', 'BUSY', 'OFFLINE'];

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'ALL') params.set('status', status);
    api.get(`/admin/riders?${params}`)
      .then(r => setRiders(r.data))
      .catch(() => toast.error('Failed to load riders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, status]);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      AVAILABLE: 'bg-green-400/10 text-green-400',
      BUSY: 'bg-yellow-400/10 text-yellow-400',
      OFFLINE: 'bg-gray-400/10 text-gray-400',
    };
    return map[s] || 'bg-gray-400/10 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Riders</h1>
        <p className="text-gray-400 text-sm mt-1">{riders.length} total riders on platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search riders by name, phone..." className="input-dark pl-11" />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setStatus(f)} className={cn('px-4 py-2.5 rounded-xl text-sm font-medium transition-all', status === f ? 'bg-brand-500 text-white' : 'glass text-gray-400 hover:text-white')}>
              {f === 'ALL' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-60"><div className="spinner w-8 h-8" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {riders.map((rider, i) => (
            <motion.div key={rider.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-brand-500/20 rounded-2xl flex items-center justify-center font-bold text-brand-400">
                      {rider.user?.firstName?.[0]}{rider.user?.lastName?.[0]}
                    </div>
                    {rider.isApproved && <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-400 bg-dark-800 rounded-full" />}
                  </div>
                  <div>
                    <div className="font-semibold">{rider.user?.firstName} {rider.user?.lastName}</div>
                    <div className="text-xs text-gray-400">{rider.company?.name || 'No company'}</div>
                  </div>
                </div>
                <div className={cn('text-xs font-medium px-2.5 py-1 rounded-full', statusBadge(rider.status))}>
                  {rider.status}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Bike className="w-4 h-4" />
                  <span>{rider.vehicleType ? rider.vehicleType.charAt(0).toUpperCase() + rider.vehicleType.slice(1) : 'Unknown'} • {rider.vehiclePlate || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{rider.rating?.toFixed(1) || '—'} rating • {rider.totalDeliveries || 0} deliveries</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="text-xs text-gray-500">Wallet</div>
                  <div className="font-semibold text-sm">{formatCurrency(rider.walletBalance || 0)}</div>
                </div>
                <div className={cn('text-xs font-semibold px-3 py-1.5 rounded-xl', rider.isApproved ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400')}>
                  {rider.isApproved ? '✓ Approved' : '⏳ Pending'}
                </div>
              </div>
            </motion.div>
          ))}

          {riders.length === 0 && (
            <div className="col-span-full glass rounded-2xl p-14 text-center text-gray-400">
              <Bike className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No riders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
