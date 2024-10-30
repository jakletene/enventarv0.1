import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddExpenseModal({ isOpen, onClose, onSubmit }: AddExpenseModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-secondary-800 rounded-lg p-6 w-full max-w-md m-4"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Add New Expense</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-400 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                required
                className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-400 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                step="0.01"
                required
                className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
              />
              <p className="text-sm text-secondary-400 mt-1">
                VAT (20%) will be automatically calculated
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-400 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-secondary-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent-green hover:bg-accent-green/90 text-white rounded-lg"
              >
                Add Expense
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}