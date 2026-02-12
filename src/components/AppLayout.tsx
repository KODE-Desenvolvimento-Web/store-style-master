import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ScanBarcode, 
  Bell,
  Shirt,
  ArrowRightLeft,
  ShoppingCart,
  History,
  Warehouse
} from 'lucide-react';
import { useInventoryContext } from '@/contexts/InventoryContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/estoque', icon: Warehouse, label: 'Estoque' },
  { to: '/vendas', icon: ShoppingCart, label: 'Vendas' },
  { to: '/historico', icon: History, label: 'Histórico' },
  { to: '/operacoes', icon: ArrowRightLeft, label: 'Operações' },
  { to: '/etiquetas', icon: Tags, label: 'Etiquetas' },
  { to: '/leitor', icon: ScanBarcode, label: 'Leitor' },
  { to: '/avisos', icon: Bell, label: 'Avisos' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { unreadAlerts } = useInventoryContext();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Shirt className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sidebar-primary text-lg leading-tight">StockWear</h1>
              <p className="text-xs text-sidebar-muted">Gestão de Estoque</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-sidebar-accent text-sidebar-primary' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.to === '/avisos' && unreadAlerts > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse-soft">
                    {unreadAlerts}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-muted text-center">v2.0 — StockWear Pro</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
