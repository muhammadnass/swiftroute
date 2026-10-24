'use client';
import { motion } from 'framer-motion';
import { MapPin, Package, User, Clock } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryFee: number;
  createdAt: string;
  customer?: { firstName: string; lastName: string };
  rider?: { user: { firstName: string; lastName: string } };
  company?: { name: string };
}

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  showRider?: boolean;
  showCustomer?: boolean;
  delay?: number;
}

export default function OrderCard({ order, onClick, showRider, showCustomer, delay = 0 }: OrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="order-card"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-mono text-sm font-semibold text-brand-400">{order.orderNumber}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
          </div>
        </div>
        <div className={cn('status-badge', getStatusColor(order.status))}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {getStatusLabel(order.status)}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 bg-green-400/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>
          <span className="text-sm text-gray-300 line-clamp-1">{order.pickupAddress}</span>
        </div>
        <div className="ml-2.5 border-l border-dashed border-white/10 h-3" />
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 bg-brand-400/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-3 h-3 text-brand-400" />
          </div>
          <span className="text-sm text-gray-300 line-clamp-1">{order.deliveryAddress}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-3">
          {showCustomer && order.customer && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <User className="w-3 h-3" />
              {order.customer.firstName} {order.customer.lastName}
            </div>
          )}
          {showRider && order.rider && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Package className="w-3 h-3 text-brand-400" />
              {order.rider.user.firstName} {order.rider.user.lastName}
            </div>
          )}
          {showRider && !order.rider && (
            <div className="text-xs text-yellow-400/70">No rider assigned</div>
          )}
        </div>
        <div className="font-semibold text-sm text-brand-400">{formatCurrency(order.deliveryFee)}</div>
      </div>
    </motion.div>
  );
}
