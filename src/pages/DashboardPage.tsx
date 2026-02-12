import { Package, ShoppingBag, AlertTriangle, XCircle } from 'lucide-react';
import { useInventoryContext } from '@/contexts/InventoryContext';

export default function DashboardPage() {
  const { products, totalProducts, totalItems, lowStockCount, outOfStockCount, alerts } = useInventoryContext();

  const stats = [
    { label: 'Produtos', value: totalProducts, icon: Package, color: 'bg-info/10 text-info' },
    { label: 'Peças em Estoque', value: totalItems, icon: ShoppingBag, color: 'bg-success/10 text-success' },
    { label: 'Estoque Baixo', value: lowStockCount, icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
    { label: 'Esgotados', value: outOfStockCount, icon: XCircle, color: 'bg-destructive/10 text-destructive' },
  ];

  const recentAlerts = alerts.filter(a => !a.read).slice(0, 5);

  const topProducts = [...products]
    .sort((a, b) => {
      const totalA = a.grid.reduce((s, g) => s + g.quantity, 0);
      const totalB = b.grid.reduce((s, g) => s + g.quantity, 0);
      return totalA - totalB;
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu estoque</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-heading font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-heading font-semibold mb-4">Alertas Recentes</h2>
          {recentAlerts.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum alerta pendente ✓</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    alert.type === 'out_of_stock' ? 'bg-destructive' : 'bg-warning'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Ref: {alert.reference}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-heading font-semibold mb-4">Produtos com Menor Estoque</h2>
          <div className="space-y-3">
            {topProducts.map(product => {
              const total = product.grid.reduce((s, g) => s + g.quantity, 0);
              return (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.reference} · {product.category}</p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    total === 0 
                      ? 'bg-destructive/10 text-destructive' 
                      : total <= 10 
                        ? 'bg-warning/10 text-warning' 
                        : 'bg-success/10 text-success'
                  }`}>
                    {total} un.
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
