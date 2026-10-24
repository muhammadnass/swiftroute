'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Package, BarChart3, Settings, Map } from 'lucide-react';
import Sidebar from '@/components/shared/Sidebar';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Companies', href: '/admin/companies', icon: Building2 },
  { label: 'Riders', href: '/admin/riders', icon: Users },
  { label: 'All Orders', href: '/admin/orders', icon: Package },
  { label: 'Revenue', href: '/admin/earnings', icon: BarChart3 },
  { label: 'Live Map', href: '/admin/map', icon: Map },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') {
      router.push(user.role === 'COMPANY' ? '/company' : '/rider');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Sidebar navItems={navItems} title="Super Admin" />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
