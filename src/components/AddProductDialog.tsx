import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { SIZES, COLORS, CATEGORIES, GridItem } from '@/types/inventory';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateBarcode(): string {
  return '789' + Math.random().toString().slice(2, 12).padEnd(10, '0');
}

export default function AddProductDialog({ open, onOpenChange }: Props) {
  const { addProduct } = useInventoryContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minStock, setMinStock] = useState('3');

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handleSubmit = () => {
    if (!name || !category || !brand || !price) return;

    const prefix = category.slice(0, 3).toUpperCase();
    const reference = `${prefix}-${String(Date.now()).slice(-4)}`;

    const grid: GridItem[] = [];
    let idx = 0;
    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        grid.push({
          id: `new-${idx++}`,
          size,
          color,
          quantity: 0,
          barcode: generateBarcode(),
          minStock: parseInt(minStock) || 3,
        });
      }
    }

    addProduct({
      reference,
      name,
      category,
      brand,
      price: parseFloat(price),
      costPrice: parseFloat(costPrice) || 0,
      grid,
    });

    // Reset
    setName('');
    setCategory('');
    setBrand('');
    setPrice('');
    setCostPrice('');
    setSelectedSizes([]);
    setSelectedColors([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Preço de Custo (R$)</Label>
              <Input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Estoque Mínimo</Label>
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

          {selectedSizes.length > 0 && selectedColors.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Grade: {selectedColors.length} cores × {selectedSizes.length} tamanhos = {selectedColors.length * selectedSizes.length} variações
            </p>
          )}

          <Button onClick={handleSubmit} className="w-full" disabled={!name || !category || !brand || !price || selectedSizes.length === 0 || selectedColors.length === 0}>
            Cadastrar Produto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
