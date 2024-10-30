import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Edit, Trash } from 'lucide-react';
import { Product } from '../../db/schema';
import { useDatabase } from '../../db/database';

const columnHelper = createColumnHelper<Product>();

export default function ProductTable({ searchQuery }: { searchQuery: string }) {
  const { executeQuery } = useDatabase();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const query = searchQuery
      ? `SELECT * FROM products WHERE name LIKE '%${searchQuery}%'`
      : 'SELECT * FROM products';
    const data = executeQuery(query) as Product[];
    setProducts(data);
  }, [executeQuery, searchQuery]);

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
          <div className="w-10 h-10 bg-secondary-700 rounded-lg" />
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
    columnHelper.accessor('price', {
      header: 'Price',
      cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-secondary-700 rounded">
            <Edit className="w-4 h-4 text-accent-blue" />
          </button>
          <button className="p-1 hover:bg-secondary-700 rounded">
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
  );
}