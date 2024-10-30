import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, Filter, Calendar } from 'lucide-react';

export default function SalesPage() {
  const [dateRange, setDateRange] = useState('This Month');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Sales Overview</h1>
        <div className="flex items-center space-x-4">
          <button className="bg-secondary-800 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{dateRange}</span>
          </button>
          <button className="bg-secondary-800 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="bg-accent-green hover:bg-accent-green/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary-800 p-6 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">$24,567.89</h3>
            </div>
            <div className="bg-secondary-700 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-accent-green" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-accent-green text-sm">+12.5%</span>
            <span className="text-secondary-400 text-sm ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary-800 p-6 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400">Orders</p>
              <h3 className="text-2xl font-bold text-white mt-1">1,234</h3>
            </div>
            <div className="bg-secondary-700 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-accent-blue" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-accent-blue text-sm">+8.2%</span>
            <span className="text-secondary-400 text-sm ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-secondary-800 p-6 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400">Average Order Value</p>
              <h3 className="text-2xl font-bold text-white mt-1">$89.32</h3>
            </div>
            <div className="bg-secondary-700 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-accent-yellow" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-accent-yellow text-sm">+5.3%</span>
            <span className="text-secondary-400 text-sm ml-2">vs last month</span>
          </div>
        </motion.div>
      </div>

      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Sales</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-secondary-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary-600 rounded-lg"></div>
                <div>
                  <h4 className="text-white font-medium">Order #{1000 + i}</h4>
                  <p className="text-secondary-400 text-sm">2 hours ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">$299.99</p>
                <p className="text-accent-green text-sm">Completed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}