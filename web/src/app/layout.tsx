import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ResQGraph AI — Emergency Intelligence & Response Platform',
  description: 'Production emergency intelligence, evidence fusion, and response coordination platform.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/logo-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-64.png', sizes: '64x64', type: 'image/png' },
      //{url: '/logo-1024.png', sizes: '1024x1024', type: 'image/png'}
    ],
    apple: [
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`light ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased flex flex-col font-sans selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
