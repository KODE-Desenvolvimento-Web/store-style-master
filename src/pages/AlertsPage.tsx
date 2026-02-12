import { useInventoryContext } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CheckCheck, AlertTriangle, XCircle, Package, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const alertIcons = {
  low_stock: AlertTriangle,
  out_of_stock: XCircle,
  new_arrival: Package,
  price_change: DollarSign,
};

const alertColors = {
  low_stock: 'text-warning',
  out_of_stock: 'text-destructive',
  new_arrival: 'text-info',
  price_change: 'text-accent',
};

export default function AlertsPage() {
  const { alerts, markAlertRead, markAllAlertsRead, unreadAlerts } = useInventoryContext();

  const sorted = [...alerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

      <div className="space-y-2">
        {sorted.map(alert => {
          const Icon = alertIcons[alert.type];
          const colorClass = alertColors[alert.type];
          return (
            <div
              key={alert.id}
              className={`glass-card rounded-xl p-4 flex items-start gap-4 transition-all ${
                !alert.read ? 'border-l-4 border-l-accent' : 'opacity-70'
              }`}
            >
              <div className={`mt-0.5 ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!alert.read ? 'font-semibold' : 'font-medium'}`}>{alert.message}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">{alert.reference}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(alert.createdAt), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
              {!alert.read && (
                <Button variant="ghost" size="sm" onClick={() => markAlertRead(alert.id)} className="shrink-0">
                  <BellOff className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum aviso registrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
