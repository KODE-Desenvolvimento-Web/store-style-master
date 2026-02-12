import { useState } from 'react';
import { Product, SIZES } from '@/types/inventory';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface Props {
  product: Product;
}

export default function ProductGrid({ product }: Props) {
  const { updateProductGrid } = useInventoryContext();
  
  // Get unique colors and sizes from the product grid
  const colors = [...new Set(product.grid.map(g => g.color))];
  const sizes = SIZES.filter(s => product.grid.some(g => g.size === s));

  return (
    <div className="pt-4">
      <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Grade de Estoque</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Cor</th>
              {sizes.map(size => (
                <th key={size} className="text-center py-2 px-3 font-medium text-muted-foreground">{size}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map(color => (
              <tr key={color} className="border-t border-border/50">
                <td className="py-2 px-3 font-medium">{color}</td>
                {sizes.map(size => {
                  const item = product.grid.find(g => g.size === size && g.color === color);
                  if (!item) return <td key={size} className="text-center py-2 px-3 text-muted-foreground">—</td>;
                  return (
                    <td key={size} className="text-center py-2 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateProductGrid(product.id, item.id, Math.max(0, item.quantity - 1))}
                          className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`w-8 text-center font-mono font-bold ${
                          item.quantity === 0 
                            ? 'text-destructive' 
                            : item.quantity <= item.minStock 
                              ? 'text-warning' 
                              : 'text-foreground'
                        }`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateProductGrid(product.id, item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
