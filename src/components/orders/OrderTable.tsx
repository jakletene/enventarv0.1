import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Eye, Package, Truck, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '../../pages/OrderPage';
import { useDatabase } from '../../db/database';
import { useAuth } from '../../contexts/AuthContext';
import OrderDetailsModal from './OrderDetailsModal';
import EditOrderModal from './EditOrderModal';

interface OrderTableProps {
  orders: Order[];
  getStatusIcon: (status: OrderStatus) => JSX.Element;
  onOrderUpdate: () => void;
}

export default function OrderTable({ orders, getStatusIcon, onOrderUpdate }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const { executeQuery } = useDatabase();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<{ [key: string]: any }>({});

  const loadOrderDetails = async (order: Order) => {
    try {
      const items = JSON.parse(order.items);
      const details: { [key: string]: any } = {};
      
      for (const item of items) {
        const [product] = await executeQuery(
          'SELECT * FROM products WHERE id = ?',
          [item.productId]
        );
        if (product) {
          details[item.productId] = {
            ...product,
            quantity: item.quantity,
            total: product.price * item.quantity
          };
        }
      }
      
      setOrderDetails(prev => ({ ...prev, [order.id]: details }));
    } catch (err) {
      console.error('Error loading order details:', err);
    }
  };

  useState(() => {
    orders.forEach(order => loadOrderDetails(order));
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="bg-secondary-800 rounded-lg p-6 text-center text-secondary-400">
        No orders found
      </div>
    );
  }

  return (
    <>
      <div className="bg-secondary-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-secondary-400">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-secondary-400">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-secondary-400">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-secondary-400">
                  Send Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-secondary-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-secondary-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const details = orderDetails[order.id] || {};
                const items = Object.values(details);
                const total = items.reduce((sum: number, item: any) => sum + item.total, 0);

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-secondary-700 hover:bg-secondary-700/50"
                  >
                    <td className="px-6 py-4 text-sm text-white">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col space-y-2">
                        {items.map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-secondary-700 rounded overflow-hidden">
                              {JSON.parse(item.images || '[]')[0] && (
                                <img
                                  src={JSON.parse(item.images)[0]}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-white">{item.name}</p>
                              <p className="text-secondary-400 text-xs">
                                Qty: {item.quantity} × ${item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      ${total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {new Date(order.sendDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="text-white capitalize">{order.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1 hover:bg-secondary-600 rounded-lg"
                        >
                          <Eye className="w-4 h-4 text-accent-blue" />
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="p-1 hover:bg-secondary-600 rounded-lg"
                          >
                            <Edit className="w-4 h-4 text-accent-green" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {user?.role === 'admin' && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onUpdate={onOrderUpdate}
        />
      )}
    </>
  );
}