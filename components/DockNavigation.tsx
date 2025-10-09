"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, Wrench, FolderOpen, Calendar, Users, Camera, Mail } from 'lucide-react';

const navItems = [
  { id: '/', icon: Home, label: 'Home' },
  { id: '/people', icon: Users, label: 'People' },
  { id: '/events', icon: Calendar, label: 'Events' },
  { id: '/projects', icon: FolderOpen, label: 'Projects' },
  { id: '/inventory', icon: Wrench, label: 'Inventory' },
];

export default function DockNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToPage = (path: string) => {
    router.push(path);
  };

  return (
    <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50">
      <div className="dock rounded-2xl px-4 py-3">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigateToPage(item.id)}
                className={`dock-item p-3 rounded-xl transition-all duration-400 group relative ${
                  pathname === item.id 
                    ? 'active bg-blue-600/20 text-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-gray-700">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}