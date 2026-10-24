'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Users, BarChart3, Settings, PlusCircle, Map, CreditCard } from 'lucide-react';
import Sidebar from '@/components/shared/Sidebar';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { label: 'Dashboard', href: '/company', icon: LayoutDashboard },
  { label: 'Orders', href: '/company/orders', icon: Package },
  { label: 'New Order', href: '/company/orders/new', icon: PlusCircle },
  { label: 'My Riders', href: '/company/riders', icon: Users },
  { label: 'Live Map', href: '/company/map', icon: Map },
  { label: 'Earnings', href: '/company/earnings', icon: BarChart3 },
  { label: 'Subscription', href: '/company/subscription', icon: CreditCard },
  { label: 'Settings', href: '/company/settings', icon: Settings },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'COMPANY') {
      router.push(user.role === 'ADMIN' ? '/admin' : '/rider');
    }
  }, [user, router]);

  if (!user || user.role !== 'COMPANY') return null;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Sidebar navItems={navItems} title="Logistics Company" subtitle="Operations" />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
