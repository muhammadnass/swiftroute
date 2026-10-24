'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const NIGERIAN_STATES = ['All States','Lagos','Abuja','Kano','Rivers','Oyo','Kaduna','Ogun','Delta','Anambra','Enugu'];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [state, setState] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (state && state !== 'All States') params.set('state', state);
    api.get(`/admin/companies?${params}`).then(r => setCompanies(r.data.companies)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, status, state]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/admin/companies/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Companies</h1>
        <p className="text-gray-400 mt-1">Manage all logistics companies on the platform</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-11" />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input-dark w-full sm:w-48">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_APPROVAL">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <select value={state} onChange={e => setState(e.target.value)} className="input-dark w-full sm:w-48">
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="spinner w-8 h-8" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Company', 'Owner', 'Location', 'Riders', 'Orders', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm">{c.owner?.firstName} {c.owner?.lastName}</div>
                      <div className="text-xs text-gray-500">{c.owner?.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm">{c.state}</div>
                      <div className="text-xs text-gray-500">{c.city}</div>
                    </td>
                    <td className="px-5 py-4 text-center font-semibold">{c._count?.riders || 0}</td>
                    <td className="px-5 py-4 text-center font-semibold">{c._count?.orders || 0}</td>
                    <td className="px-5 py-4">
                      <div className={cn('status-badge', getStatusColor(c.status))}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {getStatusLabel(c.status)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {c.status !== 'ACTIVE' && (
                          <button onClick={() => updateStatus(c.id, 'ACTIVE')} className="p-2 rounded-lg bg-green-400/10 hover:bg-green-400/20 text-green-400 transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {c.status !== 'SUSPENDED' && (
                          <button onClick={() => updateStatus(c.id, 'SUSPENDED')} className="p-2 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 transition-colors" title="Suspend">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {c.status !== 'PENDING_APPROVAL' && (
                          <button onClick={() => updateStatus(c.id, 'PENDING_APPROVAL')} className="p-2 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 transition-colors" title="Set Pending">
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {!loading && companies.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">No companies found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
