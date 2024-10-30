import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../db/schema';
import { useDatabase } from '../../db/database';

export default function BestSellers() {
  const { executeQuery } = useDatabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const result = await executeQuery('SELECT * FROM products ORDER BY stockLevel DESC LIMIT 5');
        setProducts(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error loading best sellers:', err);
        setError('Failed to load best sellers');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [executeQuery]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary-800 rounded-lg p-6"
      >
        <div className="text-center text-red-500">{error}</div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary-800 rounded-lg p-6"
      >
        <div className="text-center text-white">Loading best sellers...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Best Selling Products</h3>
        <button className="text-accent-green text-sm hover:underline">
          View More →
        </button>
      </div>
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center text-secondary-400">No products found</div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center space-x-4 bg-secondary-700 p-4 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="text-white font-medium">{product.name}</h4>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-secondary-400">
                    {product.variants} variants
                  </span>
                  <span className="mx-2 text-secondary-400">•</span>
                  <span className="text-sm text-secondary-400">
                    {product.stockLevel} in stock
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${product.price.toFixed(2)}</p>
                <p className="text-sm text-accent-green">+{product.stockLevel} units</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}