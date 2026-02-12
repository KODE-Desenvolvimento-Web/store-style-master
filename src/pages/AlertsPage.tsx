import { useState } from 'react';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CheckCheck, AlertTriangle, XCircle, Package, DollarSign, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const alertConfig = {
  low_stock: { icon: AlertTriangle, label: 'Estoque Baixo', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-l-yellow-500' },
  out_of_stock: { icon: XCircle, label: 'Esgotado', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-l-destructive' },
  new_arrival: { icon: Package, label: 'Nova Chegada', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-l-blue-500' },
  price_change: { icon: DollarSign, label: 'Preço', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-l-emerald-500' },
} as const;

type AlertFilter = 'all' | 'unread' | 'low_stock' | 'out_of_stock';

const AlertsPage = () => {
  const { alerts, markAlertRead, markAllAlertsRead, unreadAlerts } = useInventoryContext();
  const [filter, setFilter] = useState<AlertFilter>('all');

  const filtered = [...alerts]
    .filter(a => {
      if (filter === 'unread') return !a.read;
      if (filter === 'low_stock') return a.type === 'low_stock';
      if (filter === 'out_of_stock') return a.type === 'out_of_stock';
      return true;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const filters: { key: AlertFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'Todos', count: alerts.length },
    { key: 'unread', label: 'Não lidos', count: unreadAlerts },
    { key: 'out_of_stock', label: '🔴 Esgotados', count: alerts.filter(a => a.type === 'out_of_stock').length },
    { key: 'low_stock', label: '🟡 Estoque Baixo', count: alerts.filter(a => a.type === 'low_stock').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Avisos</h1>
          <p className="text-muted-foreground mt-1">
            {unreadAlerts > 0 ? `${unreadAlerts} aviso(s) não lido(s)` : 'Todos os avisos foram lidos'}
          </p>
        </div>
        {unreadAlerts > 0 && (
          <Button variant="outline" onClick={markAllAlertsRead} className="gap-2">
            <CheckCheck className="w-4 h-4" />
            Marcar todos como lidos
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === f.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {f.label}
            {f.count !== undefined && f.count > 0 && (
              <span className={`ml-1.5 text-xs ${filter === f.key ? 'opacity-80' : 'opacity-60'}`}>({f.count})</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(alert => {
          const config = alertConfig[alert.type] ?? alertConfig.low_stock;
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={`rounded-xl p-4 flex items-start gap-4 transition-all border border-border ${config.border} border-l-4 ${
                !alert.read ? 'bg-card shadow-sm' : 'bg-muted/30 opacity-70'
              }`}
            >
              <div className={`mt-0.5 p-2 rounded-lg ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!alert.read ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                  {alert.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{alert.reference}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(alert.createdAt, "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
              {!alert.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => markAlertRead(alert.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  title="Marcar como lido"
                >
                  <BellOff className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">
              {filter === 'all' ? 'Nenhum aviso registrado' : 'Nenhum aviso neste filtro'}
            </p>
            <p className="text-sm mt-1">
              {filter === 'all'
                ? 'Avisos de estoque baixo e esgotado aparecerão aqui.'
                : 'Tente selecionar outro filtro acima.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
