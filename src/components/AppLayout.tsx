import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ScanBarcode, 
  Bell,
  ArrowRightLeft,
  ShoppingCart,
  History,
  Warehouse,
  Sun,
  Moon
} from 'lucide-react';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';

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
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Stokk logo" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="font-heading font-bold text-sidebar-primary text-lg leading-tight">Stokk</h1>
              <p className="text-xs text-sidebar-muted">Gerenciamento de Estoque</p>
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

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <button
            onClick={() => setDark(d => !d)}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{dark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <p className="text-xs text-sidebar-muted text-center">v2.0 — Stokk Pro</p>
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
