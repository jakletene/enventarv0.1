import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Package, Truck, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useDatabase } from '../db/database';
import AddOrderModal from '../components/orders/AddOrderModal';
import OrderTable from '../components/orders/OrderTable';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'denied';

export interface Order {
  id: string;
  warehouseId: string;
  origin: string;
  sender: string;
  items: string;
  status: OrderStatus;
  sendDate: string;
  createdAt: string;
}

export default function OrderPage() {
  const { executeQuery } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const query = searchQuery
        ? `SELECT * FROM orders WHERE origin LIKE '%${searchQuery}%' OR sender LIKE '%${searchQuery}%' ORDER BY createdAt DESC`
        : 'SELECT * FROM orders ORDER BY createdAt DESC';
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
  }, [searchQuery]);

  const handleAddOrder = async (data: any) => {
    try {
      const id = `ord_${Date.now()}`;
      await executeQuery(
        `INSERT INTO orders (
          id, warehouseId, origin, sender, items, status, sendDate, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.warehouseId,
          data.origin,
          data.sender,
          JSON.stringify(data.items),
          'pending',
          data.sendDate,
          new Date().toISOString()
        ]
      );
      setIsAddModalOpen(false);
      await loadOrders();
    } catch (err) {
      console.error('Error adding order:', err);
      setError('Failed to add order');
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Order Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-accent-green hover:bg-accent-green/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-green"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-white py-4">Loading orders...</div>
      ) : (
        <OrderTable
          orders={orders}
          getStatusIcon={getStatusIcon}
          onOrderUpdate={loadOrders}
        />
      )}

      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddOrder}
      />
    </div>
  );
}