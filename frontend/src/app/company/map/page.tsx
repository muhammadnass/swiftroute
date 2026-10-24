'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Bike, MapPin, Package } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const MapView = dynamic(() => import('@/components/shared/MapView'), { ssr: false });

export default function CompanyMapPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(() => {
    Promise.all([
      api.get('/companies/riders'),
      api.get('/orders?status=IN_TRANSIT'),
    ]).then(([ridersRes, ordersRes]) => {
      setRiders(ridersRes.data);
      setOrders(ordersRes.data);
      setLastRefresh(new Date());
    }).catch(() => toast.error('Failed to load map data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [load]);

  const mapMarkers = [
    ...riders.filter(r => r.currentLat && r.currentLng).map(r => ({
      lat: r.currentLat,
      lng: r.currentLng,
      title: `${r.user.firstName} ${r.user.lastName}`,
      type: 'rider' as const,
      data: r,
    })),
    ...orders.filter(o => o.pickupLat).map(o => ({
      lat: o.pickupLat,
      lng: o.pickupLng,
      title: `Pickup: ${o.pickupAddress}`,
      type: 'pickup' as const,
    })),
    ...orders.filter(o => o.deliveryLat).map(o => ({
      lat: o.deliveryLat,
      lng: o.deliveryLng,
      title: `Delivery: ${o.deliveryAddress}`,
      type: 'delivery' as const,
    })),
  ];

  const onlineRiders = riders.filter(r => r.status !== 'OFFLINE');
  const activeOrders = orders.length;

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Live Map</h1>
          <p className="text-gray-400 text-sm mt-1">Last updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="w-8 h-8 bg-green-400/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Bike className="w-4 h-4 text-green-400" />
          </div>
          <div className="font-bold text-xl">{onlineRiders.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">Online Riders</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="w-8 h-8 bg-brand-400/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Package className="w-4 h-4 text-brand-400" />
          </div>
          <div className="font-bold text-xl">{activeOrders}</div>
          <div className="text-xs text-gray-400 mt-0.5">Active Deliveries</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="w-8 h-8 bg-gray-400/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Bike className="w-4 h-4 text-gray-400" />
          </div>
          <div className="font-bold text-xl">{riders.length - onlineRiders.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">Offline</div>
        </div>
      </div>

      {/* Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: '520px' }}>
        <div className="lg:col-span-2">
          <MapView
            markers={mapMarkers}
            className="h-full"
            onMarkerClick={(m: any) => {
              if (m.data) setSelectedRider(m.data);
            }}
          />
        </div>

        {/* Rider List */}
        <div className="glass rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold">Your Riders</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {riders.map(rider => (
              <button
                key={rider.id}
                onClick={() => setSelectedRider(selectedRider?.id === rider.id ? null : rider)}
                className={cn('w-full text-left p-3 rounded-xl transition-all hover:bg-white/5', selectedRider?.id === rider.id && 'bg-white/10 border border-brand-500/30')}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 bg-brand-500/20 rounded-xl flex items-center justify-center text-sm font-bold text-brand-400">
                      {rider.user.firstName[0]}
                    </div>
                    <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-800', rider.status === 'OFFLINE' ? 'bg-gray-500' : rider.status === 'BUSY' ? 'bg-yellow-400' : 'bg-green-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{rider.user.firstName} {rider.user.lastName}</div>
                    <div className="text-xs text-gray-500 truncate">{rider.vehicleType} • {rider.vehiclePlate}</div>
                  </div>
                  <div className={cn('text-xs px-2 py-1 rounded-full flex-shrink-0', rider.status === 'OFFLINE' ? 'bg-gray-500/10 text-gray-400' : rider.status === 'BUSY' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-green-400/10 text-green-400')}>
                    {rider.status}
                  </div>
                </div>
                {selectedRider?.id === rider.id && rider.currentLat && (
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location tracked
                  </div>
                )}
              </button>
            ))}

            {riders.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-10">
                No riders added yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-sm text-gray-400">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-500" /><span>Rider</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-400" /><span>Pickup</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /><span>Delivery</span></div>
      </div>
    </div>
  );
}
