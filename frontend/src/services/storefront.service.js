import api from '@/lib/api.js';

/**
 * Fetch active, unexpired banners for home page hero sliders
 */
export const getHeroBanners = async () => {
  try {
    const response = await api.get('/marketing/banners?placement=hero');
    return response?.data?.data?.banners || [];
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    return [];
  }
};

/**
 * Fetch store categories tree
 * @param {boolean} mainOnly - if true, only retrieves root categories
 */
export const getStoreCategories = async (mainOnly = false) => {
  try {
    const response = await api.get(`/categories?mainOnly=${mainOnly}`);
    return response?.data?.data?.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Fetch public grouped FAQ categories and active questions
 */
export const getHomeFaqs = async () => {
  try {
    const response = await api.get('/faqs');
    return response?.data?.data?.categories || [];
  } catch (error) {
    console.error('Error fetching grouped faqs:', error);
    return [];
  }
};

/**
 * Helper to dynamically bind premium images to products (using DB media or curated Unsplash matches)
 */
const mapProductImage = (product) => {
  if (!product) return null;
  
  // 1. Check if product already has an imageUrl field
  if (product.imageUrl) return product;

  // 2. Check if product has a media array with image URLs
  if (product.media && product.media.length > 0) {
    const firstImage = product.media.find(m => m.mediaType === 'IMAGE' || m.mediaType === 'image');
    if (firstImage) {
      return {
        ...product,
        imageUrl: firstImage.url
      };
    }
  }

  // 3. Fallback to highly curated premium Unsplash images matching Wavi seed products & categories
  const s = (product.slug || '').toLowerCase();
  let image = '';
  if (s.includes('smarters')) {
    image = 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80'; // Ultra IPTV display screen
  } else if (s.includes('universe')) {
    image = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'; // Sci-fi universe gaming console tech
  } else if (s.includes('falcon')) {
    image = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'; // Premium glowing TV/game setup
  } else if (s.includes('xiaomi') || s.includes('box') || s.includes('stick')) {
    image = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'; // Premium hardware device
  } else {
    image = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'; // Default premium theme placeholder
  }

  return {
    ...product,
    imageUrl: image
  };
};

/**
 * Fetch products from database catalog
 * Supports category and search filters
 * @param {object} params - query parameters (e.g. { category: 'cuid', search: 'name' })
 */
export const getAllProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/products?${query}`);
    const products = response?.data?.data?.products || [];
    return products.map(mapProductImage);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Fetch single product details with variants and configurations
 * @param {string} id - product ID or slug
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    const product = response?.data?.data?.product || null;
    return mapProductImage(product);
  } catch (error) {
    console.error(`Error fetching product by ID (${id}):`, error);
    return null;
  }
};
