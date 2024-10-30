import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useDatabase } from '../../db/database';

interface PayoutDetailsModalProps {
  order: any;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export default function PayoutDetailsModal({ order, onClose, onStatusUpdate }: PayoutDetailsModalProps) {
  const { executeQuery } = useDatabase();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      if (!order) return;
      
      try {
        setIsLoading(true);
        const productsData = await Promise.all(
          order.items.map(async (item: any) => {
            const [product] = await executeQuery(
              'SELECT * FROM products WHERE id = ?',
              [item.productId]
            );
            const [status] = await executeQuery(
              'SELECT status FROM order_items_status WHERE orderId = ? AND productId = ?',
              [order.id, item.productId]
            );
            return {
              ...product,
              quantity: item.quantity,
              status: status ? status.status : 'unsold'
            };
          })
        );
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [order]);

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      const [existing] = await executeQuery(
        'SELECT id FROM order_items_status WHERE orderId = ? AND productId = ?',
        [order.id, productId]
      );

      if (existing) {
        await executeQuery(
          'UPDATE order_items_status SET status = ?, updatedAt = ? WHERE orderId = ? AND productId = ?',
          [newStatus, new Date().toISOString(), order.id, productId]
        );
      } else {
        await executeQuery(
          'INSERT INTO order_items_status (id, orderId, productId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [
            `status_${Date.now()}`,
            order.id,
            productId,
            newStatus,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );
      }

      const updatedProducts = products.map(product => 
        product.id === productId ? { ...product, status: newStatus } : product
      );
      setProducts(updatedProducts);
      onStatusUpdate();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-secondary-800 rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">
              Order Details #{order.id}
            </h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center text-white py-4">Loading products...</div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-secondary-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-white font-medium">{product.name}</h4>
                    <p className="text-sm text-secondary-400">
                      Quantity: {product.quantity} × ${product.price}
                    </p>
                    <p className="text-sm text-accent-green">
                      Total: ${(product.quantity * product.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={product.status}
                      onChange={(e) => handleStatusChange(product.id, e.target.value)}
                      className="bg-secondary-600 text-white border border-secondary-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-green"
                    >
                      <option value="unsold">Unsold</option>
                      <option value="sold">Sold</option>
                      <option value="returned">Returned</option>
                    </select>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-secondary-700">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-400">Expected Payout:</span>
                  <span className="text-accent-green font-medium">
                    ${products
                      .reduce((sum, product) => {
                        if (product.status === 'sold') {
                          return sum + (product.price * product.quantity);
                        }
                        return sum;
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}