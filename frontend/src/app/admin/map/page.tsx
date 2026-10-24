'use client';
import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Bike, Package, Building2, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const MapView = dynamic(() => import('@/components/shared/MapView'), { ssr: false });

export default function AdminMapPage() {
  const [data, setData] = useState<any>({ riders: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [filterState, setFilterState] = useState('ALL');
  const [states, setStates] = useState<any[]>([]);

  const load = useCallback(() => {
    Promise.all([
      api.get('/admin/riders'),
      api.get('/admin/orders?status=IN_TRANSIT'),
      api.get('/admin/states'),
    ]).then(([r, o, s]) => {
      setData({ riders: r.data, orders: o.data });
      setStates(s.data);
      setLastRefresh(new Date());
    }).catch(() => toast.error('Failed to load map data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const filteredRiders = filterState === 'ALL' ? data.riders : data.riders.filter((r: any) => r.company?.state?.name === filterState);
  const filteredOrders = filterState === 'ALL' ? data.orders : data.orders.filter((o: any) => o.company?.state?.name === filterState);

  const mapMarkers = [
    ...filteredRiders.filter((r: any) => r.currentLat && r.currentLng).map((r: any) => ({
      lat: r.currentLat,
      lng: r.currentLng,
      title: `${r.user?.firstName} - ${r.company?.name}`,
      type: 'rider' as const,
    })),
    ...filteredOrders.filter((o: any) => o.deliveryLat).map((o: any) => ({
      lat: o.deliveryLat,
      lng: o.deliveryLng,
      title: `${o.orderNumber} - In Transit`,
      type: 'delivery' as const,
    })),
  ];

  const onlineRiders = data.riders.filter((r: any) => r.status !== 'OFFLINE').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Live Platform Map</h1>
          <p className="text-gray-400 text-sm mt-1">Last updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Bike, label: 'Online Riders', value: onlineRiders, color: 'text-green-400 bg-green-400/10' },
          { icon: Package, label: 'Active Deliveries', value: data.orders.length, color: 'text-brand-400 bg-brand-400/10' },
          { icon: Building2, label: 'Companies', value: new Set(data.riders.map((r: any) => r.companyId)).size, color: 'text-blue-400 bg-blue-400/10' },
          { icon: Globe, label: 'States Active', value: states.length, color: 'text-purple-400 bg-purple-400/10' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-2xl p-4">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="font-display font-bold text-2xl">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* State filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button onClick={() => setFilterState('ALL')} className={cn('px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0', filterState === 'ALL' ? 'bg-brand-500 text-white' : 'glass text-gray-400')}>
          All States
        </button>
        {states.slice(0, 8).map((s: any) => (
          <button key={s.id} onClick={() => setFilterState(s.name)} className={cn('px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0', filterState === s.name ? 'bg-brand-500 text-white' : 'glass text-gray-400')}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Map */}
      <MapView markers={mapMarkers} className="h-[540px]" />

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-500" /><span>Active Rider</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /><span>Delivery Point</span></div>
      </div>
    </div>
  );
}
