import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { AppClientLayout } from '@/components/layout/AppClientLayout';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'سفیر‌حساب | مدیریت هوشمند مالی و استهلاک اسنپ',
  description: 'حسابدار آفلاین کارکرد، استهلاک خودرو، سود واقعی و برنامه پس‌انداز هدف ۴۰۰ میلیونی سفیران اسنپ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'سفیر‌حساب',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`dark ${vazirmatn.variable}`}>
      <body className={`${vazirmatn.className} bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-emerald-500 selection:text-zinc-950 min-h-screen`}>
        <AppClientLayout>{children}</AppClientLayout>
      </body>
    </html>
  );
}
