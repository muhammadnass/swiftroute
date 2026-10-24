'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, MapPin, Globe, Camera, Save, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CompanySettingsPage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerPw, handleSubmit: handlePwSubmit, reset: resetPw } = useForm();

  useEffect(() => {
    api.get('/companies/profile').then(r => {
      setCompany(r.data);
      reset({
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: user?.phone,
        companyName: r.data.name,
        businessType: r.data.businessType,
        address: r.data.address,
        website: r.data.website,
      });
    });
  }, []);

  const onSave = async (values: any) => {
    setLoading(true);
    try {
      await api.put('/auth/profile', { firstName: values.firstName, lastName: values.lastName, phone: values.phone });
      await api.put('/companies/profile', { name: values.companyName, businessType: values.businessType, address: values.address, website: values.website });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success('Password changed successfully');
      resetPw();
    } catch {
      toast.error('Incorrect current password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and company profile</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-400" /> Company Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-white/5">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              {company?.name?.[0] || '?'}
            </div>
            <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow-sm">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div>
            <div className="font-semibold">{company?.name}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
            <div className={`text-xs mt-1 ${company?.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'}`}>
              {company?.status === 'ACTIVE' ? '✓ Verified Company' : '⏳ Pending Verification'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">First Name</label>
              <input {...register('firstName', { required: true })} className="input-dark" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Last Name</label>
              <input {...register('lastName', { required: true })} className="input-dark" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input {...register('phone')} className="input-dark pl-11" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input {...register('companyName', { required: true })} className="input-dark pl-11" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Business Type</label>
            <input {...register('businessType')} placeholder="e.g. Courier, E-commerce, Restaurant" className="input-dark" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Business Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input {...register('address')} className="input-dark pl-11" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Website (optional)</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input {...register('website')} placeholder="https://yourcompany.com" className="input-dark pl-11" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <div className="spinner w-4 h-4" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-400" /> Change Password
        </h2>
        <form onSubmit={handlePwSubmit(onChangePassword)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Current Password</label>
            <input {...registerPw('currentPassword', { required: true })} type="password" className="input-dark" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">New Password</label>
            <input {...registerPw('newPassword', { required: true, minLength: 8 })} type="password" className="input-dark" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Confirm New Password</label>
            <input {...registerPw('confirmPassword', { required: true })} type="password" className="input-dark" />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-ghost flex items-center gap-2">
            {pwLoading ? <div className="spinner w-4 h-4" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </form>
      </motion.div>
    </div>
  );
}
