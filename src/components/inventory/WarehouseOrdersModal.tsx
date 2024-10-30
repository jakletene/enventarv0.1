import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useDatabase } from '../../db/database';
import { Order, OrderStatus } from '../../pages/OrderPage';
import { Warehouse } from '../../db/schema';

interface WarehouseOrdersModalProps {
  warehouse: Warehouse | null;
  onClose: () => void;
}

export default function WarehouseOrdersModal({ warehouse, onClose }: WarehouseOrdersModalProps) {
  const { executeQuery } = useDatabase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!warehouse) return;

      try {
        setIsLoading(true);
        const result = await executeQuery(
          'SELECT * FROM orders WHERE warehouseId = ? ORDER BY createdAt DESC',
          [warehouse.id]
        );
        setOrders(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error loading warehouse orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [warehouse]);

  if (!warehouse) return null;

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-accent-yellow" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-accent-blue" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-accent-green" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <AnimatePresence>
      {warehouse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-secondary-800 rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">
                Orders for {warehouse.name}
              </h3>
              <button
                onClick={onClose}
                className="text-secondary-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="text-center text-white py-4">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center text-secondary-400 py-4">
                No orders found for this warehouse
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-secondary-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className="text-white font-medium capitalize">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-secondary-400 mt-1">
                          Order ID: {order.id}
                        </p>
                        <p className="text-sm text-secondary-400">
                          From: {order.origin}
                        </p>
                        <p className="text-sm text-secondary-400">
                          Sender: {order.sender}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">
                          Send Date: {new Date(order.sendDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-secondary-400 mt-1">
                          Created: {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-secondary-600">
                      <div className="grid grid-cols-2 gap-4">
                        {JSON.parse(order.items).map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 bg-secondary-600/50 rounded p-2"
                          >
                            <div className="flex-1">
                              <p className="text-sm text-white">
                                Product ID: {item.productId}
                              </p>
                              <p className="text-xs text-secondary-400">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}