'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Package, Phone, User, DollarSign, ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Link from 'next/link';

interface FormData {
  pickupAddress: string; pickupLat: string; pickupLng: string;
  pickupContactName: string; pickupContactPhone: string;
  deliveryAddress: string; deliveryLat: string; deliveryLng: string;
  deliveryContactName: string; deliveryContactPhone: string;
  packageDescription: string; packageWeight: string;
  isFragile: boolean; deliveryFee: string; notes: string;
  scheduledAt: string;
  customerFirstName: string; customerLastName: string; customerPhone: string; customerEmail: string;
}

const Section = ({ title, icon: Icon, children }: any) => (
  <div className="glass rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-brand-400/10 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-brand-400" />
      </div>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    pickupAddress: '', pickupLat: '6.5244', pickupLng: '3.3792',
    pickupContactName: '', pickupContactPhone: '',
    deliveryAddress: '', deliveryLat: '6.5355', deliveryLng: '3.3087',
    deliveryContactName: '', deliveryContactPhone: '',
    packageDescription: '', packageWeight: '',
    isFragile: false, deliveryFee: '', notes: '', scheduledAt: '',
    customerFirstName: '', customerLastName: '', customerPhone: '', customerEmail: '',
  });

  const update = (key: keyof FormData, val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        ...form,
        customerId: undefined, // company creates on behalf of customer
      });
      toast.success(`Order ${data.order.orderNumber} created!`);
      router.push('/company/orders');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const InputRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/company/orders" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold">New Order</h1>
          <p className="text-gray-400 mt-1">Create a new delivery order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <Section title="Customer Information" icon={User}>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputRow label="First Name">
              <input required placeholder="John" value={form.customerFirstName} onChange={e => update('customerFirstName', e.target.value)} className="input-dark" />
            </InputRow>
            <InputRow label="Last Name">
              <input required placeholder="Doe" value={form.customerLastName} onChange={e => update('customerLastName', e.target.value)} className="input-dark" />
            </InputRow>
            <InputRow label="Phone Number">
              <input required type="tel" placeholder="080XXXXXXXX" value={form.customerPhone} onChange={e => update('customerPhone', e.target.value)} className="input-dark" />
            </InputRow>
            <InputRow label="Email (optional)">
              <input type="email" placeholder="customer@email.com" value={form.customerEmail} onChange={e => update('customerEmail', e.target.value)} className="input-dark" />
            </InputRow>
          </div>
        </Section>

        {/* Pickup */}
        <Section title="Pickup Details" icon={MapPin}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputRow label="Pickup Address">
                <input required placeholder="15 Allen Avenue, Ikeja, Lagos" value={form.pickupAddress} onChange={e => update('pickupAddress', e.target.value)} className="input-dark" />
              </InputRow>
            </div>
            <InputRow label="Contact Name">
              <input required placeholder="Contact at pickup" value={form.pickupContactName} onChange={e => update('pickupContactName', e.target.value)} className="input-dark" />
            </InputRow>
            <InputRow label="Contact Phone">
              <input required type="tel" placeholder="080XXXXXXXX" value={form.pickupContactPhone} onChange={e => update('pickupContactPhone', e.target.value)} className="input-dark" />
            </InputRow>
            <div className="grid grid-cols-2 gap-4 sm:col-span-2">
              <InputRow label="Latitude (auto-filled with Maps)">
                <input placeholder="6.5244" value={form.pickupLat} onChange={e => update('pickupLat', e.target.value)} className="input-dark" />
              </InputRow>
              <InputRow label="Longitude">
                <input placeholder="3.3792" value={form.pickupLng} onChange={e => update('pickupLng', e.target.value)} className="input-dark" />
              </InputRow>
            </div>
          </div>
        </Section>

        {/* Delivery */}
        <Section title="Delivery Details" icon={MapPin}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputRow label="Delivery Address">
                <input required placeholder="25 Victoria Island, Lagos" value={form.deliveryAddress} onChange={e => update('deliveryAddress', e.target.value)} className="input-dark" />
              </InputRow>
            </div>
            <InputRow label="Recipient Name">
              <input required placeholder="Person receiving package" value={form.deliveryContactName} onChange={e => update('deliveryContactName', e.target.value)} className="input-dark" />
            </InputRow>
            <InputRow label="Recipient Phone">
              <input required type="tel" placeholder="080XXXXXXXX" value={form.deliveryContactPhone} onChange={e => update('deliveryContactPhone', e.target.value)} className="input-dark" />
            </InputRow>
            <div className="grid grid-cols-2 gap-4 sm:col-span-2">
              <InputRow label="Latitude">
                <input placeholder="6.5355" value={form.deliveryLat} onChange={e => update('deliveryLat', e.target.value)} className="input-dark" />
              </InputRow>
              <InputRow label="Longitude">
                <input placeholder="3.3087" value={form.deliveryLng} onChange={e => update('deliveryLng', e.target.value)} className="input-dark" />
              </InputRow>
            </div>
          </div>
        </Section>

        {/* Package */}
        <Section title="Package Details" icon={Package}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputRow label="Package Description">
                <textarea required placeholder="Describe the package contents" value={form.packageDescription} onChange={e => update('packageDescription', e.target.value)} className="input-dark resize-none h-20" />
              </InputRow>
            </div>
            <InputRow label="Weight (kg, optional)">
              <input type="number" step="0.1" placeholder="2.5" value={form.packageWeight} onChange={e => update('packageWeight', e.target.value)} className="input-dark" />
            </InputRow>
            <InputRow label="Schedule Delivery (optional)">
              <input type="datetime-local" value={form.scheduledAt} onChange={e => update('scheduledAt', e.target.value)} className="input-dark" />
            </InputRow>
            <div className="sm:col-span-2 flex items-center gap-3 p-4 glass-orange rounded-xl cursor-pointer" onClick={() => update('isFragile', !form.isFragile)}>
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${form.isFragile ? 'bg-brand-500 border-brand-500' : 'border-white/20'}`}>
                {form.isFragile && <div className="w-3 h-3 bg-white rounded-sm" />}
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-medium">Fragile Package — Handle with care</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing & Notes" icon={DollarSign}>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputRow label="Delivery Fee (₦)">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
                <input required type="number" min="0" placeholder="2500" value={form.deliveryFee} onChange={e => update('deliveryFee', e.target.value)} className="input-dark pl-9" />
              </div>
            </InputRow>
            <InputRow label="Additional Notes (optional)">
              <input placeholder="Any special instructions..." value={form.notes} onChange={e => update('notes', e.target.value)} className="input-dark" />
            </InputRow>
          </div>
        </Section>

        {/* Submit */}
        <div className="flex gap-4">
          <Link href="/company/orders" className="btn-ghost flex-1 text-center py-4">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-4">
            {loading ? <div className="spinner" /> : <><Send className="w-5 h-5" /> Create Order</>}
          </button>
        </div>
      </form>
    </div>
  );
}
