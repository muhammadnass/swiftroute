import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'SwiftRoute — Nigeria\'s Smart Logistics Platform',
  description: 'Empowering logistics companies across Nigeria with fast, reliable delivery management. Connect your riders, manage orders, and grow your business with SwiftRoute.',
  keywords: 'logistics, delivery, Nigeria, riders, tracking, swift',
  authors: [{ name: 'Swift Hub Innovative Enterprise' }],
  openGraph: {
    title: 'SwiftRoute — Nigeria\'s Smart Logistics Platform',
    description: 'The complete platform for logistics companies and riders across Nigeria.',
    type: 'website',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#f97316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'sr-toast',
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
