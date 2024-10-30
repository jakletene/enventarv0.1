import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Filter } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const mockData = [
  { name: 'Jan', sales: 4000, orders: 2400 },
  { name: 'Feb', sales: 3000, orders: 1398 },
  { name: 'Mar', sales: 2000, orders: 9800 },
  { name: 'Apr', sales: 2780, orders: 3908 },
  { name: 'May', sales: 1890, orders: 4800 },
  { name: 'Jun', sales: 2390, orders: 3800 },
];

export default function ReportPage() {
  const [dateRange, setDateRange] = useState('Last 6 Months');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
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
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary-800 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-6">Sales Overview</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="sales" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-secondary-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary-600 rounded-lg"></div>
                  <div>
                    <h4 className="text-white font-medium">Product {i}</h4>
                    <p className="text-secondary-400 text-sm">
                      {100 - i * 10} units sold
                    </p>
                  </div>
                </div>
                <p className="text-white font-medium">${(299.99 - i * 50).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-secondary-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activities
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 bg-secondary-700 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                <div>
                  <p className="text-white">New order received</p>
                  <p className="text-secondary-400 text-sm">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}