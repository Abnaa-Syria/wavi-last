import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { useAuthStore } from './useAuthStore';
import { toast } from 'react-hot-toast';

// Dynamic sub-slug Lucide icon mapper
const mapIconSlug = (slug) => {
  if (!slug) return 'Rocket';
  const s = slug.toLowerCase();
  if (s.includes('iptv') || s.includes('server')) return 'MonitorPlay';
  if (s.includes('game') || s.includes('play') || s.includes('coins') || s.includes('points') || s.includes('pubg') || s.includes('fc')) return 'Gamepad2';
  if (s.includes('youtube') || s.includes('premium')) return 'Youtube';
  if (s.includes('tv') || s.includes('netflix') || s.includes('shahid')) return 'Tv';
  if (s.includes('phone') || s.includes('mobile') || s.includes('app')) return 'Smartphone';
  return 'Rocket';
};

// Maps backend schema items to the unified frontend cart items schema
const mapItem = (item) => {
  const isServerItem = !!item.product;
  const productId = isServerItem ? item.productId : (item.productId || item.id);
  const variantId = item.variantId || null;
  const customerData = item.customerData || {};
  const quantity = item.quantity || 1;

  const productDetails = isServerItem ? item.product : {
    id: productId,
    nameAr: item.title || item.nameAr || 'منتج',
    basePrice: item.price || 0,
    slug: item.slug || ''
  };

  const variantDetails = isServerItem ? item.variant : (item.variant || null);
  const price = variantDetails ? Number(variantDetails.price) : Number(productDetails.basePrice);

  return {
    id: item.id, // server cuid or guest id
    productId,
    variantId,
    quantity,
    customerData,
    dynamicData: customerData, // alias for CartDrawer rendering compatibility
    title: productDetails.nameAr,
    price,
    iconName: productDetails.slug ? mapIconSlug(productDetails.slug) : (item.iconName || 'Rocket'),
    product: productDetails,
    variant: variantDetails
  };
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [], // The primary unified list of items
      items: [],     // Backward-compatibility mirror for components
      totalAmount: 0,
      isLoading: false,
      error: null,
      isDrawerOpen: false,

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),

      // Sums up prices of all active items and updates totalAmount state
      calculateTotals: (updatedItems) => {
        const total = updatedItems.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
        set({ totalAmount: total });
      },

      // Fetches active cart list directly from the database (only if logged in)
      fetchServerCart: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) return;

        set({ isLoading: true, error: null });
        try {
          const res = await api.get('/cart');
          const serverItems = res.data?.data?.cart?.items || [];
          const unifiedItems = serverItems.map(mapItem);

          set({ 
            cartItems: unifiedItems, 
            items: unifiedItems,
            isLoading: false 
          });
          get().calculateTotals(unifiedItems);
        } catch (err) {
          console.error('Failed to fetch server cart:', err);
          set({ 
            error: err.response?.data?.message || 'Failed to fetch cart from server', 
            isLoading: false 
          });
        }
      },

      // Adds item (guest/authenticated)
      addItem: async (product, quantity = 1, customerData = {}, variantId = null) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        
        if (!isAuthenticated) {
          // Guest Mode: Update local Zustand list
          const current = get().cartItems;
          const matchIndex = current.findIndex(
            (item) =>
              item.productId === product.id &&
              item.variantId === variantId &&
              JSON.stringify(item.customerData || {}) === JSON.stringify(customerData || {})
          );

          let updated;
          if (matchIndex > -1) {
            updated = [...current];
            updated[matchIndex].quantity += quantity;
          } else {
            const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const guestItem = mapItem({
              id: guestId,
              productId: product.id,
              variantId,
              quantity,
              customerData,
              title: product.title || product.nameAr,
              price: product.price || product.basePrice,
              iconName: product.iconName || 'Rocket',
              variant: product.variant || null
            });
            updated = [...current, guestItem];
          }

          set({ cartItems: updated, items: updated });
          get().calculateTotals(updated);
          set({ isDrawerOpen: true });
          toast.success('تمت إضافة المنتج للسلة');
        } else {
          // Authenticated Mode: Query backend API
          set({ isLoading: true, error: null });
          try {
            await api.post('/cart/items', {
              productId: product.id || product.productId,
              variantId: variantId || null,
              quantity,
              customerData
            });
            await get().fetchServerCart();
            set({ isDrawerOpen: true });
            toast.success('تمت إضافة المنتج لسلتك بنجاح');
          } catch (err) {
            console.error('Failed to add item to server cart:', err);
            toast.error(err.response?.data?.message || 'فشلت عملية الإضافة للسلة');
          } finally {
            set({ isLoading: false });
          }
        }
      },

      // Backward compatible alias
      addToCart: (product, dynamicData = {}) => {
        const variantId = product.variantId || product.variant?.id || null;
        return get().addItem(product, 1, dynamicData, variantId);
      },

      // Removes item by its unique ID
      removeItem: async (itemId) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (!isAuthenticated) {
          // Guest Mode
          const filtered = get().cartItems.filter(item => item.id !== itemId);
          set({ cartItems: filtered, items: filtered });
          get().calculateTotals(filtered);
          toast.success('تم حذف المنتج من السلة');
        } else {
          // Authenticated Mode
          set({ isLoading: true, error: null });
          try {
            await api.delete(`/cart/items/${itemId}`);
            await get().fetchServerCart();
            toast.success('تم حذف العنصر من سلتك');
          } catch (err) {
            console.error('Failed to remove item from server cart:', err);
            toast.error('فشل حذف العنصر من السلة');
          } finally {
            set({ isLoading: false });
          }
        }
      },

      // Backward compatible alias for CartDrawer
      removeFromCart: (productId, dynamicData = {}) => {
        const current = get().cartItems;
        const target = current.find(
          item => 
            item.productId === productId && 
            JSON.stringify(item.customerData || {}) === JSON.stringify(dynamicData || {})
        );

        if (target) {
          return get().removeItem(target.id);
        }
      },

      // Updates quantity for an item (guest/authenticated)
      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) return;
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (!isAuthenticated) {
          // Guest Mode
          const updated = get().cartItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          );
          set({ cartItems: updated, items: updated });
          get().calculateTotals(updated);
        } else {
          // Authenticated Mode: Direct PATCH request
          const target = get().cartItems.find(item => item.id === itemId);
          if (!target) return;

          set({ isLoading: true, error: null });
          try {
            await api.patch(`/cart/items/${itemId}`, { quantity });
            await get().fetchServerCart();
          } catch (err) {
            console.error('Failed to update server item quantity:', err);
            toast.error('خطأ أثناء تحديث كمية المنتج');
          } finally {
            set({ isLoading: false });
          }
        }
      },

      // Updates customerData for a cart item (guest/authenticated)
      updateCustomerData: async (itemId, customerData) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (!isAuthenticated) {
          // Guest Mode: Update local Zustand list
          const updated = get().cartItems.map(item =>
            item.id === itemId ? { ...item, customerData, dynamicData: customerData } : item
          );
          set({ cartItems: updated, items: updated });
          get().calculateTotals(updated);
        } else {
          // Authenticated Mode: Direct PATCH request
          set({ isLoading: true, error: null });
          try {
            await api.patch(`/cart/items/${itemId}`, { customerData });
            await get().fetchServerCart();
          } catch (err) {
            console.error('Failed to update server item customerData:', err);
            toast.error('خطأ أثناء تحديث بيانات المنتج');
          } finally {
            set({ isLoading: false });
          }
        }
      },

      // Pushes offline local guest items sequentially to server upon customer authentication
      syncCartWithServer: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) return;

        const currentItems = get().cartItems;
        // Filter out any items that are guest items (added offline)
        const guestItems = currentItems.filter(item => typeof item.id === 'string' && item.id.startsWith('guest-'));
        if (guestItems.length === 0) {
          // No guest items to sync, just fetch whatever is on the server
          await get().fetchServerCart();
          return;
        }

        set({ isLoading: true });
        toast.loading('جاري مزامنة السلة الخاصة بك...', { id: 'cart-sync' });

        try {
          // Sequentially post guest items to avoid DB lock contentions
          for (const item of guestItems) {
            try {
              await api.post('/cart/items', {
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: item.quantity,
                customerData: item.customerData || null
              });
            } catch (err) {
              console.error(`Failed to sync item ${item.productId} during boot:`, err);
            }
          }

          // Clear local storage storage guest references
          set({ cartItems: [], items: [] });

          // Fetch fresh combined server cart
          await get().fetchServerCart();
          toast.success('تمت مزامنة سلتك بنجاح!', { id: 'cart-sync' });
        } catch (err) {
          console.error('Handshake synchronization failed:', err);
          toast.error('حدث خطأ أثناء مزامنة السلة', { id: 'cart-sync' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Clears local and database cart items
      clearCart: () => {
        set({ cartItems: [], items: [], totalAmount: 0 });
      },

      // Legacy compatibility getter functions
      itemCount: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0);
      },
      getItemCount: () => get().itemCount(),

      cartTotal: () => {
        return get().cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      getCartTotal: () => get().cartTotal()
    }),
    {
      name: 'wavi-cart-storage',
      // Ensure we merge state properly upon client hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateTotals(state.cartItems || []);
        }
      }
    }
  )
);
// Reactively sync or clear cart based on authentication state changes in useAuthStore
if (typeof window !== 'undefined') {
  let prevAuthenticated = useAuthStore.getState().isAuthenticated;

  useAuthStore.subscribe((state) => {
    const isAuthenticated = state.isAuthenticated;
    if (isAuthenticated !== prevAuthenticated) {
      prevAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        useCartStore.getState().syncCartWithServer();
      } else {
        useCartStore.getState().clearCart();
      }
    }
  });
}

export default useCartStore;
