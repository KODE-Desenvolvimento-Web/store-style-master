import { useState, useRef, useEffect, useCallback } from 'react';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Tags } from 'lucide-react';
import JsBarcode from 'jsbarcode';

export default function LabelsPage() {
  const { products } = useInventoryContext();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (!selectedProduct) return;
    setSelectedItems(selectedProduct.variants.map(v => v.id));
  };

  useEffect(() => {
    const canvases = containerRef.current?.querySelectorAll('canvas[data-barcode]');
    canvases?.forEach(canvas => {
      const code = (canvas as HTMLCanvasElement).dataset.barcode;
      if (code) {
        try {
          JsBarcode(canvas, code, {
            format: 'CODE128',
            width: 1.5,
            height: 40,
            displayValue: true,
            fontSize: 10,
            margin: 4,
          });
        } catch (e) {
          console.error('Barcode error:', e);
        }
      }
    });
  }, [selectedItems, selectedProductId]);

  const handlePrint = () => {
    const printContent = containerRef.current;
    if (!printContent) return;
    const w = window.open('', '', 'width=800,height=600');
    if (!w) return;
    w.document.write(`
      <html><head><title>Etiquetas - StockWear</title>
      <style>
        body { margin: 0; padding: 20px; font-family: 'Inter', Arial, sans-serif; }
        .labels-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .label { border: 1px dashed #ccc; padding: 12px; text-align: center; page-break-inside: avoid; }
        .label h4 { margin: 0 0 4px; font-size: 12px; font-weight: 600; }
        .label p { margin: 2px 0; font-size: 10px; color: #666; }
        .label .price { font-size: 14px; font-weight: 700; margin-top: 4px; }
        @media print { .labels-grid { grid-template-columns: repeat(3, 1fr); } }
      </style></head><body>
      ${printContent.innerHTML}
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const itemsToRender = selectedProduct?.variants.filter(v => selectedItems.includes(v.id)) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Gerador de Etiquetas</h1>
        <p className="text-muted-foreground mt-1">Gere etiquetas com código de barras para seus produtos</p>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-72">
            <label className="text-sm font-medium mb-1.5 block">Produto</label>
            <Select value={selectedProductId} onValueChange={v => { setSelectedProductId(v); setSelectedItems([]); }}>
              <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.reference} — {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedProduct && (
            <Button variant="outline" size="sm" onClick={selectAll}>
              Selecionar Todos
            </Button>
          )}
        </div>

        {selectedProduct && (
          <div>
            <p className="text-sm font-medium mb-2">Selecione as variações:</p>
            <div className="flex flex-wrap gap-2">
              {selectedProduct.variants.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => toggleItem(variant.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedItems.includes(variant.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {variant.color} · {variant.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedItems.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimir Etiquetas ({selectedItems.length})
            </Button>
          </div>
        )}
      </div>

      {itemsToRender.length > 0 && selectedProduct && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Pré-visualização</h3>
          <div ref={containerRef}>
            <div className="labels-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {itemsToRender.map(variant => (
                <div key={variant.id} className="label border border-dashed border-border rounded-lg p-4 text-center bg-card">
                  <h4 className="text-xs font-bold truncate">{selectedProduct.name}</h4>
                  <p className="text-xs text-muted-foreground">Ref: {selectedProduct.reference}</p>
                  <p className="text-xs text-muted-foreground">{variant.color} · Tam: {variant.size}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">SKU: {variant.sku}</p>
                  <div className="my-2 flex justify-center">
                    <canvas data-barcode={variant.barcode} />
                  </div>
                  <p className="price text-lg font-heading font-bold">R$ {selectedProduct.salePrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selectedProductId && (
        <div className="text-center py-16 text-muted-foreground">
          <Tags className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Selecione um produto</p>
          <p className="text-sm mt-1">Escolha um produto acima para gerar etiquetas com código de barras.</p>
        </div>
      )}
    </div>
  );
}
