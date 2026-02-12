import { useState, useCallback } from 'react';
import { Product, Alert, GridItem } from '@/types/inventory';
import { mockProducts, mockAlerts } from '@/data/mockData';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

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

  const updateProductGrid = useCallback((productId: string, gridItemId: string, quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const newGrid = p.grid.map(g => {
        if (g.id !== gridItemId) return g;
        const updated = { ...g, quantity };
        if (quantity === 0) {
          setAlerts(a => [...a, {
            id: String(Date.now()),
            type: 'out_of_stock',
            message: `${p.name} - ${g.color} ${g.size} está esgotado`,
            productId: p.id,
            productName: p.name,
            reference: p.reference,
            read: false,
            createdAt: new Date(),
          }]);
        } else if (quantity <= g.minStock) {
          setAlerts(a => [...a, {
            id: String(Date.now() + 1),
            type: 'low_stock',
            message: `${p.name} - ${g.color} ${g.size} com estoque baixo (${quantity} un.)`,
            productId: p.id,
            productName: p.name,
            reference: p.reference,
            read: false,
            createdAt: new Date(),
          }]);
        }
        return updated;
      });
      return { ...p, grid: newGrid, updatedAt: new Date() };
    }));
  }, []);

  const markAlertRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const findByBarcode = useCallback((barcode: string): { product: Product; gridItem: GridItem } | null => {
    for (const product of products) {
      const gridItem = product.grid.find(g => g.barcode === barcode);
      if (gridItem) return { product, gridItem };
    }
    return null;
  }, [products]);

  const totalProducts = products.length;
  const totalItems = products.reduce((sum, p) => sum + p.grid.reduce((s, g) => s + g.quantity, 0), 0);
  const lowStockCount = products.reduce((sum, p) => sum + p.grid.filter(g => g.quantity > 0 && g.quantity <= g.minStock).length, 0);
  const outOfStockCount = products.reduce((sum, p) => sum + p.grid.filter(g => g.quantity === 0).length, 0);
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return {
    products,
    alerts,
    addProduct,
    updateProductGrid,
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
