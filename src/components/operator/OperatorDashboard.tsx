import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Car, MessageSquare, MonitorPlay } from "lucide-react";
import Link from 'next/link';
import MapPlaceholder from "../passenger/MapPlaceholder";
import Logo from "../shared/Logo";

export default function OperatorDashboard() {
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold font-headline text-slate-800">Painel de Operações</h1>
            <p className="text-muted-foreground">Monitore a plataforma em tempo real e preste suporte.</p>
          </div>
           <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Logo className="h-6 w-6" />
            <span className="font-semibold font-headline">CEOLIN Mobilidade Urbana</span>
          </Link>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/operator/conversations" passHref>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" /> Ver Conversas
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MonitorPlay className="h-5 w-5"/> Monitoramento da Frota</CardTitle>
            </CardHeader>
            <CardContent className="h-[60vh] p-0">
                <MapPlaceholder />
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
