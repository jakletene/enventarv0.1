import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, FileText, Download, Trash } from 'lucide-react';

const mockDocuments = [
  {
    id: 'DOC001',
    name: 'Invoice #1234',
    type: 'Invoice',
    size: '256 KB',
    date: '2024-02-28',
  },
  {
    id: 'DOC002',
    name: 'Shipping Label #5678',
    type: 'Shipping',
    size: '128 KB',
    date: '2024-02-27',
  },
  {
    id: 'DOC003',
    name: 'Purchase Order #9012',
    type: 'Order',
    size: '512 KB',
    date: '2024-02-26',
  },
];

export default function DocumentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Document Management</h1>
        <button className="bg-accent-green hover:bg-accent-green/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-green"
          />
        </div>
        <button className="bg-secondary-800 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid gap-6">
        {mockDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary-800 p-6 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-secondary-700 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-accent-green" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{doc.name}</h3>
                  <p className="text-secondary-400 text-sm">
                    {doc.type} • {doc.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-secondary-400 text-sm">{doc.date}</span>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-secondary-700 rounded-lg">
                    <Download className="w-4 h-4 text-accent-blue" />
                  </button>
                  <button className="p-2 hover:bg-secondary-700 rounded-lg">
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}