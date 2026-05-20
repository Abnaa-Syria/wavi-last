import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      // Add a product to favorites
      addToFavorites: (product) => {
        const current = get().favorites;
        if (current.some(item => item.id === product.id)) return;

        const updated = [...current, {
          id: product.id,
          title: product.title,
          price: product.price,
          category: product.category || 'عام',
          iconName: product.iconName || (product.category === 'شحن الألعاب' ? 'Gamepad2' : 'MonitorPlay')
        }];

        set({ favorites: updated });
        toast.success('تمت إضافة المنتج إلى المفضلة 💖');
      },

      // Remove a product from favorites
      removeFromFavorites: (productId) => {
        const current = get().favorites;
        const updated = current.filter(item => item.id !== productId);
        set({ favorites: updated });
        toast.success('تمت الإزالة من المفضلة 💔');
      },

      // Toggle favorite status
      toggleFavorite: (product) => {
        const isFav = get().favorites.some(item => item.id === product.id);
        if (isFav) {
          get().removeFromFavorites(product.id);
        } else {
          get().addToFavorites(product);
        }
      },

      // Check if product is favorited
      isFavorite: (productId) => {
        return get().favorites.some(item => item.id === productId);
      }
    }),
    {
      name: 'wavi-favorites-storage', // Persistent key
    }
  )
);
export default useFavoritesStore;
