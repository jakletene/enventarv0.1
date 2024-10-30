import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Order, OrderStatus } from '../../pages/OrderPage';
import { useDatabase } from '../../db/database';

interface EditOrderModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditOrderModal({ order, onClose, onUpdate }: EditOrderModalProps) {
  const { executeQuery } = useDatabase();
  const [status, setStatus] = useState<OrderStatus>(order?.status || 'processing');
  const [isLoading, setIsLoading] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await executeQuery(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, order.id]
      );
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-secondary-800 rounded-lg p-6 w-full max-w-md m-4"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Update Order Status</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-400 mb-2">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
              >
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-secondary-400 hover:text-white"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent-green hover:bg-accent-green/90 text-white rounded-lg disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}