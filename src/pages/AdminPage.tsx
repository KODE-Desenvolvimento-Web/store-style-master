import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, Activity, Shield,
  LogOut, Sun, Moon, Menu, X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const from = (table: string) => (supabase as any).from(table);

interface CompanyUser {
  id: string;
  email: string;
  company_name: string;
  cnpj: string;
  address: string;
  phone: string;
  plan: string;
  provider: string;
  is_active: boolean;
  created_at: string;
  role: string;
  total_products?: number;
  total_sales?: number;
}

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Painel', end: true },
  { to: '/admin/usuarios', icon: Users, label: 'Empresas' },
  { to: '/admin/planos', icon: CreditCard, label: 'Planos' },
  { to: '/admin/atividade', icon: Activity, label: 'Atividade' },
];

export default function AdminPage() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="flex min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-sidebar text-sidebar-foreground px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Stokk logo" className="w-8 h-8 rounded-lg" />
          <h1 className="font-heading font-bold text-sidebar-primary text-base">Admin</h1>
        </div>
        <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sidebar-primary text-lg leading-tight">Admin</h1>
              <p className="text-xs text-sidebar-muted">Painel Administrativo</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNav.map(item => {
            const isActive = item.to === '/admin' 
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.to);
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/admin'}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button onClick={() => setDark(d => !d)} className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{dark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <button onClick={signOut} className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-destructive hover:bg-sidebar-accent transition-all">
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Admin Dashboard
export function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, sales: 0, revenue: 0 });
  const [recentUsers, setRecentUsers] = useState<CompanyUser[]>([]);

  useEffect(() => {
    const load = async () => {
      const [profilesRes, productsRes, salesRes] = await Promise.all([
        from('profiles').select('*, user_roles(role)'),
        from('products').select('id', { count: 'exact', head: true }),
        from('sales').select('total'),
      ]);
      const users = (profilesRes.data ?? []).filter((p: any) => {
        const roles = (p.user_roles ?? []).map((r: any) => r.role);
        return !roles.includes('admin');
      });
      setStats({
        users: users.length,
        products: productsRes.count ?? 0,
        sales: (salesRes.data ?? []).length,
        revenue: (salesRes.data ?? []).reduce((s: number, r: any) => s + Number(r.total), 0),
      });
      setRecentUsers(users.slice(0, 5).map((p: any) => ({
        id: p.id, email: '', company_name: p.company_name, cnpj: p.cnpj,
        address: p.address, phone: p.phone, plan: p.plan, provider: p.provider,
        is_active: p.is_active, created_at: p.created_at, role: 'user',
      })));
    };
    load();
  }, []);

  const cards = [
    { label: 'Empresas', value: stats.users, color: 'bg-primary/10 text-primary' },
    { label: 'Produtos (total)', value: stats.products, color: 'bg-info/10 text-info' },
    { label: 'Vendas (total)', value: stats.sales, color: 'bg-success/10 text-success' },
    { label: 'Receita (total)', value: `R$ ${stats.revenue.toFixed(2)}`, color: 'bg-warning/10 text-warning' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className={`text-2xl font-heading font-bold mt-1 ${c.color.split(' ')[1]}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-heading font-semibold text-lg mb-4">Empresas Recentes</h2>
        {recentUsers.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma empresa cadastrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{u.company_name || 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground">{u.cnpj || 'CNPJ não informado'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${u.plan === 'premium' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                  {u.plan || 'free'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Admin Users Management
export function AdminUsers() {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState('free');
  const [newProvider, setNewProvider] = useState('');
  const [creating, setCreating] = useState(false);
  const [editUser, setEditUser] = useState<CompanyUser | null>(null);

  const fetchUsers = useCallback(async () => {
    const { data: profiles } = await from('profiles').select('*, user_roles(role)');
    if (!profiles) return;
    const mapped: CompanyUser[] = profiles.map((p: any) => {
      const roles = (p.user_roles ?? []).map((r: any) => r.role);
      return {
        id: p.id, email: '', company_name: p.company_name, cnpj: p.cnpj,
        address: p.address, phone: p.phone, plan: p.plan, provider: p.provider,
        is_active: p.is_active, created_at: p.created_at,
        role: roles.includes('admin') ? 'admin' : 'user',
      };
    });
    setUsers(mapped.filter(u => u.role !== 'admin'));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async () => {
    if (!newEmail || !newPassword || !newCompany) {
      toast.error('Preencha email, senha e nome da empresa');
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: { emailRedirectTo: window.location.origin },
      });

      if (error) {
        toast.error(error.message);
        setCreating(false);
        return;
      }

      if (data.user) {
        // Update profile with company info
        await from('profiles').update({
          company_name: newCompany,
          cnpj: newCnpj,
          address: newAddress,
          phone: newPhone,
          plan: newPlan,
          provider: newProvider,
        }).eq('id', data.user.id);
      }

      toast.success(`Empresa "${newCompany}" criada com sucesso!`);
      setShowCreate(false);
      setNewEmail(''); setNewPassword(''); setNewCompany(''); setNewCnpj('');
      setNewAddress(''); setNewPhone(''); setNewPlan('free'); setNewProvider('');
      fetchUsers();
    } catch (e: any) {
      toast.error('Erro ao criar empresa');
    }
    setCreating(false);
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    await from('profiles').update({ is_active: !currentActive }).eq('id', userId);
    toast.success(currentActive ? 'Empresa desativada' : 'Empresa ativada');
    fetchUsers();
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    await from('profiles').update({
      company_name: editUser.company_name,
      cnpj: editUser.cnpj,
      address: editUser.address,
      phone: editUser.phone,
      plan: editUser.plan,
      provider: editUser.provider,
    }).eq('id', editUser.id);
    toast.success('Empresa atualizada');
    setEditUser(null);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Empresas</h1>
          <p className="text-muted-foreground mt-1">Gerencie as empresas do sistema</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Users className="w-4 h-4" />
          Nova Empresa
        </Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left py-3 px-4 font-medium">Empresa</th>
              <th className="text-left py-3 px-4 font-medium">CNPJ</th>
              <th className="text-left py-3 px-4 font-medium">Plano</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-border/50">
                <td className="py-3 px-4">
                  <p className="font-medium">{u.company_name || 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground">{u.provider || '—'}</p>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{u.cnpj || '—'}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.plan === 'premium' ? 'bg-warning/10 text-warning' : u.plan === 'pro' ? 'bg-info/10 text-info' : 'bg-muted text-muted-foreground'}`}>
                    {u.plan || 'free'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {u.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditUser(u)}>Editar</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleActive(u.id, u.is_active)}
                      className={u.is_active ? 'text-destructive' : 'text-success'}>
                      {u.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhuma empresa cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Nova Empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome da Empresa *</Label>
                <Input value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Nome da empresa" />
              </div>
              <div>
                <Label>Email de Acesso *</Label>
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@empresa.com" />
              </div>
              <div>
                <Label>Senha *</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input value={newCnpj} onChange={e => setNewCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
              <div className="col-span-2">
                <Label>Endereço</Label>
                <Input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Endereço completo" />
              </div>
              <div>
                <Label>Provedor</Label>
                <Input value={newProvider} onChange={e => setNewProvider(e.target.value)} placeholder="Provedor/Revendedor" />
              </div>
              <div>
                <Label>Plano</Label>
                <Select value={newPlan} onValueChange={setNewPlan}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="pro">Profissional</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={creating || !newEmail || !newPassword || !newCompany}>
              {creating ? 'Criando...' : 'Criar Empresa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={open => { if (!open) setEditUser(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Editar Empresa</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome da Empresa</Label>
                  <Input value={editUser.company_name} onChange={e => setEditUser({ ...editUser, company_name: e.target.value })} />
                </div>
                <div>
                  <Label>CNPJ</Label>
                  <Input value={editUser.cnpj} onChange={e => setEditUser({ ...editUser, cnpj: e.target.value })} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={editUser.phone} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Endereço</Label>
                  <Input value={editUser.address} onChange={e => setEditUser({ ...editUser, address: e.target.value })} />
                </div>
                <div>
                  <Label>Provedor</Label>
                  <Input value={editUser.provider} onChange={e => setEditUser({ ...editUser, provider: e.target.value })} />
                </div>
                <div>
                  <Label>Plano</Label>
                  <Select value={editUser.plan} onValueChange={v => setEditUser({ ...editUser, plan: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="pro">Profissional</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleUpdateUser} className="w-full">Salvar Alterações</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Admin Plans
export function AdminPlans() {
  const plans = [
    { name: 'Gratuito', key: 'free', price: 'R$ 0', features: ['Até 50 produtos', 'Até 100 vendas/mês', '1 usuário'] },
    { name: 'Básico', key: 'basic', price: 'R$ 49/mês', features: ['Até 200 produtos', 'Vendas ilimitadas', '3 usuários', 'Relatórios básicos'] },
    { name: 'Profissional', key: 'pro', price: 'R$ 99/mês', features: ['Até 1.000 produtos', 'Vendas ilimitadas', '10 usuários', 'Relatórios avançados', 'Suporte prioritário'] },
    { name: 'Premium', key: 'premium', price: 'R$ 199/mês', features: ['Produtos ilimitados', 'Vendas ilimitadas', 'Usuários ilimitados', 'Relatórios avançados', 'Suporte VIP', 'API de integração'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Planos</h1>
        <p className="text-muted-foreground mt-1">Configure os planos disponíveis</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => (
          <div key={plan.key} className={`glass-card rounded-xl p-6 ${plan.key === 'premium' ? 'ring-2 ring-warning' : ''}`}>
            <h3 className="font-heading font-bold text-lg">{plan.name}</h3>
            <p className="text-2xl font-heading font-bold mt-2">{plan.price}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-3 h-3 text-success" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// Admin Activity
export function AdminActivity() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await from('inventory_logs').select('*').order('created_at', { ascending: false }).limit(50);
      setLogs(data ?? []);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Atividade</h1>
        <p className="text-muted-foreground mt-1">Logs de atividade recentes do sistema</p>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left py-3 px-4 font-medium">Data</th>
              <th className="text-left py-3 px-4 font-medium">Produto</th>
              <th className="text-left py-3 px-4 font-medium">Variante</th>
              <th className="text-left py-3 px-4 font-medium">Tipo</th>
              <th className="text-left py-3 px-4 font-medium">Qtd</th>
              <th className="text-left py-3 px-4 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t border-border/50">
                <td className="py-2 px-4 text-muted-foreground">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                <td className="py-2 px-4">{log.product_name}</td>
                <td className="py-2 px-4 text-muted-foreground">{log.variant_label}</td>
                <td className="py-2 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${log.type === 'IN' ? 'bg-success/10 text-success' : log.type === 'OUT' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'}`}>
                    {log.type}
                  </span>
                </td>
                <td className="py-2 px-4 font-mono">{log.quantity}</td>
                <td className="py-2 px-4 text-muted-foreground text-xs">{log.reason}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhuma atividade registrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
