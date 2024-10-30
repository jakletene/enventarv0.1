import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Truck, AlertCircle } from 'lucide-react';
import { useDatabase } from '../db/database';
import { Product } from '../db/schema';
import StockLevelChart from '../components/dashboard/StockLevelChart';
import MetricCard from '../components/dashboard/MetricCard';
import BestSellers from '../components/dashboard/BestSellers';

export default function DashboardPage() {
  const { executeQuery } = useDatabase();
  const [stockLevels, setStockLevels] = useState([
    { name: 'High Stock', value: 0, color: '#22c55e' },
    { name: 'Near-Low Stock', value: 0, color: '#fbbf24' },
    { name: 'Low Stock', value: 0, color: '#3b82f6' },
    { name: 'Out of Stock', value: 0, color: '#ef4444' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStockLevels = async () => {
      try {
        setIsLoading(true);
        const result = await executeQuery('SELECT stockLevel FROM products');
        const products = Array.isArray(result) ? result : [];
        
        const levels = {
          high: 0,
          nearLow: 0,
          low: 0,
          out: 0,
        };

        products.forEach((product: any) => {
          const stock = product.stockLevel;
          if (stock === 0) levels.out++;
          else if (stock < 10) levels.low++;
          else if (stock < 50) levels.nearLow++;
          else levels.high++;
        });

        setStockLevels([
          { name: 'High Stock', value: levels.high, color: '#22c55e' },
          { name: 'Near-Low Stock', value: levels.nearLow, color: '#fbbf24' },
          { name: 'Low Stock', value: levels.low, color: '#3b82f6' },
          { name: 'Out of Stock', value: levels.out, color: '#ef4444' },
        ]);
      } catch (err) {
        console.error('Error loading stock levels:', err);
        setError('Failed to load stock levels');
      } finally {
        setIsLoading(false);
      }
    };

    loadStockLevels();
  }, [executeQuery]);

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Total Products"
          value="10,226"
          icon={Package}
          trend={{ value: 10.5, isPositive: true }}
        />
        <MetricCard
          title="Total Quantity"
          value="2,000,508"
          icon={TrendingUp}
          trend={{ value: 10.5, isPositive: true }}
        />
        <MetricCard
          title="To Be Received"
          value="5,680"
          icon={Truck}
          trend={{ value: 10.5, isPositive: true }}
        />
        <MetricCard
          title="To Be Packed"
          value="878"
          icon={AlertCircle}
          trend={{ value: 8.2, isPositive: false }}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!isLoading && <StockLevelChart data={stockLevels} />}
        <BestSellers />
      </div>
    </div>
  );
}