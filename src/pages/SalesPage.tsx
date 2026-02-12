import { useState, useRef } from 'react';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ScanBarcode, Plus, Minus, Trash2, ShoppingCart,
  CheckCircle, Receipt, DollarSign, Hash, Search, X,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types/inventory';

interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export default function SalesPage() {
  const { findByBarcode, processOperation, products } = useInventoryContext();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = (code: string) => {
    if (!code.trim()) return;
    const found = findByBarcode(code.trim());
    if (!found) return;
    addToCart(found.product, found.variant);
    setBarcodeInput('');
    inputRef.current?.focus();
  };

  const addToCart = (product: Product, variant: ProductVariant) => {
    setCart(prev => {
      const existing = prev.findIndex(i => i.variant.id === variant.id);
      if (existing >= 0) {
        return prev.map((item, i) =>
          i === existing ? { ...item, quantity: Math.min(item.quantity + 1, variant.currentStock) } : item
        );
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variant.id !== variantId) return item;
      const newQty = Math.max(1, Math.min(item.quantity + delta, item.variant.currentStock));
      return { ...item, quantity: newQty };
    }));
  };

  const removeItem = (variantId: string) => {
    setCart(prev => prev.filter(i => i.variant.id !== variantId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const discountValue = subtotal * (discount / 100);
  const total = subtotal - discountValue;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleFinalizeSale = () => {
    if (cart.length === 0) return;
    const items = cart.map(i => ({
      productId: i.product.id,
      variantId: i.variant.id,
      quantity: i.quantity,
    }));
    const reason = customerName ? `Venda — ${customerName}` : 'Venda';
    processOperation(items, 'OUT', reason);
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  // Filter products for manual search
  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Ponto de Venda</h1>
        <p className="text-muted-foreground mt-1">Registre vendas rapidamente com scanner ou busca</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Scanner + Product Search */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scanner */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <h3 className="font-heading font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
              <ScanBarcode className="w-4 h-4" />
              Código de Barras
            </h3>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Bipe ou digite o código..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan(barcodeInput)}
                className="font-mono"
                autoFocus
              />
              <Button onClick={() => handleScan(barcodeInput)} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product search */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <h3 className="font-heading font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
              <Search className="w-4 h-4" />
              Buscar Produto
            </h3>
            <Input
              placeholder="Nome ou referência..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {filteredProducts.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredProducts.map(product => (
                  <div key={product.id} className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground px-2 pt-2">
                      {product.name} <span className="font-mono">({product.reference})</span>
                    </p>
                    {product.variants.filter(v => v.currentStock > 0).map(variant => (
                      <button
                        key={variant.id}
                        onClick={() => { addToCart(product, variant); setSearchQuery(''); }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                      >
                        <span>{variant.color} · {variant.size}</span>
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">{variant.currentStock} un.</Badge>
                          <span className="font-semibold">R$ {product.salePrice.toFixed(2)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim() && filteredProducts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto encontrado</p>
            )}
          </div>

          {/* Customer */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <h3 className="font-heading font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
              Cliente (opcional)
            </h3>
            <Input
              placeholder="Nome do cliente..."
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-xl p-6 flex flex-col" style={{ minHeight: '500px' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Carrinho
              </h3>
              {cart.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    <Hash className="w-3 h-3 inline" /> {cart.length} itens · {totalItems} peças
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setCart([])} className="text-destructive hover:text-destructive">
                    <X className="w-4 h-4 mr-1" /> Limpar
                  </Button>
                </div>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Carrinho vazio</p>
                  <p className="text-sm mt-1">Escaneie um produto ou busque para adicionar.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-2 overflow-y-auto mb-4">
                  {cart.map(item => (
                    <div key={item.variant.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.variant.color} · {item.variant.size} · <span className="font-mono">{item.variant.sku}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.variant.id, -1)}
                          className="w-7 h-7 rounded bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, 1)}
                          className="w-7 h-7 rounded bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold w-24 text-right">
                        R$ {(item.product.salePrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.variant.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Desconto</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={discount}
                        onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-20 text-right font-mono h-8"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm text-destructive">
                      <span>— Desconto ({discount}%)</span>
                      <span className="font-mono">- R$ {discountValue.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xl font-bold pt-2 border-t border-border">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Total
                    </span>
                    <span className="font-mono">R$ {total.toFixed(2)}</span>
                  </div>

                  <Button onClick={handleFinalizeSale} className="w-full gap-2 mt-2" size="lg">
                    <Receipt className="w-5 h-5" />
                    Finalizar Venda — R$ {total.toFixed(2)}
                  </Button>
                </div>
              </>
            )}

            {success && (
              <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/30 text-success text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Venda registrada com sucesso!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
