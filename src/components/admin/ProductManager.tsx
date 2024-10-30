import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash, Image as ImageIcon } from 'lucide-react';
import { useDatabase } from '../../db/database';
import { Product } from '../../db/schema';
import AddModal from './AddModal';
import EditModal from './EditModal';

const MAX_IMAGES = 20;

export default function ProductManager() {
  const { executeQuery } = useDatabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const query = searchQuery
        ? `SELECT * FROM products WHERE name LIKE '%${searchQuery}%'`
        : 'SELECT * FROM products';
      const data = await executeQuery(query);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const files = Array.from(e.target.files || []);
    const currentImages = isEditing ? editingImages : selectedImages;
    
    if (currentImages.length + files.length > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing) {
          setEditingImages(prev => [...prev, reader.result as string]);
        } else {
          setSelectedImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddProduct = async (data: any) => {
    try {
      const id = `prod_${Date.now()}`;
      await executeQuery(
        'INSERT INTO products (id, name, category, price, stockLevel, variants, warehouseId, images, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          data.name,
          data.category,
          parseFloat(data.price),
          parseInt(data.stockLevel),
          parseInt(data.variants),
          data.warehouseId,
          JSON.stringify(selectedImages),
          new Date().toISOString()
        ]
      );
      setIsAddModalOpen(false);
      setSelectedImages([]);
      await loadProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product');
    }
  };

  const handleEditProduct = async (data: any) => {
    try {
      await executeQuery(
        'UPDATE products SET name = ?, category = ?, price = ?, stockLevel = ?, variants = ?, warehouseId = ?, images = ? WHERE id = ?',
        [
          data.name,
          data.category,
          parseFloat(data.price),
          parseInt(data.stockLevel),
          parseInt(data.variants),
          data.warehouseId,
          JSON.stringify(editingImages),
          data.id
        ]
      );
      setEditingProduct(null);
      setEditingImages([]);
      await loadProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await executeQuery('DELETE FROM products WHERE id = ?', [id]);
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
    }
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setEditingImages(JSON.parse(product.images || '[]'));
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
        Loading products...
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
            placeholder="Search products..."
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
          <span>Add Product</span>
        </button>
      </div>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <div className="text-center text-secondary-400">No products found</div>
        ) : (
          products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">{product.name}</h3>
                  <p className="text-secondary-400 text-sm mt-1">
                    {product.category} • ${product.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleStartEdit(product)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-accent-blue" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 hover:bg-secondary-600 rounded-lg"
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className={`text-sm ${product.stockLevel < 10 ? 'text-red-500' : 'text-accent-green'}`}>
                    {product.stockLevel} in stock
                  </p>
                  <p className="text-secondary-400 text-sm">
                    {product.variants} variants
                  </p>
                </div>
                <p className="text-secondary-400 text-sm">
                  Warehouse: {product.warehouseId}
                </p>
              </div>

              {JSON.parse(product.images || '[]').length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {JSON.parse(product.images).map((image: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-secondary-600">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedImages([]);
        }}
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
            />```tsx
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
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Images ({selectedImages.length}/{MAX_IMAGES})
            </label>
            <div className="mt-2 space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-secondary-600 border-dashed rounded-lg cursor-pointer hover:bg-secondary-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-3 text-secondary-400" />
                    <p className="mb-2 text-sm text-secondary-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-secondary-400">
                      PNG, JPG or GIF (MAX. {MAX_IMAGES} images)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={selectedImages.length >= MAX_IMAGES}
                  />
                </label>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600"
                      >
                        <Trash className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AddModal>

      <EditModal
        isOpen={!!editingProduct}
        onClose={() => {
          setEditingProduct(null);
          setEditingImages([]);
        }}
        onSubmit={handleEditProduct}
        title="Edit Product"
        initialData={editingProduct}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={editingProduct?.name}
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
              defaultValue={editingProduct?.category}
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
              defaultValue={editingProduct?.price}
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
              defaultValue={editingProduct?.stockLevel}
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
              defaultValue={editingProduct?.variants}
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
              defaultValue={editingProduct?.warehouseId}
              required
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-400 mb-1">
              Images ({editingImages.length}/{MAX_IMAGES})
            </label>
            <div className="mt-2 space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-secondary-600 border-dashed rounded-lg cursor-pointer hover:bg-secondary-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-3 text-secondary-400" />
                    <p className="mb-2 text-sm text-secondary-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-secondary-400">
                      PNG, JPG or GIF (MAX. {MAX_IMAGES} images)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, true)}
                    disabled={editingImages.length >= MAX_IMAGES}
                  />
                </label>
              </div>

              {editingImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {editingImages.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setEditingImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600"
                      >
                        <Trash className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </EditModal>
    </div>
  );
}