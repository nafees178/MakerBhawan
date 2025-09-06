import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maker Bhawan - IITJ Tinkerer Lab',
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
        <footer className="w-full text-center py-4 text-xs text-muted-foreground">
          © 2025 Maker Bhawan. Made by Nafees and Harish, IITJ.
        </footer>
      </body>
    </html>
  );
}