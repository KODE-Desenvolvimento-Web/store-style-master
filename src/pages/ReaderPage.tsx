import { useState, useEffect, useRef } from 'react';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Keyboard, Search } from 'lucide-react';
import JsBarcode from 'jsbarcode';

export default function ReaderPage() {
  const { findByBarcode, products } = useInventoryContext();
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<ReturnType<typeof findByBarcode>>(null);
  const [notFound, setNotFound] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resultBarcodeRef = useRef<HTMLCanvasElement>(null);

  const handleSearch = (code: string) => {
    if (!code.trim()) return;
    const found = findByBarcode(code.trim());
    setResult(found);
    setNotFound(!found);
  };

  useEffect(() => {
    if (result && resultBarcodeRef.current) {
      try {
        JsBarcode(resultBarcodeRef.current, result.gridItem.barcode, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 8,
        });
      } catch (e) {
        console.error('Barcode render error:', e);
      }
    }
  }, [result]);

  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Get all barcodes for quick reference
  const allBarcodes = products.flatMap(p => p.grid.map(g => ({ barcode: g.barcode, product: p.name, color: g.color, size: g.size })));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Leitor de Código de Barras</h1>
        <p className="text-muted-foreground mt-1">Busque produtos pelo código de barras</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Input */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Keyboard className="w-4 h-4" />
            Entrada Manual / Leitor USB
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Digite ou escaneie o código de barras..."
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(manualCode)}
              className="font-mono"
            />
            <Button onClick={() => handleSearch(manualCode)} className="gap-2 shrink-0">
              <Search className="w-4 h-4" />
              Buscar
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Conecte um leitor USB de código de barras e escaneie diretamente neste campo.</p>
          </div>

          {/* Quick reference - show some barcodes to test */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Códigos para teste:</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {allBarcodes.slice(0, 8).map((b, i) => (
                <button
                  key={i}
                  onClick={() => { setManualCode(b.barcode); handleSearch(b.barcode); }}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted/50 transition-colors font-mono flex justify-between"
                >
                  <span>{b.barcode}</span>
                  <span className="text-muted-foreground">{b.product} · {b.color} {b.size}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Camera */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Camera className="w-4 h-4" />
            Câmera
          </div>
          {!cameraActive ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <Button onClick={startCamera} variant="outline">Ativar Câmera</Button>
              {cameraError && <p className="text-xs text-destructive">{cameraError}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden bg-foreground/5">
                <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-16 border-2 border-accent rounded-lg" />
                </div>
              </div>
              <Button onClick={stopCamera} variant="outline" size="sm" className="w-full">Desativar Câmera</Button>
              <p className="text-xs text-muted-foreground text-center">Posicione o código de barras dentro do retângulo</p>
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card rounded-xl p-6 border-l-4 border-l-success">
          <h3 className="text-lg font-heading font-semibold mb-4 text-success">Produto Encontrado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Produto:</span>
                <span className="font-medium">{result.product.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Referência:</span>
                <span className="font-mono">{result.product.reference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Marca:</span>
                <span>{result.product.brand}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Categoria:</span>
                <span>{result.product.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cor:</span>
                <span>{result.gridItem.color}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tamanho:</span>
                <span>{result.gridItem.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço:</span>
                <span className="font-bold">R$ {result.product.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estoque:</span>
                <span className={`font-bold ${
                  result.gridItem.quantity === 0 ? 'text-destructive' : result.gridItem.quantity <= result.gridItem.minStock ? 'text-warning' : 'text-success'
                }`}>{result.gridItem.quantity} un.</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <canvas ref={resultBarcodeRef} />
            </div>
          </div>
        </div>
      )}

      {notFound && (
        <div className="glass-card rounded-xl p-6 border-l-4 border-l-destructive">
          <p className="text-sm text-destructive font-medium">Código de barras não encontrado no sistema.</p>
        </div>
      )}
    </div>
  );
}
