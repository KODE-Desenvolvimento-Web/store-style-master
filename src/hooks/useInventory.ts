import { useState, useCallback } from 'react';
import { Product, Alert, ProductVariant, InventoryLog } from '@/types/inventory';
import { mockProducts, mockAlerts, mockInventoryLogs } from '@/data/mockData';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(mockInventoryLogs);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: String(Date.now()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const updateVariantStock = useCallback((productId: string, variantId: string, quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const newVariants = p.variants.map(v => {
        if (v.id !== variantId) return v;
        const updated = { ...v, currentStock: quantity };
        if (quantity === 0) {
          setAlerts(a => [...a, {
            id: String(Date.now()),
            type: 'out_of_stock',
            message: `${p.name} - ${v.color} ${v.size} está esgotado`,
            productId: p.id,
            productName: p.name,
            reference: p.reference,
            read: false,
            createdAt: new Date(),
          }]);
        } else if (quantity <= p.minStockThreshold) {
          setAlerts(a => [...a, {
            id: String(Date.now() + 1),
            type: 'low_stock',
            message: `${p.name} - ${v.color} ${v.size} com estoque baixo (${quantity} un.)`,
            productId: p.id,
            productName: p.name,
            reference: p.reference,
            read: false,
            createdAt: new Date(),
          }]);
        }
        return updated;
      });
      return { ...p, variants: newVariants, updatedAt: new Date() };
    }));
  }, []);

  const processOperation = useCallback((items: { productId: string; variantId: string; quantity: number }[], type: 'IN' | 'OUT' | 'ADJUST', reason: string) => {
    const newLogs: InventoryLog[] = [];
    
    setProducts(prev => {
      const updated = [...prev];
      for (const item of items) {
        const pIdx = updated.findIndex(p => p.id === item.productId);
        if (pIdx === -1) continue;
        const product = { ...updated[pIdx], variants: [...updated[pIdx].variants] };
        const vIdx = product.variants.findIndex(v => v.id === item.variantId);
        if (vIdx === -1) continue;
        const variant = { ...product.variants[vIdx] };
        
        let newStock = variant.currentStock;
        if (type === 'IN') newStock += item.quantity;
        else if (type === 'OUT') newStock = Math.max(0, newStock - item.quantity);
        else newStock = Math.max(0, newStock + item.quantity);
        
        variant.currentStock = newStock;
        product.variants[vIdx] = variant;
        product.updatedAt = new Date();
        updated[pIdx] = product;

        newLogs.push({
          id: String(Date.now() + Math.random()),
          variantId: item.variantId,
          productId: item.productId,
          productName: product.name,
          variantLabel: `${variant.color} ${variant.size}`,
          type,
          quantity: type === 'OUT' ? -item.quantity : item.quantity,
          reason,
          timestamp: new Date(),
        });

        // Generate alerts
        if (newStock === 0) {
          setAlerts(a => [...a, {
            id: String(Date.now() + Math.random()),
            type: 'out_of_stock',
            message: `${product.name} - ${variant.color} ${variant.size} está esgotado`,
            productId: product.id,
            productName: product.name,
            reference: product.reference,
            read: false,
            createdAt: new Date(),
          }]);
        } else if (newStock <= product.minStockThreshold && newStock > 0) {
          setAlerts(a => [...a, {
            id: String(Date.now() + Math.random()),
            type: 'low_stock',
            message: `${product.name} - ${variant.color} ${variant.size} com estoque baixo (${newStock} un.)`,
            productId: product.id,
            productName: product.name,
            reference: product.reference,
            read: false,
            createdAt: new Date(),
          }]);
        }
      }
      return updated;
    });

    setInventoryLogs(prev => [...newLogs, ...prev]);
  }, []);

  const markAlertRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const findByBarcode = useCallback((barcode: string): { product: Product; variant: ProductVariant } | null => {
    for (const product of products) {
      const variant = product.variants.find(v => v.barcode === barcode);
      if (variant) return { product, variant };
    }
    return null;
  }, [products]);

  const totalProducts = products.length;
  const totalItems = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.currentStock, 0), 0);
  const lowStockCount = products.reduce((sum, p) => sum + p.variants.filter(v => v.currentStock > 0 && v.currentStock <= p.minStockThreshold).length, 0);
  const outOfStockCount = products.reduce((sum, p) => sum + p.variants.filter(v => v.currentStock === 0).length, 0);
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return {
    products,
    alerts,
    inventoryLogs,
    addProduct,
    deleteProduct,
    updateVariantStock,
    processOperation,
    markAlertRead,
    markAllAlertsRead,
    findByBarcode,
    totalProducts,
    totalItems,
    lowStockCount,
    outOfStockCount,
    unreadAlerts,
  };
}
