import { useState } from 'react';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { Search, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/ProductGrid';
import AddProductDialog from '@/components/AddProductDialog';

export default function ProductsPage() {
  const { products } = useInventoryContext();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu catálogo e grade de estoque</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, referência, categoria..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(product => {
          const isExpanded = expandedId === product.id;
          const totalQty = product.grid.reduce((s, g) => s + g.quantity, 0);
          return (
            <div key={product.id} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : product.id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{product.reference.split('-')[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{product.reference}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{product.brand} · {product.category} · R$ {product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    totalQty === 0 
                      ? 'bg-destructive/10 text-destructive' 
                      : totalQty <= 10 
                        ? 'bg-warning/10 text-warning' 
                        : 'bg-success/10 text-success'
                  }`}>
                    {totalQty} peças
                  </span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </div>
              </button>
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border">
                  <ProductGrid product={product} />
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        )}
      </div>

      <AddProductDialog open={showAdd} onOpenChange={setShowAdd} />
    </div>
  );
}
