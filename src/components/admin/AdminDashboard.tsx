import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Car, MessageSquare, List } from "lucide-react";
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-headline text-slate-800">Painel do Administrador</h1>
          <p className="text-muted-foreground">Visão geral e gerenciamento da plataforma.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">152</div>
                    <p className="text-xs text-muted-foreground">Total de passageiros e motoristas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Corridas Hoje</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground">Corridas concluídas hoje</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tickets de Suporte</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">Aguardando resposta</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Ações de Gerenciamento</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Link href="/admin/conversations" passHref className="flex-1">
                    <Button size="lg" className="w-full">
                        <MessageSquare className="mr-2 h-5 w-5"/> Ver Conversas de Usuários
                    </Button>
                </Link>
                 <Link href="/admin/developer" passHref className="flex-1">
                    <Button size="lg" variant="secondary" className="w-full">
                        <List className="mr-2 h-5 w-5"/> Painel do Desenvolvedor
                    </Button>
                </Link>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
