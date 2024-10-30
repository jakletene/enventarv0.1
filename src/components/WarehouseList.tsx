import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Warehouse, MapPin, Phone, Truck, Package } from 'lucide-react';
import { useDatabase } from '../db/database';
import WarehouseOrdersModal from './inventory/WarehouseOrdersModal';

export default function WarehouseList() {
  const { executeQuery } = useDatabase();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await executeQuery('SELECT * FROM warehouses');
        setWarehouses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading warehouses:', err);
        setError('Failed to load warehouses');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [executeQuery]);

  if (error) {
    return (
      <div className="bg-secondary-800 rounded-lg p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-secondary-800 rounded-lg p-6">
        <div className="text-white text-center">Loading warehouses...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-secondary-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Warehouses</h2>
          <button className="text-accent-green hover:underline text-sm">
            Add New
          </button>
        </div>

        <div className="space-y-4">
          {warehouses.length === 0 ? (
            <div className="text-center text-secondary-400">No warehouses found</div>
          ) : (
            warehouses.map((warehouse: any) => (
              <motion.div
                key={warehouse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary-700 rounded-lg p-4 space-y-3 cursor-pointer hover:bg-secondary-600 transition-colors"
                onClick={() => setSelectedWarehouse(warehouse)}
              >
                <div className="flex items-center space-x-3">
                  <Warehouse className="w-5 h-5 text-accent-green" />
                  <h3 className="text-white font-medium">{warehouse.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm text-secondary-400">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{warehouse.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{warehouse.contact}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4" />
                    <div className="flex gap-2">
                      {JSON.parse(warehouse.shippingMethods).map((method: string) => (
                        <span
                          key={method}
                          className="px-2 py-1 bg-secondary-600 rounded text-xs"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-accent-green">
                    <Package className="w-4 h-4" />
                    <span>Click to view orders</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <WarehouseOrdersModal
        warehouse={selectedWarehouse}
        onClose={() => setSelectedWarehouse(null)}
      />
    </>
  );
}