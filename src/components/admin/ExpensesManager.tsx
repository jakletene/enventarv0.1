import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash, Receipt } from 'lucide-react';
import { useDatabase } from '../../db/database';
import AddExpenseModal from './AddExpenseModal';

interface Expense {
  id: string;
  description: string;
  amount: number;
  vat: number;
  date: string;
  createdAt: string;
}

export default function ExpensesManager() {
  const { executeQuery } = useDatabase();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalVAT, setTotalVAT] = useState(0);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const query = searchQuery
        ? `SELECT * FROM expenses WHERE description LIKE '%${searchQuery}%' ORDER BY date DESC`
        : 'SELECT * FROM expenses ORDER BY date DESC';
      const result = await executeQuery(query);
      const expensesList = Array.isArray(result) ? result : [];
      setExpenses(expensesList);

      const total = expensesList.reduce((sum, expense) => sum + expense.amount, 0);
      const vat = expensesList.reduce((sum, expense) => sum + expense.vat, 0);
      setTotalExpenses(total);
      setTotalVAT(vat);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [searchQuery]);

  const handleAddExpense = async (data: any) => {
    try {
      const id = `exp_${Date.now()}`;
      const vat = parseFloat(data.amount) * 0.2;
      await executeQuery(
        'INSERT INTO expenses (id, description, amount, vat, date, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [
          id,
          data.description,
          parseFloat(data.amount),
          vat,
          data.date,
          new Date().toISOString()
        ]
      );
      setIsAddModalOpen(false);
      await loadExpenses();
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await executeQuery('DELETE FROM expenses WHERE id = ?', [id]);
      await loadExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search expenses..."
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
          <span>Add Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-secondary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Total Expenses</h3>
            <Receipt className="w-5 h-5 text-accent-green" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-secondary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Total VAT (20%)</h3>
            <Receipt className="w-5 h-5 text-accent-blue" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            ${totalVAT.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-white">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-secondary-400">No expenses found</div>
        ) : (
          expenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{expense.description}</h4>
                  <p className="text-sm text-secondary-400">
                    Date: {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-white font-medium">
                      ${expense.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-accent-blue">
                      VAT: ${expense.vat.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddExpense}
      />
    </div>
  );
}