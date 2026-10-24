'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Star, Package, Bike, Shield, LogOut, ChevronRight, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RiderProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [riderData, setRiderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/riders/profile').then(r => setRiderData(r.data)).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    router.push('/login');
  };

  if (loading) return <div className="flex items-center justify-center h-60"><div className="spinner w-8 h-8" /></div>;

  return (
    <div className="space-y-5 pb-4">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow-sm">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        <h2 className="font-display font-bold text-xl">{user?.firstName} {user?.lastName}</h2>
        <div className="text-sm text-gray-400 mt-1">{riderData?.company?.name || 'Delivery Rider'}</div>

        <div className="flex items-center justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-4 h-4 ${s <= Math.round(riderData?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
          ))}
          <span className="text-sm text-gray-400 ml-1">({riderData?.rating?.toFixed(1) || 'No ratings'})</span>
        </div>

        {riderData?.isApproved ? (
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-green-400/10 text-green-400 rounded-full text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Verified Rider
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-yellow-400/10 text-yellow-400 rounded-full text-xs font-semibold">
            Pending Approval
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="font-display font-bold text-xl">{riderData?.totalDeliveries || 0}</div>
          <div className="text-xs text-gray-400 mt-1">Deliveries</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="font-display font-bold text-xl text-brand-400">{formatCurrency(riderData?.walletBalance || 0)}</div>
          <div className="text-xs text-gray-400 mt-1">Wallet</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="font-display font-bold text-xl">{riderData?.rating?.toFixed(1) || '—'}</div>
          <div className="text-xs text-gray-400 mt-1">Rating</div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="glass rounded-2xl overflow-hidden">
        {[
          { icon: Mail, label: 'Email', value: user?.email },
          { icon: Phone, label: 'Phone', value: user?.phone },
          { icon: Bike, label: 'Vehicle', value: riderData?.vehicleType ? riderData.vehicleType.charAt(0).toUpperCase() + riderData.vehicleType.slice(1) : '—' },
          { icon: Shield, label: 'Plate Number', value: riderData?.vehiclePlate || 'Not set' },
          { icon: Package, label: 'Company', value: riderData?.company?.name || '—' },
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 4 ? 'border-b border-white/5' : ''}`}>
            <div className="w-9 h-9 bg-dark-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="text-sm font-medium truncate">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Menu Items */}
      <div className="glass rounded-2xl overflow-hidden">
        {[
          { label: 'Edit Profile', icon: User },
          { label: 'Bank Account', icon: Package },
          { label: 'Change Password', icon: Shield },
        ].map((item, i) => (
          <button key={i} className={`flex items-center justify-between w-full px-5 py-4 hover:bg-white/5 transition-colors ${i < 2 ? 'border-b border-white/5' : ''}`}>
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full glass rounded-2xl p-4 flex items-center gap-3 text-red-400 hover:bg-red-400/5 transition-colors">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>

      <div className="text-center text-xs text-gray-600 pb-2">SwiftRoute v1.0 • Swift Hub Innovative Enterprise</div>
    </div>
  );
}
