'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, DollarSign, User, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/shared/ThemeToggle';

const navItems = [
  { label: 'Home', href: '/rider', icon: LayoutDashboard },
  { label: 'Orders', href: '/rider/orders', icon: Package },
  { label: 'Earnings', href: '/rider/earnings', icon: DollarSign },
  { label: 'Profile', href: '/rider/profile', icon: User },
];

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'RIDER') {
      router.push(user.role === 'ADMIN' ? '/admin' : '/company');
    }
  }, [user, router]);

  if (!user || user.role !== 'RIDER') return null;

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto relative"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Top header */}
      <header
        className="glass border-b sticky top-0 z-30"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between px-5 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Swift<span className="text-brand-400">Route</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Hi, <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.firstName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 glass border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all duration-200',
                  isActive ? 'text-brand-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                <div className={cn('p-2 rounded-xl transition-all', isActive && 'bg-brand-500/15')}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={cn('text-xs font-medium', isActive && 'text-brand-400')}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
