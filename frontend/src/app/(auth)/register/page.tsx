'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, Building2, Bike, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || '';
  const { login } = useAuthStore();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'COMPANY' | 'RIDER' | ''>(defaultRole as any);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    // Company fields
    companyName: '', state: '', city: '', address: '', description: '',
    // Rider fields
    vehicleType: '', companyCode: '',
  });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    try {
      await api.post('/auth/register', {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone, password: form.password, role,
      });
      await login(form.email, form.password);
      toast.success('Account created! Welcome to SwiftRoute!');
      if (role === 'COMPANY') router.push('/company');
      else router.push('/rider');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-brand-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl">Swift<span className="text-brand-400">Route</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-gray-400">Join thousands using SwiftRoute across Nigeria</p>
        </div>

        <div className="glass rounded-3xl p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Choose Role */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display font-semibold text-xl mb-6">I want to join as...</h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { value: 'COMPANY', label: 'Logistics Company', sub: 'Manage riders & orders', icon: Building2 },
                    { value: 'RIDER', label: 'Delivery Rider', sub: 'Accept & deliver orders', icon: Bike },
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value as 'COMPANY' | 'RIDER')}
                      className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                        role === r.value
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-white/10 bg-white/2 hover:border-white/20'
                      }`}
                    >
                      <r.icon className={`w-8 h-8 mb-3 ${role === r.value ? 'text-brand-400' : 'text-gray-400'}`} />
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{r.sub}</div>
                      {role === r.value && <CheckCircle className="w-4 h-4 text-brand-400 mt-2" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => role && setStep(2)}
                  disabled={!role}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-display font-semibold text-xl mb-6">Personal Information</h2>
                <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                      <input required placeholder="Emeka" value={form.firstName} onChange={e => update('firstName', e.target.value)} className="input-dark" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                      <input required placeholder="Okafor" value={form.lastName} onChange={e => update('lastName', e.target.value)} className="input-dark" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input type="email" required placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} className="input-dark" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <input type="tel" required placeholder="080XXXXXXXX" value={form.phone} onChange={e => update('phone', e.target.value)} className="input-dark" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} required minLength={8} placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} className="input-dark pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Role-specific details & Submit */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-display font-semibold text-xl mb-6">
                  {role === 'COMPANY' ? 'Company Details' : 'Rider Details'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {role === 'COMPANY' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                        <input placeholder="SwiftMove Lagos" value={form.companyName} onChange={e => update('companyName', e.target.value)} className="input-dark" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                        <select value={form.state} onChange={e => update('state', e.target.value)} className="input-dark">
                          <option value="">Select your state</option>
                          {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">City / LGA</label>
                        <input placeholder="Ikeja" value={form.city} onChange={e => update('city', e.target.value)} className="input-dark" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Business Address</label>
                        <input placeholder="15 Allen Avenue, Ikeja" value={form.address} onChange={e => update('address', e.target.value)} className="input-dark" />
                      </div>
                    </>
                  )}
                  {role === 'RIDER' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Type</label>
                        <select value={form.vehicleType} onChange={e => update('vehicleType', e.target.value)} className="input-dark">
                          <option value="">Select vehicle type</option>
                          <option value="motorcycle">Motorcycle (Okada)</option>
                          <option value="bicycle">Bicycle</option>
                          <option value="car">Car</option>
                          <option value="van">Van / Truck</option>
                        </select>
                      </div>
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-sm text-blue-300">
                          Your logistics company will add you to their team. You'll need their invitation or company code to complete setup after registration.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-4">By registering, you agree to our Terms of Service and Privacy Policy.</p>
                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                      {loading ? <div className="spinner" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-brand-500' : s < step ? 'w-4 bg-brand-500/50' : 'w-4 bg-white/10'}`} />
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
