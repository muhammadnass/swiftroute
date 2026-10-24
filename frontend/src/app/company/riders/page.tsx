'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Star, Package, CheckCircle, XCircle, Search, Bike } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CompanyRidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [addForm, setAddForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', vehicleType: 'motorcycle', vehiclePlate: '', nin: '',
  });

  const load = () => {
    api.get('/companies/riders').then(r => setRiders(r.data)).catch(() => toast.error('Failed to load riders')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAddRider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/companies/riders', addForm);
      toast.success(`Rider added! Temp password: ${data.tempPassword || 'sent to email'}`);
      setShowAdd(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add rider');
    }
  };

  const toggleApproval = async (riderId: string, current: boolean) => {
    try {
      await api.put(`/companies/riders/${riderId}/approve`, { isApproved: !current });
      toast.success(!current ? 'Rider approved!' : 'Rider suspended');
      load();
    } catch { toast.error('Update failed'); }
  };

  const filtered = riders.filter(r =>
    `${r.user?.firstName} ${r.user?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My Riders</h1>
          <p className="text-gray-400 mt-1">{riders.length} riders in your company</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-5 h-5" /> Add Rider
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input placeholder="Search riders..." value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-11" />
      </div>

      {/* Riders Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner w-8 h-8" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((rider, i) => (
            <motion.div key={rider.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                      {rider.user?.firstName?.[0]}{rider.user?.lastName?.[0]}
                    </div>
                    <div className={cn('absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-800', {
                      'bg-green-400': rider.status === 'AVAILABLE',
                      'bg-orange-400': rider.status === 'BUSY',
                      'bg-gray-400': rider.status === 'OFFLINE',
                    })} />
                  </div>
                  <div>
                    <div className="font-semibold">{rider.user?.firstName} {rider.user?.lastName}</div>
                    <div className="text-xs text-gray-400">{rider.user?.phone}</div>
                  </div>
                </div>
                <div className={cn('status-badge text-xs', getStatusColor(rider.status))}>
                  {getStatusLabel(rider.status)}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center glass rounded-xl p-3">
                  <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                  <div className="font-bold text-sm">{rider.rating?.toFixed(1) || '—'}</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
                <div className="text-center glass rounded-xl p-3">
                  <Package className="w-4 h-4 text-brand-400 mx-auto mb-1" />
                  <div className="font-bold text-sm">{rider.totalDeliveries || 0}</div>
                  <div className="text-xs text-gray-500">Deliveries</div>
                </div>
                <div className="text-center glass rounded-xl p-3">
                  <Bike className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="font-bold text-sm capitalize">{rider.vehicleType || '—'}</div>
                  <div className="text-xs text-gray-500">Vehicle</div>
                </div>
              </div>

              {rider.vehiclePlate && (
                <div className="text-center mb-4">
                  <span className="font-mono text-sm bg-dark-700 px-3 py-1 rounded-lg">{rider.vehiclePlate}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className={cn('flex items-center gap-1.5 text-xs font-medium', rider.isApproved ? 'text-green-400' : 'text-yellow-400')}>
                  {rider.isApproved ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {rider.isApproved ? 'Approved' : 'Pending'}
                </div>
                <button
                  onClick={() => toggleApproval(rider.id, rider.isApproved)}
                  className={cn('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors', rider.isApproved ? 'bg-red-400/10 hover:bg-red-400/20 text-red-400' : 'bg-green-400/10 hover:bg-green-400/20 text-green-400')}
                >
                  {rider.isApproved ? 'Suspend' : 'Approve'}
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-3 glass rounded-2xl p-12 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No riders found</p>
              <p className="text-sm mt-1">Add your first rider to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Add Rider Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-800 rounded-3xl p-8 w-full max-w-md border border-white/10">
            <h3 className="font-display font-bold text-2xl mb-6">Add Rider</h3>
            <form onSubmit={handleAddRider} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input required placeholder="Emeka" value={addForm.firstName} onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input required placeholder="Okafor" value={addForm.lastName} onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))} className="input-dark" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input required type="email" placeholder="rider@email.com" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input required type="tel" placeholder="080XXXXXXXX" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Type</label>
                <select value={addForm.vehicleType} onChange={e => setAddForm(f => ({ ...f, vehicleType: e.target.value }))} className="input-dark">
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plate Number</label>
                  <input placeholder="LG 234 ABC" value={addForm.vehiclePlate} onChange={e => setAddForm(f => ({ ...f, vehiclePlate: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">NIN (optional)</label>
                  <input placeholder="12345678901" value={addForm.nin} onChange={e => setAddForm(f => ({ ...f, nin: e.target.value }))} className="input-dark" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Rider</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
