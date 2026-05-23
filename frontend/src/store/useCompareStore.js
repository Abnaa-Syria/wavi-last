import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export const useCompareStore = create(
  persist(
    (set, get) => ({
      compareItems: [],

      // Add a product to comparison
      addToCompare: (product) => {
        const current = get().compareItems;
        if (current.some(item => item.id === product.id)) return;

        if (current.length >= 4) {
          toast.error('يمكنك مقارنة 4 منتجات كحد أقصى! ⚠️');
          return;
        }

        const updated = [...current, {
          id: product.id,
          title: product.title || product.nameAr,
          price: product.price || product.basePrice,
          category: product.category || 'عام',
          imageUrl: product.imageUrl || null,
          slug: product.slug || '',
          descriptionAr: product.descriptionAr || product.description || ''
        }];

        set({ compareItems: updated });
        toast.success('تمت إضافة المنتج للمقارنة ⚖️');
      },

      // Remove a product from comparison
      removeFromCompare: (productId) => {
        const current = get().compareItems;
        const updated = current.filter(item => item.id !== productId);
        set({ compareItems: updated });
        toast.success('تمت إزالة المنتج من المقارنة');
      },

      // Toggle comparison status
      toggleCompare: (product) => {
        const isIn = get().compareItems.some(item => item.id === product.id);
        if (isIn) {
          get().removeFromCompare(product.id);
        } else {
          get().addToCompare(product);
        }
      },

      // Clear all items
      clearCompare: () => {
        set({ compareItems: [] });
      },

      // Check if product is in comparison
      isInCompare: (productId) => {
        return get().compareItems.some(item => item.id === productId);
      }
    }),
    {
      name: 'wavi-compare-storage', // Persistent key in LocalStorage
    }
  )
);

export default useCompareStore;
