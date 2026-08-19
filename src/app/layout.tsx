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
  title: 'مدیریت مالی و استهلاک خودرو سفیر اسنپ',
  description: 'سامانه آفلاین مدیریت درآمد واقعی، محاسبه استهلاک خودرو و برنامه پس‌انداز هدف رانندگان اسنپ',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
