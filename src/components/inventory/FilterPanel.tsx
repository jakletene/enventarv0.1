import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function FilterPanel() {
  const [category, setCategory] = useState('all');
  const [stockLevel, setStockLevel] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary-800 p-6 rounded-lg space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <button className="text-secondary-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-400">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="furniture">Furniture</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-400">
            Stock Level
          </label>
          <select
            value={stockLevel}
            onChange={(e) => setStockLevel(e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
          >
            <option value="all">All Levels</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock</option>
            <option value="medium">Medium Stock</option>
            <option value="high">High Stock</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-400">
            Price Range
          </label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
          >
            <option value="all">All Prices</option>
            <option value="0-50">$0 - $50</option>
            <option value="51-100">$51 - $100</option>
            <option value="101-200">$101 - $200</option>
            <option value="201+">$201+</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 text-secondary-400 hover:text-white">
          Reset
        </button>
        <button className="px-4 py-2 bg-accent-green hover:bg-accent-green/90 text-white rounded-lg">
          Apply Filters
        </button>
      </div>
    </motion.div>
  );
}