import { Product, Alert, InventoryLog } from '@/types/inventory';

function generateBarcode(): string {
  return '789' + Math.random().toString().slice(2, 12).padEnd(10, '0');
}

function generateReference(category: string, index: number): string {
  const prefix = category.slice(0, 3).toUpperCase();
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

function generateSku(category: string, color: string, size: string): string {
  const catPrefix = category.slice(0, 3).toUpperCase();
  const colorPrefix = color.replace(/\s/g, '').slice(0, 3).toUpperCase();
  return `${catPrefix}-${colorPrefix}-${size}`;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    reference: generateReference('Camisetas', 1),
    name: 'Camiseta Básica Algodão',
    category: 'Camisetas',
    brand: 'Urban Style',
    salePrice: 79.90,
    costPrice: 32.00,
    minStockThreshold: 5,
    variants: [
      { id: '1-1', productId: '1', size: 'P', color: 'Branco', currentStock: 15, barcode: generateBarcode(), sku: generateSku('Camisetas', 'Branco', 'P') },
      { id: '1-2', productId: '1', size: 'M', color: 'Branco', currentStock: 20, barcode: generateBarcode(), sku: generateSku('Camisetas', 'Branco', 'M') },
      { id: '1-3', productId: '1', size: 'G', color: 'Branco', currentStock: 12, barcode: generateBarcode(), sku: generateSku('Camisetas', 'Branco', 'G') },
      { id: '1-4', productId: '1', size: 'P', color: 'Preto', currentStock: 18, barcode: generateBarcode(), sku: generateSku('Camisetas', 'Preto', 'P') },
      { id: '1-5', productId: '1', size: 'M', color: 'Preto', currentStock: 25, barcode: generateBarcode(), sku: generateSku('Camisetas', 'Preto', 'M') },
      { id: '1-6', productId: '1', size: 'G', color: 'Preto', currentStock: 3, barcode: generateBarcode(), sku: generateSku('Camisetas', 'Preto', 'G') },
      { id: '1-7', productId: '1', size: 'GG', color: 'Preto', currentStock: 0, barcode: generateBarcode(), sku: generateSku('Camisetas', 'Preto', 'GG') },
      { id: '1-8', productId: '1', size: 'P', color: 'Azul Marinho', currentStock: 10, barcode: generateBarcode(), sku: generateSku('Camisetas', 'Azul Marinho', 'P') },
      { id: '1-9', productId: '1', size: 'M', color: 'Azul Marinho', currentStock: 8, barcode: generateBarcode(), sku: generateSku('Camisetas', 'Azul Marinho', 'M') },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '2',
    reference: generateReference('Calças', 1),
    name: 'Calça Jeans Slim',
    category: 'Calças',
    brand: 'Denim Co',
    salePrice: 189.90,
    costPrice: 78.00,
    minStockThreshold: 3,
    variants: [
      { id: '2-1', productId: '2', size: 'P', color: 'Azul Marinho', currentStock: 8, barcode: generateBarcode(), sku: generateSku('Calças', 'Azul Marinho', 'P') },
      { id: '2-2', productId: '2', size: 'M', color: 'Azul Marinho', currentStock: 12, barcode: generateBarcode(), sku: generateSku('Calças', 'Azul Marinho', 'M') },
      { id: '2-3', productId: '2', size: 'G', color: 'Azul Marinho', currentStock: 6, barcode: generateBarcode(), sku: generateSku('Calças', 'Azul Marinho', 'G') },
      { id: '2-4', productId: '2', size: 'GG', color: 'Azul Marinho', currentStock: 2, barcode: generateBarcode(), sku: generateSku('Calças', 'Azul Marinho', 'GG') },
      { id: '2-5', productId: '2', size: 'P', color: 'Preto', currentStock: 10, barcode: generateBarcode(), sku: generateSku('Calças', 'Preto', 'P') },
      { id: '2-6', productId: '2', size: 'M', color: 'Preto', currentStock: 15, barcode: generateBarcode(), sku: generateSku('Calças', 'Preto', 'M') },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-08'),
  },
  {
    id: '3',
    reference: generateReference('Vestidos', 1),
    name: 'Vestido Midi Floral',
    category: 'Vestidos',
    brand: 'Bella Donna',
    salePrice: 249.90,
    costPrice: 95.00,
    minStockThreshold: 2,
    variants: [
      { id: '3-1', productId: '3', size: 'PP', color: 'Rosa', currentStock: 4, barcode: generateBarcode(), sku: generateSku('Vestidos', 'Rosa', 'PP') },
      { id: '3-2', productId: '3', size: 'P', color: 'Rosa', currentStock: 6, barcode: generateBarcode(), sku: generateSku('Vestidos', 'Rosa', 'P') },
      { id: '3-3', productId: '3', size: 'M', color: 'Rosa', currentStock: 8, barcode: generateBarcode(), sku: generateSku('Vestidos', 'Rosa', 'M') },
      { id: '3-4', productId: '3', size: 'G', color: 'Rosa', currentStock: 1, barcode: generateBarcode(), sku: generateSku('Vestidos', 'Rosa', 'G') },
      { id: '3-5', productId: '3', size: 'P', color: 'Vermelho', currentStock: 5, barcode: generateBarcode(), sku: generateSku('Vestidos', 'Vermelho', 'P') },
      { id: '3-6', productId: '3', size: 'M', color: 'Vermelho', currentStock: 7, barcode: generateBarcode(), sku: generateSku('Vestidos', 'Vermelho', 'M') },
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '4',
    reference: generateReference('Moletons', 1),
    name: 'Moletom Oversized',
    category: 'Moletons',
    brand: 'Urban Style',
    salePrice: 159.90,
    costPrice: 62.00,
    minStockThreshold: 3,
    variants: [
      { id: '4-1', productId: '4', size: 'M', color: 'Cinza', currentStock: 0, barcode: generateBarcode(), sku: generateSku('Moletons', 'Cinza', 'M') },
      { id: '4-2', productId: '4', size: 'G', color: 'Cinza', currentStock: 2, barcode: generateBarcode(), sku: generateSku('Moletons', 'Cinza', 'G') },
      { id: '4-3', productId: '4', size: 'GG', color: 'Cinza', currentStock: 5, barcode: generateBarcode(), sku: generateSku('Moletons', 'Cinza', 'GG') },
      { id: '4-4', productId: '4', size: 'M', color: 'Preto', currentStock: 0, barcode: generateBarcode(), sku: generateSku('Moletons', 'Preto', 'M') },
      { id: '4-5', productId: '4', size: 'G', color: 'Preto', currentStock: 1, barcode: generateBarcode(), sku: generateSku('Moletons', 'Preto', 'G') },
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: '5',
    reference: generateReference('Blusas', 1),
    name: 'Blusa Cropped Canelada',
    category: 'Blusas',
    brand: 'Bella Donna',
    salePrice: 69.90,
    costPrice: 25.00,
    minStockThreshold: 4,
    variants: [
      { id: '5-1', productId: '5', size: 'PP', color: 'Branco', currentStock: 10, barcode: generateBarcode(), sku: generateSku('Blusas', 'Branco', 'PP') },
      { id: '5-2', productId: '5', size: 'P', color: 'Branco', currentStock: 14, barcode: generateBarcode(), sku: generateSku('Blusas', 'Branco', 'P') },
      { id: '5-3', productId: '5', size: 'M', color: 'Branco', currentStock: 12, barcode: generateBarcode(), sku: generateSku('Blusas', 'Branco', 'M') },
      { id: '5-4', productId: '5', size: 'PP', color: 'Preto', currentStock: 8, barcode: generateBarcode(), sku: generateSku('Blusas', 'Preto', 'PP') },
      { id: '5-5', productId: '5', size: 'P', color: 'Preto', currentStock: 11, barcode: generateBarcode(), sku: generateSku('Blusas', 'Preto', 'P') },
      { id: '5-6', productId: '5', size: 'M', color: 'Preto', currentStock: 9, barcode: generateBarcode(), sku: generateSku('Blusas', 'Preto', 'M') },
      { id: '5-7', productId: '5', size: 'PP', color: 'Rosa', currentStock: 6, barcode: generateBarcode(), sku: generateSku('Blusas', 'Rosa', 'PP') },
      { id: '5-8', productId: '5', size: 'P', color: 'Rosa', currentStock: 7, barcode: generateBarcode(), sku: generateSku('Blusas', 'Rosa', 'P') },
    ],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-10'),
  },
];

// Mock inventory logs for charts
export const mockInventoryLogs: InventoryLog[] = [
  { id: 'l1', variantId: '1-1', productId: '1', productName: 'Camiseta Básica Algodão', variantLabel: 'Branco P', type: 'OUT', quantity: 3, reason: 'Venda', timestamp: new Date('2026-02-11T10:00:00') },
  { id: 'l2', variantId: '1-5', productId: '1', productName: 'Camiseta Básica Algodão', variantLabel: 'Preto M', type: 'OUT', quantity: 5, reason: 'Venda', timestamp: new Date('2026-02-11T14:00:00') },
  { id: 'l3', variantId: '2-2', productId: '2', productName: 'Calça Jeans Slim', variantLabel: 'Azul Marinho M', type: 'OUT', quantity: 2, reason: 'Venda', timestamp: new Date('2026-02-10T09:00:00') },
  { id: 'l4', variantId: '3-3', productId: '3', productName: 'Vestido Midi Floral', variantLabel: 'Rosa M', type: 'OUT', quantity: 4, reason: 'Venda', timestamp: new Date('2026-02-10T16:00:00') },
  { id: 'l5', variantId: '1-2', productId: '1', productName: 'Camiseta Básica Algodão', variantLabel: 'Branco M', type: 'IN', quantity: 30, reason: 'Entrada de Fornecedor', timestamp: new Date('2026-02-09T08:00:00') },
  { id: 'l6', variantId: '4-1', productId: '4', productName: 'Moletom Oversized', variantLabel: 'Cinza M', type: 'OUT', quantity: 3, reason: 'Venda', timestamp: new Date('2026-02-09T11:00:00') },
  { id: 'l7', variantId: '5-2', productId: '5', productName: 'Blusa Cropped Canelada', variantLabel: 'Branco P', type: 'OUT', quantity: 2, reason: 'Venda', timestamp: new Date('2026-02-08T15:00:00') },
  { id: 'l8', variantId: '2-5', productId: '2', productName: 'Calça Jeans Slim', variantLabel: 'Preto P', type: 'IN', quantity: 20, reason: 'Entrada de Fornecedor', timestamp: new Date('2026-02-08T09:00:00') },
  { id: 'l9', variantId: '1-6', productId: '1', productName: 'Camiseta Básica Algodão', variantLabel: 'Preto G', type: 'OUT', quantity: 7, reason: 'Venda', timestamp: new Date('2026-02-07T13:00:00') },
  { id: 'l10', variantId: '3-2', productId: '3', productName: 'Vestido Midi Floral', variantLabel: 'Rosa P', type: 'OUT', quantity: 1, reason: 'Venda', timestamp: new Date('2026-02-07T10:00:00') },
  { id: 'l11', variantId: '4-5', productId: '4', productName: 'Moletom Oversized', variantLabel: 'Preto G', type: 'ADJUST', quantity: -2, reason: 'Ajuste de Inventário', timestamp: new Date('2026-02-06T14:00:00') },
  { id: 'l12', variantId: '5-4', productId: '5', productName: 'Blusa Cropped Canelada', variantLabel: 'Preto PP', type: 'IN', quantity: 15, reason: 'Entrada de Fornecedor', timestamp: new Date('2026-02-06T08:00:00') },
  { id: 'l13', variantId: '1-4', productId: '1', productName: 'Camiseta Básica Algodão', variantLabel: 'Preto P', type: 'OUT', quantity: 6, reason: 'Venda', timestamp: new Date('2026-02-05T12:00:00') },
  { id: 'l14', variantId: '2-1', productId: '2', productName: 'Calça Jeans Slim', variantLabel: 'Azul Marinho P', type: 'OUT', quantity: 3, reason: 'Venda', timestamp: new Date('2026-02-05T17:00:00') },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'out_of_stock',
    message: 'Moletom Oversized - Cinza M está esgotado',
    productId: '4',
    productName: 'Moletom Oversized',
    reference: 'MOL-0001',
    read: false,
    createdAt: new Date('2024-02-10T10:30:00'),
  },
  {
    id: '2',
    type: 'out_of_stock',
    message: 'Moletom Oversized - Preto M está esgotado',
    productId: '4',
    productName: 'Moletom Oversized',
    reference: 'MOL-0001',
    read: false,
    createdAt: new Date('2024-02-10T10:30:00'),
  },
  {
    id: '3',
    type: 'low_stock',
    message: 'Camiseta Básica Algodão - Preto G com estoque baixo (3 un.)',
    productId: '1',
    productName: 'Camiseta Básica Algodão',
    reference: 'CAM-0001',
    read: false,
    createdAt: new Date('2024-02-10T09:15:00'),
  },
  {
    id: '4',
    type: 'out_of_stock',
    message: 'Camiseta Básica Algodão - Preto GG está esgotado',
    productId: '1',
    productName: 'Camiseta Básica Algodão',
    reference: 'CAM-0001',
    read: true,
    createdAt: new Date('2024-02-09T14:00:00'),
  },
  {
    id: '5',
    type: 'low_stock',
    message: 'Vestido Midi Floral - Rosa G com estoque baixo (1 un.)',
    productId: '3',
    productName: 'Vestido Midi Floral',
    reference: 'VES-0001',
    read: false,
    createdAt: new Date('2024-02-10T11:00:00'),
  },
  {
    id: '6',
    type: 'low_stock',
    message: 'Moletom Oversized - Preto G com estoque baixo (1 un.)',
    productId: '4',
    productName: 'Moletom Oversized',
    reference: 'MOL-0001',
    read: true,
    createdAt: new Date('2024-02-08T16:30:00'),
  },
];
