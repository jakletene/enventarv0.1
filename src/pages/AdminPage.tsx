import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, Warehouse, Building2, ShoppingCart, DollarSign, Receipt } from 'lucide-react';
import SupplierManager from '../components/admin/SupplierManager';
import ProductManager from '../components/admin/ProductManager';
import WarehouseManager from '../components/admin/WarehouseManager';
import ClientManager from '../components/admin/ClientManager';
import OrderManager from '../components/admin/OrderManager';
import PayoutsManager from '../components/admin/PayoutsManager';
import ExpensesManager from '../components/admin/ExpensesManager';

type Tab = 'suppliers' | 'products' | 'warehouses' | 'clients' | 'orders' | 'payouts' | 'expenses';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('suppliers');

  const tabs = [
    { id: 'suppliers' as Tab, label: 'Suppliers', icon: Users },
    { id: 'products' as Tab, label: 'Products', icon: Package },
    { id: 'warehouses' as Tab, label: 'Warehouses', icon: Warehouse },
    { id: 'clients' as Tab, label: 'Clients', icon: Building2 },
    { id: 'orders' as Tab, label: 'Orders', icon: ShoppingCart },
    { id: 'payouts' as Tab, label: 'Payouts', icon: DollarSign },
    { id: 'expenses' as Tab, label: 'Expenses', icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
      </div>

      <div className="bg-secondary-800 rounded-lg">
        <div className="border-b border-secondary-700">
          <nav className="flex space-x-4 p-4 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-accent-green text-white'
                      : 'text-secondary-400 hover:text-white hover:bg-secondary-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {activeTab === 'suppliers' && <SupplierManager />}
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'warehouses' && <WarehouseManager />}
          {activeTab === 'clients' && <ClientManager />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'payouts' && <PayoutsManager />}
          {activeTab === 'expenses' && <ExpensesManager />}
        </motion.div>
      </div>
    </div>
  );
}