import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Car, MessageSquare, MonitorPlay } from "lucide-react";
import Link from 'next/link';

export default function OperatorDashboard() {
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-headline text-slate-800">Painel de Operações</h1>
          <p className="text-muted-foreground">Monitore a plataforma em tempo real e preste suporte.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Motoristas Online</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">128</div>
                    <p className="text-xs text-muted-foreground">Disponíveis para corridas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Corridas em Andamento</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground">Passageiros em trânsito</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Aguardando suporte</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1"><MonitorPlay className="mr-2 h-5 w-5"/> Monitoramento da Frota</Button>
                <Link href="/operator/conversations" passHref className="flex-1">
                    <Button size="lg" variant="secondary" className="w-full">
                        <MessageSquare className="mr-2 h-5 w-5"/> Ir para Conversas
                    </Button>
                </Link>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
