import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Edit, Trash, Image, X } from 'lucide-react';
import { Product } from '../../db/schema';
import { useDatabase } from '../../db/database';

const columnHelper = createColumnHelper<Product>();

interface ProductTableProps {
  products: Product[];
  onDataChange?: () => void;
}

export default function ProductTable({ products, onDataChange }: ProductTableProps) {
  const { executeQuery } = useDatabase();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDelete = (id: string) => {
    try {
      executeQuery('DELETE FROM products WHERE id = ?', [id]);
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center space-x-2"
        >
          <span>Product Name</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: (info) => (
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 bg-secondary-700 rounded-lg overflow-hidden">
            {JSON.parse(info.row.original.images || '[]')[0] ? (
              <img
                src={JSON.parse(info.row.original.images)[0]}
                alt={info.getValue()}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Image className="w-6 h-6 text-secondary-400" />
              </div>
            )}
          </div>
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('stockLevel', {
      header: 'Stock',
      cell: (info) => (
        <span className={info.getValue() < 10 ? 'text-red-500' : 'text-accent-green'}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('variants', {
      header: 'Variants',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setSelectedProduct(info.row.original)}
            className="p-1 hover:bg-secondary-700 rounded"
          >
            <Edit className="w-4 h-4 text-accent-blue" />
          </button>
          <button 
            onClick={() => handleDelete(info.getValue())}
            className="p-1 hover:bg-secondary-700 rounded"
          >
            <Trash className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-secondary-800 rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-sm font-medium text-secondary-400"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-secondary-700 hover:bg-secondary-700/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm text-white"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-secondary-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Product Details</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-secondary-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Images</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {JSON.parse(selectedProduct.images || '[]').map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-secondary-400">Name</label>
                    <p className="text-white">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-400">Category</label>
                    <p className="text-white">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-400">Price</label>
                    <p className="text-white">${selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-400">Stock Level</label>
                    <p className={selectedProduct.stockLevel < 10 ? 'text-red-500' : 'text-accent-green'}>
                      {selectedProduct.stockLevel}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-400">Variants</label>
                    <p className="text-white">{selectedProduct.variants}</p>
                  </div>
                  <div>
                    <label className="text-sm text-secondary-400">Warehouse ID</label>
                    <p className="text-white">{selectedProduct.warehouseId}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}