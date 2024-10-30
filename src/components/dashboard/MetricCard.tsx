import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function MetricCard({ title, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-secondary-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className="bg-secondary-700 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-accent-green" />
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          <span
            className={`text-sm ${
              trend.isPositive ? 'text-accent-green' : 'text-red-500'
            }`}
          >
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </span>
          <span className="text-secondary-400 text-sm ml-2">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}