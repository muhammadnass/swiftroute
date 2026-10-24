'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/shared/ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarProps {
  navItems: NavItem[];
  title: string;
  subtitle?: string;
}

export default function Sidebar({ navItems, title, subtitle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Swift<span className="text-brand-400">Route</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 mx-3 mt-4 glass-orange rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-brand-500 dark:text-brand-300 truncate">{title}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {subtitle && (
          <div
            className="text-xs font-semibold uppercase tracking-widest px-4 mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            {subtitle}
          </div>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn('nav-item', isActive && 'active')}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions: theme toggle + logout */}
      <div className="p-4 border-t space-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <ThemeToggle variant="sidebar" />
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/5"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 fixed top-0 left-0 h-full z-30 border-r"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Swift<span className="text-brand-400">Route</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'var(--text-secondary)' }}
            className="p-2 hover:opacity-80 transition-opacity"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-30 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30 }}
              className="lg:hidden fixed top-0 left-0 h-full w-72 z-40 border-r"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
