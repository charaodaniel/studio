
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, MessageSquare, ListChecks } from "lucide-react";
import Link from 'next/link';
import Logo from "../shared/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import OperatorConversationsPage from "./OperatorConversationsPage";
import DriverStatusList from "./DriverStatusList";

export default function OperatorDashboard() {
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <header className="mb-8">
           <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
            <Logo className="h-6 w-6" />
            <span className="font-semibold font-headline">CEOLIN Mobilidade Urbana</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold font-headline text-slate-800">Painel de Operações</h1>
            <p className="text-muted-foreground">Monitore a plataforma em tempo real e preste suporte.</p>
          </div>
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
              <CardTitle className="text-sm font-medium">Chamados Urgentes</CardTitle>
              <Car className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Prioridade alta</p>
            </CardContent>
          </Card>
        </div>

        <Card className="h-[70vh]">
          <Tabs defaultValue="status" className="w-full h-full flex flex-col">
            <div className="p-2 border-b">
                <TabsList>
                    <TabsTrigger value="status"><ListChecks className="mr-2 h-4 w-4"/> Status dos Motoristas</TabsTrigger>
                    <TabsTrigger value="conversations"><MessageSquare className="mr-2 h-4 w-4"/> Conversas</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="status" className="flex-grow mt-0 overflow-hidden">
                <DriverStatusList />
            </TabsContent>
            <TabsContent value="conversations" className="flex-grow mt-0 overflow-hidden">
                <OperatorConversationsPage />
            </TabsContent>
          </Tabs>
        </Card>

      </div>
    </div>
  );
}
