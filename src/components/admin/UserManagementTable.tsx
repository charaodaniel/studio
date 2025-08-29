
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileDown, Trash2, Edit, UserPlus, ListVideo, FileText, WifiOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import type { User } from "./UserList";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { cn } from "@/lib/utils";
import DriverStatusLogModal from "./DriverStatusLogModal";
import AddUserForm from "./AddUserForm";
import { ScrollArea } from "../ui/scroll-area";
import UserProfile from "./UserProfile";
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { RecordModel } from "pocketbase";

interface RideRecord extends RecordModel {
    passenger: string | null;
    driver: string;
    origin_address: string;
    destination_address: string;
    status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled';
    fare: number;
    is_negotiated: boolean;
    started_by: 'passenger' | 'driver';
    passenger_anonymous_name?: string;
    created: string;
    updated: string;
    expand?: {
        driver?: RecordModel;
        passenger?: RecordModel;
    }
}

const appData = {
    name: "CEOLIN Mobilidade Urbana",
    cnpj: "52.905.738/0001-00"
}
  
  export default function UserManagementTable() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUserForLog, setSelectedUserForLog] = useState<User | null>(null);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);


    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const records = await pb.collection('users').getFullList<User>({ sort: '-created' }, { admin: true });
            setUsers(records);
        } catch (err: any) {
            setError("Não foi possível carregar os usuários. Verifique a conexão com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchRidesForDriver = async (driverId: string): Promise<RideRecord[]> => {
        try {
            const result = await pb.collection('rides').getFullList<RideRecord>({
                filter: `driver = "${driverId}"`,
                sort: '-created',
                expand: 'passenger',
            });
            return result;
        } catch (err: any) {
            console.error("Failed to fetch rides for report:", err);
            toast({
                variant: 'destructive',
                title: 'Erro ao buscar corridas',
                description: 'Não foi possível gerar o relatório.'
            });
            return [];
        }
    }

    const handleGenerateCSV = async (driver: User) => {
        const rides = await fetchRidesForDriver(driver.id);
        if (rides.length === 0) {
            toast({ title: "Nenhuma corrida encontrada", description: `O motorista ${driver.name} não possui corridas no histórico.` });
            return;
        }
        
        const headers = ["ID", "Data", "Passageiro", "Origem", "Destino", "Valor (R$)", "Status"];
        const rows = rides.map(ride => 
            [
                ride.id, 
                new Date(ride.updated).toLocaleDateString('pt-BR'), 
                ride.expand?.passenger?.name || ride.passenger_anonymous_name || 'N/A', 
                `"${ride.origin_address}"`, `"${ride.destination_address}"`, 
                ride.fare.toFixed(2).replace('.', ','), 
                ride.status, 
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(',') + "\n" 
            + rows.join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `historico_${driver.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGeneratePDF = async (driver: User) => {
        const rides = await fetchRidesForDriver(driver.id);
         if (rides.length === 0) {
            toast({ title: "Nenhuma corrida encontrada", description: `O motorista ${driver.name} não possui corridas no histórico.` });
            return;
        }

        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        
        const drawHeader = (data: any) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(220, 38, 38); // Red color for CEOLIN
            doc.text("CEOLIN", 14, 22);
            
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.setFont('helvetica', 'bold');
            doc.text("Relatório de Corridas", pageWidth - 14, 22, { align: 'right' });
            doc.setDrawColor(200);
            doc.line(14, 30, pageWidth - 14, 30);
        };

        const drawFooter = (data: any) => {
            const pageCount = doc.internal.pages.length;
            doc.setFontSize(8);
            doc.setTextColor(150);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
            }
        };

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("INFORMAÇÕES DO MOTORISTA", 14, 40);
        doc.setFontSize(9);
        doc.text(`Nome: ${driver.name || 'N/A'}`, 14, 45);
        doc.text(`CNPJ: ${driver.driver_cnpj || 'N/A'}`, 14, 50);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("INFORMAÇÕES DA PLATAFORMA", pageWidth - 14, 40, { align: 'right' });
        doc.setFontSize(9);
        doc.text(`Nome: ${appData.name}`, pageWidth - 14, 45, { align: 'right' });
        doc.text(`CNPJ: ${appData.cnpj}`, pageWidth - 14, 50, { align: 'right' });

        const summary = {
            totalRides: rides.filter(r => r.status === 'completed').length,
            totalValue: rides.filter(r => r.status === 'completed').reduce((acc, ride) => acc + ride.fare, 0).toFixed(2).replace('.', ','),
        };

        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text("Resumo do Período", 14, 65);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Total de Corridas Concluídas: ${summary.totalRides}`, 14, 70);
        doc.text(`Valor Total Arrecadado: R$ ${summary.totalValue}`, pageWidth - 14, 70, { align: 'right' });

        const tableColumn = ["Data", "Passageiro", "Trajeto", "Valor (R$)", "Status"];
        const tableRows: (string | null)[][] = rides.map(ride => [
            new Date(ride.updated).toLocaleDateString('pt-BR'),
            ride.expand?.passenger?.name || ride.passenger_anonymous_name || 'N/A',
            `${ride.origin_address} -> ${ride.destination_address}`,
            `R$ ${ride.fare.toFixed(2).replace('.', ',')}`,
            ride.status,
        ]);
        
        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 75,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' }, // Red header
            styles: { cellPadding: 3, fontSize: 9 },
            columnStyles: { 3: { halign: 'right' } },
            didDrawPage: drawHeader,
        });

        drawFooter(doc);
        doc.save(`relatorio_${driver.name.replace(/\s+/g, '_')}.pdf`);
    };

    const handleToggleUserStatus = async (user: User) => {
      const newStatus = !user.disabled;
      try {
        await pb.collection('users').update(user.id, { disabled: newStatus });
        toast({
          title: "Status Alterado!",
          description: `O usuário ${user.name} foi ${newStatus ? 'desativado' : 'ativado'}.`
        });
        fetchUsers();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: "Não foi possível alterar o status do usuário."
        });
      }
    }
    
    return (
        <>
             <div className="flex justify-end mb-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button><UserPlus className="mr-2 h-4 w-4"/> Adicionar Usuário</Button>
                    </DialogTrigger>
                     <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                        <DialogDescription>Preencha os campos abaixo para criar um novo usuário.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[80vh]">
                        <AddUserForm onUserAdded={fetchUsers} />
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Perfil</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                        <span className="sr-only">Ações</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                     {isLoading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center p-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      )}
                      {error && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-destructive p-8">
                             <WifiOff className="mx-auto h-8 w-8 mb-2" />
                            {error}
                          </TableCell>
                        </TableRow>
                      )}
                    {!isLoading && !error && users.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge variant={
                                user.role === 'Admin' ? 'destructive' : 
                                user.role === 'Motorista' ? 'default' : 'secondary'
                            }>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={!user.disabled ? 'outline' : 'secondary'} className={!user.disabled ? "border-green-500 text-green-600" : ""}>{user.disabled ? 'Inativo' : 'Ativo'}</Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => setSelectedUserForEdit(user)}>
                                    <Edit className="mr-2 h-4 w-4"/>Editar / Ver Perfil
                                </DropdownMenuItem>
                                {user.role === 'Motorista' && (
                                    <>
                                        <DropdownMenuItem onSelect={() => setSelectedUserForLog(user)}>
                                            <ListVideo className="mr-2 h-4 w-4"/>Ver Log de Status
                                        </DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <FileDown className="mr-2 h-4 w-4" />
                                                Gerar Relatório
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onSelect={() => handleGeneratePDF(user)}><FileText className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleGenerateCSV(user)}><FileText className="mr-2 h-4 w-4" /> CSV</DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className={cn("text-red-600 focus:bg-red-100 focus:text-red-700", user.disabled && "text-green-600 focus:bg-green-100 focus:text-green-700")}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4"/>{user.disabled ? "Ativar" : "Desativar"}
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação vai {user.disabled ? "reativar" : "desativar"} o acesso do usuário ${user.name} à plataforma.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleToggleUserStatus(user)} className={user.disabled ? '' : 'bg-destructive hover:bg-destructive/90'}>
                                                Sim, {user.disabled ? "Ativar" : "Desativar"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
            
            <Dialog open={!!selectedUserForLog} onOpenChange={(isOpen) => !isOpen && setSelectedUserForLog(null)}>
                 {selectedUserForLog && (
                    <DialogContent>
                        <DriverStatusLogModal user={selectedUserForLog} />
                    </DialogContent>
                )}
            </Dialog>

            <Dialog open={!!selectedUserForEdit} onOpenChange={(isOpen) => !isOpen && setSelectedUserForEdit(null)}>
                {selectedUserForEdit && (
                     <DialogContent className="p-0 sm:max-w-lg md:max-w-xl">
                        <DialogHeader className="p-4 sr-only">
                            <DialogTitle>Editar Perfil do Usuário</DialogTitle>
                        </DialogHeader>
                        <UserProfile 
                            user={selectedUserForEdit} 
                            onBack={() => setSelectedUserForEdit(null)} 
                            onContact={() => { /* Not needed here */ }} 
                            isModal={true} 
                            onUserUpdate={() => {
                                fetchUsers();
                                setSelectedUserForEdit(null);
                            }}
                        />
                     </DialogContent>
                )}
            </Dialog>
      </>
    );
  }
