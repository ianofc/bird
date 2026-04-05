import { useLyv } from "@/context/lyvcontext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Lyv, 
  LogOut, 
  Home, 
  Users, 
  Settings, 
  BarChart3, 
  Bell, 
  TrendingUp,
  Activity,
  DollarSign
} from "lucide-react";

export default function Index() {
  const { currentUser, logout } = useLyv();

  const stats = [
    { title: 'Total de Usuários', value: '1,234', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { title: 'Receita Mensal', value: 'R$ 45,678', change: '+8%', icon: DollarSign, color: 'bg-green-500' },
    { title: 'Atividades', value: '89', change: '+23%', icon: Activity, color: 'bg-purple-500' },
    { title: 'Taxa de Conversão', value: '3.2%', change: '+5%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Lyv className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              LYV
            </span>
          </div>

          {/* Ações do usuário */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{currentUser?.username || 'Usuário'}</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white">
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] hidden lg:block">
          <nav className="p-4 space-y-1">
            <NavItem icon={Home} label="Dashboard" active />
            <NavItem icon={Users} label="Usuários" />
            <NavItem icon={BarChart3} label="Relatórios" />
            <NavItem icon={Settings} label="Configurações" />
            
            <Separator className="my-4" />
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, {currentUser?.username || 'Usuário'}! 👋
            </h1>
            <p className="text-gray-500">
              Bem-vindo ao seu dashboard. Aqui está o resumo de hoje.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <Badge variant="secondary" className="mt-2 text-green-600 bg-green-50">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Bem-vindo ao LYV!</CardTitle>
                <CardDescription>Login realizado com sucesso</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Você está autenticado como <strong>{currentUser?.username}</strong>.
                  O sistema está operacional e pronto para uso.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>Informações atuais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Autenticação</span>
                  <Badge className="bg-green-500">Ativa</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sessão</span>
                  <Badge className="bg-blue-500">Válida</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Token</span>
                  <Badge className="bg-purple-500">Presente</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

// Componente auxiliar para itens de navegação
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const NavItem = ({ icon: Icon, label, active }: NavItemProps) => (
  <button
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);
