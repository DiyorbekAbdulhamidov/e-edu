import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'e-edu - O\'quv Markazlari uchun CRM',
  description: 'Professional CRM tizimi o\'quv markazlari uchun',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
