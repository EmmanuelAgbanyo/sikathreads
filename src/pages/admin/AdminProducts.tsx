import React, { useState } from 'react';
import { StoreService } from '../../services/storeService';
import { Product, SellingUnit, PublicationStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  X,
  Search,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(() => StoreService.getProducts());
  const categories = StoreService.getCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new/edit product
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    sku: '',
    description: '',
    categoryId: categories[0]?.id || 'cat-kente',
    fabricType: 'Authentic Handwoven Kente',
    colours: ['Gold', 'Burgundy'],
    colourFamily: 'Gold/Yellow',
    pattern: 'Geometric',
    texture: 'Structured Weave',
    intendedUse: ['Bridal / Wedding', 'Traditional Engagement'],
    suitableOccasions: ['Wedding', 'Traditional engagement or marriage', 'Formal event'],
    tags: ['Kente', 'Ghana Handwoven'],
    images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'],
    price: 450,
    currency: 'GHS',
    sellingUnit: 'yards',
    minOrderQty: 1,
    qtyIncrement: 1,
    stockQty: 10,
    reservedQty: 0,
    lowStockThreshold: 3,
    publicationStatus: 'published',
    sourcingEnabled: true,
    featured: false,
  });

  const [rawColours, setRawColours] = useState('Gold, Burgundy');
  const [rawImages, setRawImages] = useState(
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
  );

  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      sku: `ST-FAB-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      categoryId: categories[0]?.id || 'cat-kente',
      fabricType: 'Authentic Handwoven Kente',
      colours: ['Gold', 'Burgundy'],
      colourFamily: 'Gold/Yellow',
      pattern: 'Geometric',
      texture: 'Structured Weave',
      intendedUse: ['Bridal / Wedding', 'Traditional Engagement'],
      suitableOccasions: ['Wedding', 'Traditional engagement or marriage', 'Formal event'],
      tags: ['Ghanaian Fabric'],
      images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'],
      price: 400,
      currency: 'GHS',
      sellingUnit: 'yards',
      minOrderQty: 1,
      qtyIncrement: 1,
      stockQty: 10,
      reservedQty: 0,
      lowStockThreshold: 3,
      publicationStatus: 'published',
      sourcingEnabled: true,
      featured: false,
    });
    setRawColours('Gold, Burgundy');
    setRawImages('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setRawColours(p.colours.join(', '));
    setRawImages(p.images.join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const matchedCat = categories.find((c) => c.id === formData.categoryId);
    const slug =
      formData.slug?.trim() ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const coloursArray = rawColours
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const imagesArray = rawImages
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
      name: formData.name.trim(),
      slug,
      sku: formData.sku || undefined,
      description: formData.description || '',
      categoryId: formData.categoryId || 'cat-kente',
      categoryName: matchedCat?.name || 'Catalogue',
      fabricType: formData.fabricType || 'Ghanaian Textile',
      colours: coloursArray.length > 0 ? coloursArray : ['Gold'],
      colourFamily: formData.colourFamily || 'Gold/Yellow',
      pattern: formData.pattern || 'Geometric',
      texture: formData.texture || 'Medium Structured',
      intendedUse: formData.intendedUse || ['Special Occasion'],
      suitableOccasions: formData.suitableOccasions || ['Wedding', 'Formal event'],
      tags: formData.tags || ['Ghana Fabric'],
      images: imagesArray.length > 0 ? imagesArray : ['/logo.png'],
      price: Number(formData.price) || 100,
      currency: 'GHS',
      sellingUnit: (formData.sellingUnit as SellingUnit) || 'yards',
      minOrderQty: Number(formData.minOrderQty) || 1,
      qtyIncrement: Number(formData.qtyIncrement) || 1,
      stockQty: Number(formData.stockQty) || 0,
      reservedQty: editingProduct ? editingProduct.reservedQty : 0,
      lowStockThreshold: Number(formData.lowStockThreshold) || 3,
      publicationStatus: (formData.publicationStatus as PublicationStatus) || 'published',
      sourcingEnabled: Boolean(formData.sourcingEnabled),
      featured: Boolean(formData.featured),
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StoreService.saveProduct(productToSave, user?.email || 'admin@sikathreads.com.gh');
    setProducts(StoreService.getProducts());
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the catalogue?`)) {
      StoreService.deleteProduct(id, user?.email || 'admin@sikathreads.com.gh');
      setProducts(StoreService.getProducts());
    }
  };

  const filtered = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.fabricType.toLowerCase().includes(q) ||
        p.colours.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ivory-300">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Inventory &amp; Merchandising
          </span>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Product Catalogue</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Manage fabric specs, images, stock quantities, and GHS unit pricing.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-4 py-2.5 bg-gold-600 hover:bg-gold-500 text-white rounded font-semibold text-xs flex items-center shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-ivory-300 shadow-subtle text-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, fabric, or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-ivory-50 border border-ivory-300 rounded focus:ring-gold"
          />
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-charcoal-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-ivory-50 border border-ivory-300 rounded p-1.5 focus:ring-gold"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Fabric Item</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price (GHS)</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Sourcing</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="p-3.5 flex items-center space-x-3">
                    <img
                      src={prod.images[0] || '/logo.png'}
                      alt={prod.name}
                      className="w-10 h-10 rounded object-cover border border-ivory-200 flex-shrink-0"
                    />
                    <div>
                      <span className="font-bold text-charcoal block line-clamp-1">{prod.name}</span>
                      <span className="text-[11px] text-charcoal-400 font-mono">
                        {prod.sku || prod.id} &bull; {prod.fabricType}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 text-charcoal-600">{prod.categoryName}</td>
                  <td className="p-3.5 font-bold font-serif text-charcoal">
                    GHS {prod.price.toLocaleString()}
                    <span className="text-[10px] text-charcoal-400 font-sans font-normal ml-1">
                      /{prod.sellingUnit}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`font-semibold ${
                        prod.stockQty <= 0
                          ? 'text-rose-700'
                          : prod.stockQty <= prod.lowStockThreshold
                          ? 'text-amber-700'
                          : 'text-charcoal'
                      }`}
                    >
                      {prod.stockQty} {prod.sellingUnit}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        prod.publicationStatus === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-charcoal-100 text-charcoal-600'
                      }`}
                    >
                      {prod.publicationStatus}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[11px] font-medium ${
                        prod.sourcingEnabled ? 'text-gold-700' : 'text-charcoal-400'
                      }`}
                    >
                      {prod.sourcingEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <a
                      href={`/product/${prod.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-charcoal-400 hover:text-gold inline-block"
                      title="Preview Customer Listing"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="p-1.5 text-charcoal-400 hover:text-charcoal inline-block"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-1.5 text-charcoal-400 hover:text-burgundy inline-block"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-ivory-300 shadow-premium">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
              <h2 className="font-serif text-xl font-bold text-charcoal">
                {editingProduct ? 'Edit Catalogue Fabric' : 'Add New Fabric to Catalogue'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal hover:text-burgundy p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">Fabric Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">Fabric Type Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Authentic Handwoven Kente, French Beaded Lace"
                    value={formData.fabricType}
                    onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">SKU (Optional)</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">Price in GHS *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">Selling Unit *</label>
                  <select
                    value={formData.sellingUnit}
                    onChange={(e) => setFormData({ ...formData, sellingUnit: e.target.value as SellingUnit })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  >
                    <option value="yards">Yards</option>
                    <option value="pieces">Pieces (e.g. 6-yard piece)</option>
                    <option value="metres">Metres</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">Current Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: Number(e.target.value) })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">Low-Stock Alert Threshold *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">Min Order Quantity (MOQ)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minOrderQty}
                    onChange={(e) => setFormData({ ...formData, minOrderQty: Number(e.target.value) })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">Publication Status</label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, publicationStatus: e.target.value as PublicationStatus })
                    }
                    className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  >
                    <option value="published">Published (Public)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-charcoal-600 block mb-1">Colours (Comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold, Burgundy, Emerald Green"
                  value={rawColours}
                  onChange={(e) => setRawColours(e.target.value)}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-600 block mb-1">Image URLs (One per line) *</label>
                <textarea
                  rows={2}
                  required
                  value={rawImages}
                  onChange={(e) => setRawImages(e.target.value)}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-600 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded p-2"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sourcingEnabled}
                    onChange={(e) => setFormData({ ...formData, sourcingEnabled: e.target.checked })}
                    className="accent-gold-600"
                  />
                  <span>Enable Sourcing Request when stock reaches zero</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="accent-gold-600"
                  />
                  <span>Featured Product on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-ivory-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-ivory-300 rounded text-charcoal hover:bg-ivory-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded font-semibold shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
