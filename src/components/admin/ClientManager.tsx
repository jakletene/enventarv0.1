import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash, MapPin, Phone } from 'lucide-react';
import { useDatabase } from '../../db/database';
import { Client } from '../../db/schema';
import AddModal from './AddModal';
import EditModal from './EditModal';

export default function ClientManager() {
  const { executeQuery } = useDatabase();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const query = searchQuery
        ? `SELECT * FROM clients WHERE name LIKE '%${searchQuery}%'`
        : 'SELECT * FROM clients';
      const data = await executeQuery(query);
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [searchQuery]);

  const handleAddClient = async (data: any) => {
    try {
      const id = `client_${Date.now()}`;
      await executeQuery(
        'INSERT INTO clients (id, name, email, phone, address, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [id, data.name, data.email, data.phone, data.address, new Date().toISOString()]
      );
      setIsAddModalOpen(false);
      await loadClients();
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to add client');
    }
  };

  const handleEditClient = async (data: any) => {
    try {
      await executeQuery(
        'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
        [data.name, data.email, data.phone, data.address, data.id]
      );
      setEditingClient(null);
      await loadClients();
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Failed to update client');
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await executeQuery('DELETE FROM clients WHERE id = ?', [id]);
      await loadClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client');
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
        Loading clients...
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
            placeholder="Search clients..."
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
          <span>Add Client</span>
        </button>
      </div>

      <div className="grid gap-4">
        {clients.length === 0 ? (
          <div className="text-center text-secondary-400">No clients found</div>
        ) : (
          clients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">{client.name}</h3>
                  <p className="text-secondary-400 text-sm mt-1">{client.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setEditingClient(client)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-accent-blue" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-secondary-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-secondary-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{client.address}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddClient}
        title="Add New Client"
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
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
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
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSubmit={handleEditClient}
        title="Edit Client"
        initialData={editingClient}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={editingClient?.name}
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={editingClient?.email}
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={editingClient?.phone}
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
              defaultValue={editingClient?.address}
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
        </div>
      </EditModal>
    </div>
  );
}