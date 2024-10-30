import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash } from 'lucide-react';
import { useDatabase } from '../../db/database';
import { Supplier } from '../../db/schema';
import AddModal from './AddModal';
import EditModal from './EditModal';

export default function SupplierManager() {
  const { executeQuery } = useDatabase();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const query = searchQuery
        ? `SELECT * FROM suppliers WHERE name LIKE '%${searchQuery}%'`
        : 'SELECT * FROM suppliers';
      const data = await executeQuery(query);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setError('Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [searchQuery]);

  const handleAddSupplier = async (data: any) => {
    try {
      const id = `sup_${Date.now()}`;
      const products = JSON.stringify([]);
      await executeQuery(
        'INSERT INTO suppliers (id, name, contact, address, products, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [id, data.name, data.contact, data.address, products, new Date().toISOString()]
      );
      setIsAddModalOpen(false);
      await loadSuppliers();
    } catch (err) {
      console.error('Error adding supplier:', err);
      setError('Failed to add supplier');
    }
  };

  const handleEditSupplier = async (data: any) => {
    try {
      await executeQuery(
        'UPDATE suppliers SET name = ?, contact = ?, address = ? WHERE id = ?',
        [data.name, data.contact, data.address, data.id]
      );
      setEditingSupplier(null);
      await loadSuppliers();
    } catch (err) {
      console.error('Error updating supplier:', err);
      setError('Failed to update supplier');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await executeQuery('DELETE FROM suppliers WHERE id = ?', [id]);
      await loadSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setError('Failed to delete supplier');
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
        Loading suppliers...
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
            placeholder="Search suppliers..."
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
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid gap-4">
        {suppliers.length === 0 ? (
          <div className="text-center text-secondary-400">No suppliers found</div>
        ) : (
          suppliers.map((supplier) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">{supplier.name}</h3>
                  <p className="text-secondary-400 text-sm mt-1">{supplier.contact}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setEditingSupplier(supplier)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-accent-blue" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-secondary-400">{supplier.address}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSupplier}
        title="Add New Supplier"
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
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Address
            </label>
            <textarea
              name="address"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
        </div>
      </AddModal>

      <EditModal
        isOpen={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
        onSubmit={handleEditSupplier}
        title="Edit Supplier"
        initialData={editingSupplier}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={editingSupplier?.name}
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
              defaultValue={editingSupplier?.contact}
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Address
            </label>
            <textarea
              name="address"
              defaultValue={editingSupplier?.address}
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
        </div>
      </EditModal>
    </div>
  );
}