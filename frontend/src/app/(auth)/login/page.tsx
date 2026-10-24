'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Lock, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      const user = useAuthStore.getState().user;
      toast.success(`Welcome back, ${user?.firstName}!`);
      if (user?.role === 'ADMIN') router.push('/admin');
      else if (user?.role === 'COMPANY') router.push('/company');
      else if (user?.role === 'RIDER') router.push('/rider');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl">Swift<span className="text-brand-400">Route</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your SwiftRoute account</p>
        </div>

        {/* Form */}
        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-dark pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-dark pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-dark-700 rounded-xl">
            <div className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Demo Credentials</div>
            <div className="space-y-2 text-xs">
              {[
                { role: 'Admin', email: 'admin@swiftroute.ng', pass: 'Admin@12345' },
                { role: 'Company', email: 'lagos@swiftdemo.ng', pass: 'Company@12345' },
              ].map((cred, i) => (
                <button
                  key={i}
                  onClick={() => setForm({ email: cred.email, password: cred.pass })}
                  className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-brand-400 font-medium">{cred.role}</span>
                  <span className="text-gray-500">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
