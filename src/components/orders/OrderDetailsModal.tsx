import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Order } from '../../pages/OrderPage';
import { useDatabase } from '../../db/database';
import { Product, Warehouse } from '../../db/schema';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const { executeQuery } = useDatabase();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      if (!order) return;

      try {
        setIsLoading(true);
        
        // Load warehouse details
        const warehouseResult = await executeQuery(
          'SELECT * FROM warehouses WHERE id = ?',
          [order.warehouseId]
        );
        setWarehouse(warehouseResult[0] || null);

        // Load order items with product details
        const items = JSON.parse(order.items);
        const itemDetails: OrderItem[] = [];

        for (const item of items) {
          const productResult = await executeQuery(
            'SELECT * FROM products WHERE id = ?',
            [item.productId]
          );
          if (productResult[0]) {
            itemDetails.push({
              product: productResult[0],
              quantity: item.quantity
            });
          }
        }

        setOrderItems(itemDetails);
      } catch (err) {
        console.error('Error loading order details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [order]);

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
            <h3 className="text-lg font-semibold text-white">Order Details</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center text-white py-4">Loading details...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-secondary-400 mb-2">Order Information</h4>
                  <div className="space-y-2">
                    <p className="text-white">
                      <span className="text-secondary-400">ID:</span> {order.id}
                    </p>
                    <p className="text-white">
                      <span className="text-secondary-400">Status:</span> {order.status}
                    </p>
                    <p className="text-white">
                      <span className="text-secondary-400">Send Date:</span>{' '}
                      {new Date(order.sendDate).toLocaleDateString()}
                    </p>
                    <p className="text-white">
                      <span className="text-secondary-400">Created:</span>{' '}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-secondary-400 mb-2">Warehouse Information</h4>
                  {warehouse && (
                    <div className="space-y-2">
                      <p className="text-white">
                        <span className="text-secondary-400">Name:</span> {warehouse.name}
                      </p>
                      <p className="text-white">
                        <span className="text-secondary-400">Location:</span> {warehouse.location}
                      </p>
                      <p className="text-white">
                        <span className="text-secondary-400">Contact:</span> {warehouse.contact}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-secondary-400 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-secondary-700 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <h5 className="text-white font-medium">{item.product.name}</h5>
                        <p className="text-sm text-secondary-400">
                          Category: {item.product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white">${item.product.price.toFixed(2)} × {item.quantity}</p>
                        <p className="text-accent-green font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-secondary-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-400">Total Items:</span>
                  <span className="text-white font-medium">
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-secondary-400">Total Amount:</span>
                  <span className="text-accent-green font-medium">
                    ${orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
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