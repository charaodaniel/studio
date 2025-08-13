import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SlidersHorizontal, ShieldCheck, Link as LinkIcon, Users } from "lucide-react";
import UserManagementTable from "./UserManagementTable";
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline text-slate-800">Painel do Administrador</h1>
        <p className="text-muted-foreground">Gerencie todos os aspectos da plataforma CEOLIN Mobilidade Urbana.</p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users /> Gerenciamento de Usuários</CardTitle>
          <CardDescription>Adicione, edite e gerencie todos os usuários da plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal/> Ferramentas Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                <AccordionTrigger>Verificação de Relatórios</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Insira o ID de um relatório para verificar sua autenticidade.</p>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input type="text" placeholder="ID do Relatório" />
                        <Button type="submit"><ShieldCheck className="mr-2 h-4 w-4"/>Verificar</Button>
                    </div>
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                <AccordionTrigger>Configurações da Plataforma</AccordionTrigger>
                <AccordionContent>
                    <div className="flex items-center space-x-2">
                        <Switch id="anonymous-rides" />
                        <Label htmlFor="anonymous-rides">Permitir corridas de passageiros anônimos</Label>
                    </div>
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                <AccordionTrigger>Painel do Desenvolvedor</AccordionTrigger>
                <AccordionContent>
                    <p className="text-sm text-muted-foreground">Acesse a área técnica para monitoramento do sistema.</p>
                    <Link href="/admin/developer" passHref>
                        <Button variant="link" className="px-0"><LinkIcon className="mr-2 h-4 w-4"/> Acessar Painel do Desenvolvedor</Button>
                    </Link>
                </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
