import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, MessageSquare, Code } from "lucide-react";
import UserManagementTabs from "./UserManagementTabs";
import Link from "next/link";
import { Button } from "../ui/button";

export default function AdminDashboard() {
  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto p-4 sm:p-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold font-headline text-slate-800">Painel do Administrador</h1>
            <p className="text-muted-foreground">Visão geral e gerenciamento da plataforma.</p>
          </div>
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

        <div className="grid grid-cols-1">
          <Card className="h-[70vh]">
            <UserManagementTabs />
          </Card>
        </div>
        
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/admin/developer" passHref>
            <Button variant="link">
              Painel do Desenvolvedor
            </Button>
          </Link>
        </footer>

      </div>
    </div>
  );
}
