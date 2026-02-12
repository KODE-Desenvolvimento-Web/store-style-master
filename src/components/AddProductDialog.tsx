import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { SIZES, COLORS, CATEGORIES, ProductVariant } from '@/types/inventory';
import { RefreshCw } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateBarcode(): string {
  return '789' + Math.random().toString().slice(2, 12).padEnd(10, '0');
}

function generateSku(category: string, color: string, size: string): string {
  const catPrefix = category.slice(0, 3).toUpperCase();
  const colorPrefix = color.replace(/\s/g, '').slice(0, 3).toUpperCase();
  return `${catPrefix}-${colorPrefix}-${size}`;
}

interface VariantDraft {
  size: string;
  color: string;
  barcode: string;
  sku: string;
  initialStock: number;
}

export default function AddProductDialog({ open, onOpenChange }: Props) {
  const { addProduct } = useInventoryContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [minStock, setMinStock] = useState('3');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([]);

  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size) ? selectedSizes.filter(s => s !== size) : [...selectedSizes, size];
    setSelectedSizes(next);
    regenerateGrid(next, selectedColors);
  };

  const toggleColor = (color: string) => {
    const next = selectedColors.includes(color) ? selectedColors.filter(c => c !== color) : [...selectedColors, color];
    setSelectedColors(next);
    regenerateGrid(selectedSizes, next);
  };

  const regenerateGrid = (sizes: string[], colors: string[]) => {
    const drafts: VariantDraft[] = [];
    for (const color of colors) {
      for (const size of sizes) {
        const existing = variantDrafts.find(d => d.size === size && d.color === color);
        drafts.push(existing || {
          size,
          color,
          barcode: generateBarcode(),
          sku: generateSku(category || 'PRD', color, size),
          initialStock: 0,
        });
      }
    }
    setVariantDrafts(drafts);
  };

  const updateDraft = (idx: number, field: keyof VariantDraft, value: string | number) => {
    setVariantDrafts(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const regenerateBarcode = (idx: number) => {
    updateDraft(idx, 'barcode', generateBarcode());
  };

  const handleSubmit = () => {
    if (!name || !category || !brand || !salePrice || variantDrafts.length === 0) return;

    const prefix = category.slice(0, 3).toUpperCase();
    const reference = `${prefix}-${String(Date.now()).slice(-4)}`;
    const productId = String(Date.now());

    const variants: ProductVariant[] = variantDrafts.map((d, idx) => ({
      id: `${productId}-${idx}`,
      productId,
      size: d.size,
      color: d.color,
      barcode: d.barcode,
      sku: d.sku,
      currentStock: d.initialStock,
    }));

    addProduct({
      reference,
      name,
      category,
      brand,
      salePrice: parseFloat(salePrice),
      costPrice: parseFloat(costPrice) || 0,
      minStockThreshold: parseInt(minStock) || 3,
      variants,
    });

    // Reset
    setName('');
    setCategory('');
    setBrand('');
    setSalePrice('');
    setCostPrice('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setVariantDrafts([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Novo Produto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome do Produto</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Camiseta Básica" />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marca</Label>
              <Input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Ex: Urban Style" />
            </div>
            <div>
              <Label>Preço de Venda (R$)</Label>
              <Input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Preço de Custo (R$)</Label>
              <Input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Estoque Mínimo (global)</Label>
              <Input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="3" />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Tamanhos</Label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    selectedSizes.includes(size)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Cores</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    selectedColors.includes(color.name)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grade Matrix Preview */}
          {variantDrafts.length > 0 && (
            <div>
              <Label className="mb-2 block">Grade Gerada — {variantDrafts.length} variações</Label>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left py-2 px-3 font-medium">SKU</th>
                      <th className="text-left py-2 px-3 font-medium">Cor</th>
                      <th className="text-left py-2 px-3 font-medium">Tam</th>
                      <th className="text-left py-2 px-3 font-medium">Código de Barras</th>
                      <th className="text-center py-2 px-3 font-medium">Est. Inicial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantDrafts.map((d, idx) => (
                      <tr key={idx} className="border-t border-border/50">
                        <td className="py-1.5 px-3 font-mono text-muted-foreground">{d.sku}</td>
                        <td className="py-1.5 px-3">{d.color}</td>
                        <td className="py-1.5 px-3 font-semibold">{d.size}</td>
                        <td className="py-1.5 px-3">
                          <div className="flex items-center gap-1">
                            <Input
                              value={d.barcode}
                              onChange={e => updateDraft(idx, 'barcode', e.target.value)}
                              className="h-7 text-xs font-mono w-36"
                            />
                            <button
                              onClick={() => regenerateBarcode(idx)}
                              className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors shrink-0"
                              title="Gerar novo código"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-1.5 px-3">
                          <Input
                            type="number"
                            value={d.initialStock}
                            onChange={e => updateDraft(idx, 'initialStock', parseInt(e.target.value) || 0)}
                            className="h-7 text-xs text-center w-16 mx-auto"
                            min={0}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full" disabled={!name || !category || !brand || !salePrice || variantDrafts.length === 0}>
            Cadastrar Produto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
