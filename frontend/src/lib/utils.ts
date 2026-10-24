import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    ACCEPTED: 'text-blue-400 bg-blue-400/10',
    PICKED_UP: 'text-purple-400 bg-purple-400/10',
    IN_TRANSIT: 'text-orange-400 bg-orange-400/10',
    DELIVERED: 'text-green-400 bg-green-400/10',
    CANCELLED: 'text-red-400 bg-red-400/10',
    FAILED: 'text-red-500 bg-red-500/10',
    ACTIVE: 'text-green-400 bg-green-400/10',
    SUSPENDED: 'text-red-400 bg-red-400/10',
    PENDING_APPROVAL: 'text-yellow-400 bg-yellow-400/10',
    AVAILABLE: 'text-green-400 bg-green-400/10',
    BUSY: 'text-orange-400 bg-orange-400/10',
    OFFLINE: 'text-gray-400 bg-gray-400/10',
  };
  return map[status] || 'text-gray-400 bg-gray-400/10';
}

export function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    PICKED_UP: 'Picked Up',
    IN_TRANSIT: 'In Transit',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    FAILED: 'Failed',
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    PENDING_APPROVAL: 'Pending Approval',
    AVAILABLE: 'Available',
    BUSY: 'Busy',
    OFFLINE: 'Offline',
  };
  return map[status] || status;
}
