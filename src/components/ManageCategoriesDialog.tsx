import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageCategoriesDialog({ open, onOpenChange }: Props) {
  const { categories, addCategory, deleteCategory, products } = useInventoryContext();
  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Categoria já existe');
      return;
    }
    const result = await addCategory(trimmed);
    if (result) {
      setNewName('');
      toast.success(`Categoria "${trimmed}" criada`);
    } else {
      toast.error('Erro ao criar categoria');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const inUse = products.some(p => p.category === name);
    if (inUse) {
      toast.error(`Não é possível excluir "${name}" — há produtos usando esta categoria`);
      return;
    }
    await deleteCategory(id);
    toast.success(`Categoria "${name}" excluída`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nova categoria..."
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} size="icon" disabled={!newName.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat.name).length;
              return (
                <div key={cat.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{cat.name}</span>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {count} {count === 1 ? 'produto' : 'produtos'}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(cat.id, cat.name)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
            {categories.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">Nenhuma categoria cadastrada</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
