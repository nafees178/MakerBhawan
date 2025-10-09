'use client';

import { useState, useEffect } from 'react';
import { IInventory } from '@/models/inventory_model';
import DockNavigation from '@/components/DockNavigation';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<(IInventory & { createdAt: string })[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<(IInventory & { createdAt: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('/api/inventory');
        const inventoryData = await response.json();
        // Filter out hidden items
        const visibleItems = Array.isArray(inventoryData) 
          ? inventoryData.filter((item: IInventory) => !item.hidden)
          : [];
        setInventory(visibleItems);
        setFilteredInventory(visibleItems);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setInventory([]);
        setFilteredInventory([]);
      }
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  return (
    <main className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-grid opacity-30"></div>
      
      <div className="relative container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            Inventory
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Track and manage all available tools, equipment, and resources
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Inventory List */}
        <div className="max-w-7xl mx-auto">
          {filteredInventory.length > 0 ? (
            <div className="space-y-4">
              {filteredInventory.map((item: IInventory & { createdAt: string }, index: number) => (
                <div 
                  key={index}
                  className="group relative sleek-card rounded-2xl p-6 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.01] project-card"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-6">
                    {/* Item Icon */}
                    <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                        {item.name}
                      </h3>
                    </div>
                    
                    {/* Quantity */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">Quantity:</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {item.num_items}
                      </span>
                    </div>
                    
                    {/* Creation Date */}
                    {item.createdAt && (
                      <div className="flex items-center text-xs text-gray-400">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-4">
                {searchTerm ? 'No Items Found' : 'No Items Available'}
              </h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                {searchTerm 
                  ? `No items match "${searchTerm}". Try a different search term.`
                  : "Our inventory is currently being updated. Check back soon to see available tools and equipment!"
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      <DockNavigation />
    </main>
  );
}
