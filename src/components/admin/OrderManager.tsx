import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Package, Truck, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useDatabase } from '../../db/database';
import { Order, OrderStatus } from '../../pages/OrderPage';

export default function OrderManager() {
  const { executeQuery } = useDatabase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      let query = 'SELECT * FROM orders';
      const conditions = [];
      
      if (searchQuery) {
        conditions.push(`(sender LIKE '%${searchQuery}%' OR origin LIKE '%${searchQuery}%')`);
      }
      
      if (selectedStatus !== 'all') {
        conditions.push(`status = '${selectedStatus}'`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY createdAt DESC';
      
      const result = await executeQuery(query);
      setOrders(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [searchQuery, selectedStatus]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await executeQuery(
        'UPDATE orders SET status = ? WHERE id = ?',
        [newStatus, orderId]
      );
      await loadOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

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

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-green"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
          className="bg-secondary-700 text-white border border-secondary-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-green"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="denied">Denied</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center text-white">Loading orders...</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className="text-white font-medium capitalize">{order.status}</span>
                  </div>
                  <p className="text-sm text-secondary-400 mt-1">Order ID: {order.id}</p>
                  <p className="text-sm text-secondary-400">From: {order.origin}</p>
                  <p className="text-sm text-secondary-400">Sender: {order.sender}</p>
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
                <div className="flex items-center space-x-4">
                  <span className="text-secondary-400">Update Status:</span>
                  <div className="flex space-x-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(order.id, 'processing')}
                          className="px-3 py-1 bg-accent-yellow hover:bg-accent-yellow/90 text-white rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'denied')}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                        >
                          Deny
                        </button>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'shipped')}
                        className="px-3 py-1 bg-accent-blue hover:bg-accent-blue/90 text-white rounded"
                      >
                        Mark as Shipped
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                        className="px-3 py-1 bg-accent-green hover:bg-accent-green/90 text-white rounded"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}