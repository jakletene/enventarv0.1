import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import WarehouseList from '../components/WarehouseList';
import ProductTable from '../components/inventory/ProductTable';
import FilterPanel from '../components/inventory/FilterPanel';
import { useDatabase } from '../db/database';
import { Product } from '../db/schema';
import AddModal from '../components/admin/AddModal';

export default function InventoryPage() {
  const { executeQuery } = useDatabase();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadProducts = () => {
    const query = searchQuery
      ? `SELECT * FROM products WHERE name LIKE '%${searchQuery}%'`
      : 'SELECT * FROM products';
    const data = executeQuery(query) as Product[];
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery, executeQuery]);

  const handleAddProduct = (data: any) => {
    const id = `prod_${Date.now()}`;
    executeQuery(
      'INSERT INTO products (id, name, category, price, stockLevel, variants, warehouseId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        data.name,
        data.category,
        parseFloat(data.price),
        parseInt(data.stockLevel),
        parseInt(data.variants),
        data.warehouseId
      ]
    );
    setIsAddModalOpen(false);
    loadProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-accent-green hover:bg-accent-green/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-green"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-secondary-800 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <WarehouseList />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          {showFilters && <FilterPanel />}
          <ProductTable products={products} onDataChange={loadProducts} />
        </motion.div>
      </div>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
        title="Add New Product"
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
              Category
            </label>
            <input
              type="text"
              name="category"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Price
            </label>
            <input
              type="number"
              name="price"
              step="0.01"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Stock Level
            </label>
            <input
              type="number"
              name="stockLevel"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Variants
            </label>
            <input
              type="number"
              name="variants"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Warehouse ID
            </label>
            <input
              type="text"
              name="warehouseId"
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
        </div>
      </AddModal>
    </div>
  );
}