import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, DollarSign } from 'lucide-react';
import { useDatabase } from '../../db/database';
import PayoutDetailsModal from './PayoutDetailsModal';

interface OrderWithItems {
  id: string;
  warehouseId: string;
  items: any[];
  total: number;
  createdAt: string;
  itemStatuses: { [key: string]: string };
}

export default function PayoutsManager() {
  const { executeQuery } = useDatabase();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [expectedPayouts, setExpectedPayouts] = useState<number>(0);
  const [showPayoutsModal, setShowPayoutsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const ordersQuery = searchQuery
        ? `SELECT * FROM orders WHERE id LIKE '%${searchQuery}%' OR warehouseId LIKE '%${searchQuery}%'`
        : 'SELECT * FROM orders';
      
      const ordersResult = await executeQuery(ordersQuery);
      const ordersWithDetails = await Promise.all(
        ordersResult.map(async (order: any) => {
          const items = JSON.parse(order.items);
          let total = 0;
          const itemStatuses: { [key: string]: string } = {};

          for (const item of items) {
            const [product] = await executeQuery(
              'SELECT price FROM products WHERE id = ?',
              [item.productId]
            );
            if (product) {
              total += product.price * item.quantity;
            }

            const [status] = await executeQuery(
              'SELECT status FROM order_items_status WHERE orderId = ? AND productId = ?',
              [order.id, item.productId]
            );
            itemStatuses[item.productId] = status ? status.status : 'unsold';
          }

          return {
            ...order,
            items,
            total,
            itemStatuses
          };
        })
      );

      setOrders(ordersWithDetails);
      calculateExpectedPayouts(ordersWithDetails);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateExpectedPayouts = (ordersList: OrderWithItems[]) => {
    const total = ordersList.reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) => {
        if (order.itemStatuses[item.productId] === 'sold') {
          return itemSum + (item.price * item.quantity);
        }
        return itemSum;
      }, 0);
      return sum + orderTotal;
    }, 0);
    setExpectedPayouts(total);
  };

  useEffect(() => {
    loadOrders();
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-green"
          />
        </div>
        <button
          onClick={() => setShowPayoutsModal(true)}
          className="flex items-center space-x-2 bg-accent-green hover:bg-accent-green/90 text-white px-4 py-2 rounded-lg"
        >
          <DollarSign className="w-4 h-4" />
          <span>Expected Payouts: ${expectedPayouts.toFixed(2)}</span>
        </button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center text-white">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-secondary-400">No orders found</div>
        ) : (
          orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-white">Order #{order.id}</h3>
                  <p className="text-sm text-secondary-400">Warehouse: {order.warehouseId}</p>
                  <p className="text-sm text-secondary-400">
                    Created: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white font-medium">Total: ${order.total.toFixed(2)}</p>
                    <p className="text-sm text-accent-green">
                      Items: {order.items.length}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Eye className="w-4 h-4 text-accent-blue" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <PayoutDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={loadOrders}
      />
    </div>
  );
}