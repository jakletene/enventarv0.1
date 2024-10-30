import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash, MapPin, Phone, Truck } from 'lucide-react';
import { useDatabase } from '../../db/database';
import { Warehouse } from '../../db/schema';
import AddModal from './AddModal';
import EditModal from './EditModal';

const SHIPPING_METHODS = [
  { id: 'DHL', label: 'DHL', buttonClass: 'bg-yellow-400 text-red-600 hover:bg-yellow-500' },
  { id: 'UPS', label: 'UPS', buttonClass: 'bg-amber-800 text-yellow-400 hover:bg-amber-900' },
  { id: 'FEDEX', label: 'FedEx', buttonClass: 'bg-purple-600 text-white hover:bg-purple-700' }
];

export default function WarehouseManager() {
  const { executeQuery } = useDatabase();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [editingMethods, setEditingMethods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWarehouses = async () => {
    try {
      setIsLoading(true);
      const query = searchQuery
        ? `SELECT * FROM warehouses WHERE name LIKE '%${searchQuery}%'`
        : 'SELECT * FROM warehouses';
      const data = await executeQuery(query);
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading warehouses:', err);
      setError('Failed to load warehouses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, [searchQuery]);

  const handleAddWarehouse = async (data: any) => {
    try {
      const id = `wh_${Date.now()}`;
      await executeQuery(
        'INSERT INTO warehouses (id, name, location, contact, shippingMethods, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [id, data.name, data.location, data.contact, JSON.stringify(selectedMethods), new Date().toISOString()]
      );
      setIsAddModalOpen(false);
      setSelectedMethods([]);
      await loadWarehouses();
    } catch (err) {
      console.error('Error adding warehouse:', err);
      setError('Failed to add warehouse');
    }
  };

  const handleEditWarehouse = async (data: any) => {
    try {
      await executeQuery(
        'UPDATE warehouses SET name = ?, location = ?, contact = ?, shippingMethods = ? WHERE id = ?',
        [data.name, data.location, data.contact, JSON.stringify(editingMethods), data.id]
      );
      setEditingWarehouse(null);
      setEditingMethods([]);
      await loadWarehouses();
    } catch (err) {
      console.error('Error updating warehouse:', err);
      setError('Failed to update warehouse');
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    try {
      await executeQuery('DELETE FROM warehouses WHERE id = ?', [id]);
      await loadWarehouses();
    } catch (err) {
      console.error('Error deleting warehouse:', err);
      setError('Failed to delete warehouse');
    }
  };

  const handleStartEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setEditingMethods(JSON.parse(warehouse.shippingMethods));
  };

  const toggleShippingMethod = (method: string, isEditing: boolean) => {
    if (isEditing) {
      setEditingMethods(prev => 
        prev.includes(method) 
          ? prev.filter(m => m !== method)
          : [...prev, method]
      );
    } else {
      setSelectedMethods(prev => 
        prev.includes(method) 
          ? prev.filter(m => m !== method)
          : [...prev, method]
      );
    }
  };

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-white text-center p-4">
        Loading warehouses...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search warehouses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-green"
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-accent-green hover:bg-accent-green/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warehouse</span>
        </button>
      </div>

      <div className="grid gap-4">
        {warehouses.length === 0 ? (
          <div className="text-center text-secondary-400">No warehouses found</div>
        ) : (
          warehouses.map((warehouse) => (
            <motion.div
              key={warehouse.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">{warehouse.name}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2 text-secondary-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{warehouse.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-secondary-400">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{warehouse.contact}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleStartEdit(warehouse)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-accent-blue" />
                  </button>
                  <button
                    onClick={() => handleDeleteWarehouse(warehouse.id)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-secondary-400" />
                <div className="flex gap-2">
                  {JSON.parse(warehouse.shippingMethods).map((method: string) => {
                    const shippingMethod = SHIPPING_METHODS.find(m => m.id === method);
                    return (
                      <span
                        key={method}
                        className={`px-2 py-1 rounded text-xs ${shippingMethod?.buttonClass}`}
                      >
                        {method}
                      </span>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedMethods([]);
        }}
        onSubmit={handleAddWarehouse}
        title="Add New Warehouse"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Contact
            </label>
            <input
              type="text"
              name="contact"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-2">
              Shipping Methods
            </label>
            <div className="flex gap-2">
              {SHIPPING_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => toggleShippingMethod(method.id, false)}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedMethods.includes(method.id)
                      ? method.buttonClass
                      : 'bg-secondary-600 text-secondary-400'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AddModal>

      <EditModal
        isOpen={!!editingWarehouse}
        onClose={() => {
          setEditingWarehouse(null);
          setEditingMethods([]);
        }}
        onSubmit={handleEditWarehouse}
        title="Edit Warehouse"
        initialData={editingWarehouse}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={editingWarehouse?.name}
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              defaultValue={editingWarehouse?.location}
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Contact
            </label>
            <input
              type="text"
              name="contact"
              defaultValue={editingWarehouse?.contact}
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-2">
              Shipping Methods
            </label>
            <div className="flex gap-2">
              {SHIPPING_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => toggleShippingMethod(method.id, true)}
                  className={`px-3 py-1 rounded text-sm ${
                    editingMethods.includes(method.id)
                      ? method.buttonClass
                      : 'bg-secondary-600 text-secondary-400'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </EditModal>
    </div>
  );
}