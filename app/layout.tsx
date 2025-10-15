import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Anand Rathi Tinkerers\' Lab - IITJ Tinkerers\' Lab',
  description: 'Innovation hub and maker space at IIT Jodhpur',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        {/* <footer className="w-full text-center py-4 text-xs text-muted-foreground">
          © 2025 Anand Rathi Tinkerers' Lab. Made by <a href="http://nafeesansari.vercel.app" target='_blank'>Nafees</a> and <a href="https://linkedin.com/in/harish-babu-balaji-188453269" target="_blank">Harish</a>, IITJ.
        </footer> */}
      </body>
    </html>
  );
}