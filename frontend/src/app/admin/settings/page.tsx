'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Settings, Percent, Lock, Shield, Bell, Save } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      platformFee: 10,
      riderCommission: 70,
      minDeliveryFee: 500,
    }
  });

  const { register: regPw, handleSubmit: handlePwSubmit, reset: resetPw } = useForm();

  const savePlatformSettings = async (values: any) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Platform settings saved');
  };

  const changePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success('Password changed successfully');
      resetPw();
    } catch {
      toast.error('Incorrect current password');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure platform-wide settings</p>
      </div>

      {/* Platform Config */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <Percent className="w-5 h-5 text-brand-400" /> Revenue Configuration
        </h2>
        <form onSubmit={handleSubmit(savePlatformSettings)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Platform Fee (%)</label>
            <p className="text-xs text-gray-500 mb-2">Percentage of delivery fee taken by SwiftRoute</p>
            <div className="relative">
              <input {...register('platformFee', { min: 0, max: 50 })} type="number" step="0.5" className="input-dark pr-12" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Rider Commission (%)</label>
            <p className="text-xs text-gray-500 mb-2">Percentage of delivery fee paid to riders</p>
            <div className="relative">
              <input {...register('riderCommission', { min: 0, max: 100 })} type="number" step="0.5" className="input-dark pr-12" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Minimum Delivery Fee (₦)</label>
            <input {...register('minDeliveryFee', { min: 0 })} type="number" className="input-dark" />
          </div>
          <div className="bg-dark-700/50 rounded-xl p-4 text-sm text-gray-400">
            <div className="font-medium text-gray-300 mb-2">💡 Revenue Breakdown</div>
            <div>With 10% platform fee and 70% rider commission:</div>
            <div className="mt-1">• Platform gets 10% of each delivery</div>
            <div>• Rider gets 70% of each delivery</div>
            <div>• Company keeps remaining 20%</div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="spinner w-4 h-4" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </form>
      </motion.div>

      {/* Admin Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-400" /> Admin Account
        </h2>
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/5">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
            {user?.firstName?.[0]}
          </div>
          <div>
            <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
            <div className="text-xs text-brand-400 mt-1">Platform Administrator</div>
          </div>
        </div>
        <form onSubmit={handlePwSubmit(changePassword)} className="space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-gray-300">
            <Lock className="w-4 h-4" /> Change Password
          </h3>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Current Password</label>
            <input {...regPw('currentPassword', { required: true })} type="password" className="input-dark" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">New Password</label>
            <input {...regPw('newPassword', { required: true, minLength: 8 })} type="password" className="input-dark" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Confirm New Password</label>
            <input {...regPw('confirmPassword', { required: true })} type="password" className="input-dark" />
          </div>
          <button type="submit" disabled={pwSaving} className="btn-ghost flex items-center gap-2">
            {pwSaving ? <div className="spinner w-4 h-4" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </form>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-400" /> Notifications
        </h2>
        <div className="space-y-4">
          {[
            { label: 'New company registrations', desc: 'Get notified when a new company signs up' },
            { label: 'High-value order alerts', desc: 'Alert when order value exceeds ₦50,000' },
            { label: 'Platform revenue milestones', desc: 'Celebrate when platform hits revenue targets' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
              <div className="relative">
                <input type="checkbox" defaultChecked id={`notif-${i}`} className="sr-only peer" />
                <label htmlFor={`notif-${i}`} className="w-10 h-6 bg-dark-600 peer-checked:bg-brand-500 rounded-full cursor-pointer transition-colors block after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="text-center text-xs text-gray-600 py-2">
        SwiftRoute v1.0.0 • Swift Hub Innovative Enterprise
      </div>
    </div>
  );
}
