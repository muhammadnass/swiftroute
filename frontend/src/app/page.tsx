'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package, Bike, MapPin, BarChart3, Shield, Zap, Users, ArrowRight,
  Star, CheckCircle, Globe, Phone, Mail, ChevronRight, TrendingUp, CreditCard
} from 'lucide-react';

const fadeIn = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl">Swift<span className="text-brand-400">Route</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial="hidden" animate="show" variants={stagger} className="text-center max-w-4xl mx-auto">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 glass-orange px-4 py-2 rounded-full mb-6">
              <Globe className="w-4 h-4 text-brand-400" />
              <span className="text-sm text-brand-300 font-medium">Nationwide Logistics Platform — 37 States</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Power Your{' '}
              <span className="gradient-text">Logistics</span>{' '}
              Business
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              SwiftRoute gives logistics companies across Nigeria the tools to manage riders, track orders in real-time, and build a thriving delivery business — all in one platform.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary flex items-center justify-center gap-2 text-base py-4 px-8">
                Start Your Company <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/register?role=RIDER" className="btn-ghost flex items-center justify-center gap-2 text-base py-4 px-8">
                <Bike className="w-5 h-5 text-brand-400" />
                Join as a Rider
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {[
                { value: '37', label: 'States Covered' },
                { value: '∞', label: 'Deliveries' },
                { value: '100%', label: 'Real-time Tracking' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-3xl font-bold text-brand-400">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Dashboard Visual */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-card">
              <div className="bg-dark-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm text-gray-400">Today&apos;s Overview</div>
                    <div className="font-display font-bold text-xl">SwiftMove Lagos</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Active Orders', value: '24', color: 'text-orange-400', bg: 'bg-orange-400/10' },
                    { label: 'Riders Online', value: '8', color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: "Today's Revenue", value: '₦84,500', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Deliveries', value: '37', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                  ].map((item, i) => (
                    <div key={i} className={`${item.bg} rounded-xl p-4`}>
                      <div className={`font-display font-bold text-2xl ${item.color}`}>{item.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {['Order #SR12345678 • Picked up • Rider: Emeka', 'Order #SR12345679 • In Transit • Rider: Chidi', 'Order #SR12345680 • Pending • Assign Rider'].map((o, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <span className="text-sm text-gray-300">{o}</span>
                      <div className={`status-badge ${i === 0 ? 'text-purple-400 bg-purple-400/10' : i === 1 ? 'text-orange-400 bg-orange-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                        {i === 0 ? '● Picked Up' : i === 1 ? '● In Transit' : '● Pending'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="text-brand-400 font-semibold mb-3 uppercase tracking-widest text-sm">Platform Features</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Everything you need to <span className="gradient-text">scale</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Built specifically for Nigerian logistics businesses — from Lagos to Kano, Abuja to Port Harcourt.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: 'Live GPS Tracking', desc: 'Track every rider and order in real-time on an interactive Google Maps view. Customers get a live link to follow their delivery.', color: 'text-red-400', bg: 'bg-red-400/10' },
              { icon: Bike, title: 'Rider Management', desc: 'Onboard, approve, and manage your riders from a clean dashboard. Set availability, track performance, and manage earnings automatically.', color: 'text-brand-400', bg: 'bg-brand-400/10' },
              { icon: Package, title: 'Smart Order Flow', desc: 'Create orders with pickup and delivery details, assign to riders instantly, and let the system handle status updates and notifications.', color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { icon: BarChart3, title: 'Revenue Analytics', desc: 'See your earnings, platform fees, and rider commissions broken down by day, week, or month. Make smarter decisions with real data.', color: 'text-green-400', bg: 'bg-green-400/10' },
              { icon: TrendingUp, title: 'Revenue Projection', desc: 'Forecast your revenue for the next 30, 60, and 90 days based on historical order volume. A subscriber-only tool that helps you plan ahead.', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { icon: Users, title: 'Multi-Role Platform', desc: 'Admin, Company, and Rider dashboards — each with precisely the tools and information they need to do their job.', color: 'text-purple-400', bg: 'bg-purple-400/10' },
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-6 hover:border-brand-500/30 transition-all duration-300 group">
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">How <span className="gradient-text">SwiftRoute</span> works</h2>
            <p className="text-gray-400 text-lg">Up and running in minutes</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register Your Company', desc: 'Sign up and submit your logistics business details. Get approved by our admin team within 24 hours.', icon: Shield },
              { step: '02', title: 'Subscribe & Add Riders', desc: 'Activate your monthly subscription to unlock all platform features. Then invite your existing riders to join.', icon: CreditCard },
              { step: '03', title: 'Start Taking Orders', desc: 'Create delivery orders, assign riders, and track everything live. Earnings are calculated automatically.', icon: Package },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative">
                <div className="glass rounded-2xl p-8 text-center h-full">
                  <div className="font-display text-7xl font-bold text-brand-500/20 mb-4">{step.step}</div>
                  <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <step.icon className="w-8 h-8 text-brand-400" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-brand-500/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="text-brand-400 font-semibold mb-3 uppercase tracking-widest text-sm">Simple Pricing</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Keep more of your <span className="gradient-text">profit</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              One flat monthly subscription. No hidden fees. You keep more revenue as you scale — and we grow together.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="glass rounded-3xl p-8 border border-brand-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-500/5 rounded-full" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 text-xs font-bold px-3 py-1 rounded-full mb-6">
                    ⭐ BUSINESS PLAN
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="font-display text-5xl font-bold text-white">₦30,000</span>
                    <span className="text-gray-400 mb-2">/month</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-8">≈ $18 USD · Billed monthly via Paystack. Cancel anytime.</p>
                  <div className="space-y-4 mb-8">
                    {[
                      { text: 'Unlimited orders & riders', highlight: false },
                      { text: 'Live GPS order tracking', highlight: false },
                      { text: 'Revenue analytics dashboard', highlight: false },
                      { text: 'Revenue projection tool (30/60/90 days)', highlight: true },
                      { text: 'Only 8% platform fee per delivery', highlight: true },
                      { text: 'Automated rider earnings & wallet', highlight: false },
                      { text: 'Priority support via email & phone', highlight: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 ${item.highlight ? 'text-brand-400' : 'text-green-400'}`} />
                        <span className={`text-sm ${item.highlight ? 'text-white font-medium' : 'text-gray-300'}`}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/register" className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                    <CreditCard className="w-5 h-5" />
                    Start Free — Subscribe After Approval
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg mb-5">Why the new model saves you money</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Old model (10% per delivery)</span>
                      <span className="text-sm font-semibold text-red-400">More expensive</span>
                    </div>
                    <div className="bg-red-400/10 rounded-xl p-4 text-sm">
                      <div className="font-mono text-red-300">
                        100 orders × ₦5,000 avg → <span className="font-bold">₦50,000 to platform</span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">You keep: ₦100,000 (after riders)</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">New model (₦30k sub + 8% per delivery)</span>
                      <span className="text-sm font-semibold text-green-400">You save ₦6,000+/mo</span>
                    </div>
                    <div className="bg-green-400/10 rounded-xl p-4 text-sm">
                      <div className="font-mono text-green-300">
                        ₦30,000 sub + 100 × 8% = <span className="font-bold">₦70,000 total</span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">You keep: ₦110,000 — 10% more in your pocket</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg mb-4">Everything included</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: BarChart3, label: 'Revenue Projection', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                    { icon: MapPin, label: 'Live Tracking', color: 'text-red-400', bg: 'bg-red-400/10' },
                    { icon: Users, label: 'Rider Management', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { icon: Shield, label: 'Priority Support', color: 'text-green-400', bg: 'bg-green-400/10' },
                  ].map((item, i) => (
                    <div key={i} className={`${item.bg} rounded-xl p-4 flex flex-col items-center text-center`}>
                      <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
                      <span className="text-xs font-medium text-gray-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-orange rounded-2xl p-5 text-sm">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-white mb-1">Secure payments via Paystack</div>
                    <div className="text-gray-400">Monthly subscriptions are processed automatically through Paystack — Nigeria&apos;s most trusted payment gateway. Cards, bank transfer, or USSD.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Riders */}
      <section id="riders" className="py-24 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="text-brand-400 font-semibold mb-3 uppercase tracking-widest text-sm">For Riders</div>
              <h2 className="font-display text-4xl font-bold mb-6">Earn more with every <span className="gradient-text">delivery</span></h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Already a delivery rider? Your company has joined SwiftRoute and invited you. Log in, go online, and start earning — it&apos;s that simple.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'See incoming orders instantly on your phone',
                  'Real-time navigation powered by Google Maps',
                  'Track your daily and weekly earnings',
                  'Get paid directly into your wallet',
                  'Build your delivery reputation with ratings',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register?role=RIDER" className="btn-primary inline-flex items-center gap-2">
                <Bike className="w-5 h-5" />
                Join as a Rider
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="mx-auto w-72 relative">
                <div className="bg-dark-800 rounded-[2.5rem] p-6 border-2 border-white/10 shadow-card">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-xs text-gray-400">9:41 AM</div>
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-green-400 rounded" />
                      <div className="w-1 h-3 bg-green-400 rounded" />
                      <div className="w-1 h-3 bg-green-400/40 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold">EM</div>
                    <div>
                      <div className="font-semibold">Emeka Okafor</div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4 mb-4">
                    <div className="text-xs text-brand-300 mb-1">Today&apos;s Earnings</div>
                    <div className="font-display font-bold text-2xl text-brand-400">₦12,450</div>
                    <div className="text-xs text-gray-400 mt-1">8 deliveries completed</div>
                  </div>
                  <div className="glass rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-brand-400">ACTIVE ORDER</span>
                      <div className="status-badge text-orange-400 bg-orange-400/10">● In Transit</div>
                    </div>
                    <div className="text-sm font-medium mb-2">SR87654321</div>
                    <div className="flex items-start gap-2 text-xs text-gray-400">
                      <MapPin className="w-3 h-3 text-brand-400 mt-0.5 flex-shrink-0" />
                      <span>15 Allen Avenue, Ikeja</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-dark-700 rounded-xl p-3 text-center">
                      <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                      <div className="font-bold text-sm">4.9</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                    <div className="bg-dark-700 rounded-xl p-3 text-center">
                      <Package className="w-4 h-4 text-brand-400 mx-auto mb-1" />
                      <div className="font-bold text-sm">243</div>
                      <div className="text-xs text-gray-500">Deliveries</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-brand-500/5 rounded-[3rem] blur-xl -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">transform</span> your logistics?
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Join logistics companies across Nigeria who are growing faster with SwiftRoute. Register today and get approved within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary flex items-center justify-center gap-2 text-lg py-4 px-10">
                Register Your Company <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/track" className="btn-ghost flex items-center justify-center gap-2 text-lg py-4 px-10">
                <Package className="w-5 h-5" />
                Track a Package
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl">Swift<span className="text-brand-400">Route</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nigeria&apos;s most trusted logistics management platform. By Swift Hub Innovative Enterprise.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-4">Platform</div>
              <div className="space-y-3 text-sm text-gray-400">
                <div><Link href="/register" className="hover:text-white transition-colors">For Companies</Link></div>
                <div><Link href="/register?role=RIDER" className="hover:text-white transition-colors">For Riders</Link></div>
                <div><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></div>
                <div><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-4">Company</div>
              <div className="space-y-3 text-sm text-gray-400">
                <div><a href="#" className="hover:text-white transition-colors">About Us</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Terms of Service</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Support</a></div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-4">Contact</div>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-400" />
                  <a href="mailto:sunusinasir@gmail.com" className="hover:text-white transition-colors">sunusinasir@gmail.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-400" />
                  <a href="tel:+2349132726410" className="hover:text-white transition-colors">09132726410</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  <span>Kano, Nigeria</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <span>© 2026 SwiftRoute by Swift Hub Innovative Enterprise. All rights reserved.</span>
            <span>Built with ❤️ in Nigeria 🇳🇬</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
