export interface Product {
  id: string;
  name: string;
  reference: string;
  category: string;
  brand: string;
  costPrice: number;
  salePrice: number;
  minStockThreshold: number;
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  barcode: string;
  sku: string;
  currentStock: number;
}

export interface InventoryLog {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantLabel: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason: string;
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'new_arrival' | 'price_change';
  message: string;
  productId: string;
  productName: string;
  reference: string;
  read: boolean;
  createdAt: Date;
}

export const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'EG'] as const;
export const COLORS = [
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Preto', hex: '#1a1a1a' },
  { name: 'Azul Marinho', hex: '#1e3a5f' },
  { name: 'Vermelho', hex: '#dc2626' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Verde', hex: '#16a34a' },
  { name: 'Cinza', hex: '#6b7280' },
  { name: 'Bege', hex: '#d4a574' },
  { name: 'Marrom', hex: '#78350f' },
  { name: 'Amarelo', hex: '#eab308' },
] as const;

export const CATEGORIES = [
  'Camisetas', 'Calças', 'Vestidos', 'Blusas', 'Saias',
  'Shorts', 'Jaquetas', 'Casacos', 'Moletons', 'Acessórios'
] as const;
