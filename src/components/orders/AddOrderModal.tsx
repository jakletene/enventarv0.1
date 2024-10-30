import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { useDatabase } from '../../db/database';
import { Product, Warehouse } from '../../db/schema';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

export default function AddOrderModal({ isOpen, onClose, onSubmit }: AddOrderModalProps) {
  const { executeQuery } = useDatabase();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([{ productId: '', quantity: 1 }]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const warehouseResult = await executeQuery('SELECT * FROM warehouses');
        const productResult = await executeQuery('SELECT * FROM products');
        setWarehouses(Array.isArray(warehouseResult) ? warehouseResult : []);
        setProducts(Array.isArray(productResult) ? productResult : []);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      warehouseId: formData.get('warehouseId'),
      origin: formData.get('origin'),
      sender: formData.get('sender'),
      sendDate: formData.get('sendDate'),
      items: selectedItems.filter(item => item.productId && item.quantity > 0)
    };
    onSubmit(data);
  };

  const addItem = () => {
    setSelectedItems([...selectedItems, { productId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
  };

  if (!isOpen) return null;

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
            <h3 className="text-lg font-semibold text-white">Create New Order</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center text-white py-4">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-400 mb-1">
                    Warehouse
                  </label>
                  <select
                    name="warehouseId"
                    required
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-400 mb-1">
                    Send Date
                  </label>
                  <input
                    type="date"
                    name="sendDate"
                    required
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-400 mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    name="origin"
                    required
                    placeholder="Enter origin location"
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-400 mb-1">
                    Sender
                  </label>
                  <input
                    type="text"
                    name="sender"
                    required
                    placeholder="Enter sender name"
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-secondary-400">
                    Order Items
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-accent-green hover:text-accent-green/90 text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        required
                        className="flex-1 bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (${product.price})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        min="1"
                        required
                        className="w-24 bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                      />

                      {selectedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 hover:bg-secondary-700 rounded-lg text-red-500"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-secondary-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-green hover:bg-accent-green/90 text-white rounded-lg"
                >
                  Create Order
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}