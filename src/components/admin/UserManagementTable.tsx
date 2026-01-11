
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
import { MoreHorizontal, FileDown, Edit, UserPlus, ListVideo, FileText, WifiOff, Loader2, Info, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import type { User } from "./UserList";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { cn } from "@/lib/utils";
import AddUserForm from "./AddUserForm";
import UserProfile from "./UserProfile";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ReportFilterModal, { type DateRange } from "../shared/ReportFilterModal";
import { endOfDay } from "date-fns";
import DriverStatusLogModal from "./DriverStatusLogModal";
import { useDatabaseManager } from "@/hooks/use-database-manager";

interface DatabaseContent {
  users: User[];
  rides: any[];
  documents: any[];
  chats: any[];
  messages: any[];
  institutional_info: any;
}


const appData = {
    company_name: "CEOLIN LTDA",
    cnpj: "52.905.738/0001-00"
};
  
export default function UserManagementTable() {
    const { toast } = useToast();
    const { data: db, isLoading, error, saveData, fetchData } = useDatabaseManager<DatabaseContent>();
    const [users, setUsers] = useState<User[]>([]);
    
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
    const [selectedUserForLog, setSelectedUserForLog] = useState<User | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedUserForReport, setSelectedUserForReport] = useState<User | null>(null);
    const [reportType, setReportType] = useState<'pdf' | 'csv' | null>(null);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    
    useEffect(() => {
        if (db?.users) {
            const sortedUsers = [...db.users].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
            setUsers(sortedUsers);
        }
    }, [db]);
    
    const handleActionComplete = async (getNewData: (currentData: DatabaseContent) => DatabaseContent, toastMessage?: {title: string, description: string}) => {
        await saveData(getNewData);
        if (toastMessage) {
            toast(toastMessage);
        }
        setSelectedUserForEdit(null);
        setIsAddUserOpen(false);
    }
    
    const handleGenerateReport = async (driver: User, type: 'pdf' | 'csv', dateRange: DateRange, isCompleteReport: boolean) => {
        
        let ridesToExport: any[] = [];
        if (!db) return;

        let allDriverRides = db.rides.filter(r => r.driver === driver.id);

        if (isCompleteReport) {
            ridesToExport = allDriverRides;
        } else {
             const startDate = dateRange.from.getTime();
             const endDate = endOfDay(dateRange.to).getTime();
             ridesToExport = allDriverRides.filter(ride => {
                 const rideDate = new Date(ride.created).getTime();
                 return rideDate >= startDate && rideDate <= endDate;
             });
        }

        if (ridesToExport.length === 0) {
            toast({ title: "Nenhuma corrida encontrada", description: `O motorista ${driver.name} não possui corridas no período selecionado.` });
            return;
        }
        if (type === 'csv') {
            handleGenerateCSV(driver, ridesToExport);
        } else {
            handleGeneratePDF(driver, ridesToExport, dateRange, isCompleteReport);
        }
    };

    const getPassengerName = (ride: any) => {
        if (ride.passenger_anonymous_name) return ride.passenger_anonymous_name;
        
        if (!db) return "N/A";
        const passenger = db.users.find(u => u.id === ride.passenger);
        if (passenger) return passenger.name;

        return "N/A";
    }

    const handleGenerateCSV = (driver: User, rides: any[]) => {
        const headers = ["ID", "Data", "Passageiro", "Origem", "Destino", "Valor (R$)", "Status"];
        const rows = rides.map(ride => 
            [
                ride.id, 
                ride.created ? new Date(ride.created).toLocaleString('pt-BR') : 'Data Inválida', 
                getPassengerName(ride),
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

    const handleGeneratePDF = (driver: User, rides: any[], dateRange: DateRange, isCompleteReport: boolean) => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        let finalY = 0;

        const validDateRides = rides.filter(ride => ride.created);
        
        const drawHeader = () => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(41, 121, 255);
            doc.text("CEOLIN", 14, 22);
            
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.setFont('helvetica', 'bold');
            doc.text("Relatório de Corridas", pageWidth - 14, 22, { align: 'right' });

            doc.setFontSize(9);
            doc.setTextColor(100);
            const periodText = isCompleteReport 
                ? "Período: Completo"
                : `Período: ${new Date(dateRange.from).toLocaleDateString('pt-BR')} a ${new Date(dateRange.to).toLocaleDateString('pt-BR')}`;
            doc.text(periodText, pageWidth - 14, 27, { align: 'right' });
            
            doc.setDrawColor(200);
            doc.line(14, 30, pageWidth - 14, 30);
        };

        const drawFooter = () => {
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
            }
        };

        drawHeader();

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
        doc.text(`Nome: ${appData.company_name}`, pageWidth - 14, 45, { align: 'right' });
        doc.text(`CNPJ: ${appData.cnpj}`, pageWidth - 14, 50, { align: 'right' });
        
        let startY = 62;

        if (validDateRides.length > 0) {
            const tableColumn = ["Data", "Passageiro", "Trajeto", "Valor (R$)", "Status"];
            const tableRows = validDateRides.map(ride => [
                    new Date(ride.created).toLocaleString('pt-BR'),
                    getPassengerName(ride),
                    `${ride.origin_address} -> ${ride.destination_address}`,
                    `R$ ${ride.fare.toFixed(2).replace('.', ',')}`,
                    ride.status,
                ]);
            
            (doc as any).autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: startY,
                theme: 'grid',
                headStyles: { fillColor: [41, 121, 255], textColor: 255, fontStyle: 'bold' },
                styles: { cellPadding: 3, fontSize: 9 },
                columnStyles: { 3: { halign: 'right' } },
                didParseCell: (data: any) => {
                    if (data.column.dataKey === 4) { 
                        if (data.cell.raw === 'completed') data.cell.styles.textColor = '#16a34a';
                        else if (data.cell.raw === 'canceled') data.cell.styles.textColor = '#dc2626';
                    }
                },
            });
            finalY = (doc as any).lastAutoTable.finalY || 75;
        } else {
             finalY = startY;
        }
        
        const completedRides = validDateRides.filter(r => r.status === 'completed');
        const totalValue = completedRides.reduce((acc, ride) => acc + ride.fare, 0);

        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text("Resumo de Desempenho (Corridas Válidas)", 14, finalY + 12);
        
        (doc as any).autoTable({
            startY: finalY + 17,
            head: [['Métrica', 'Total', 'Valor']],
            body: [
                ['Corridas Concluídas', completedRides.length.toString(), `R$ ${totalValue.toFixed(2).replace('.', ',')}`],
                ['Corridas Canceladas (Válidas)', validDateRides.filter(r => r.status === 'canceled').length.toString(), 'R$ 0,00'],
                ['Total de Corridas (Válidas)', validDateRides.length.toString(), `R$ ${totalValue.toFixed(2).replace('.', ',')}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [241, 245, 249] , textColor: 20 },
            bodyStyles: { fontStyle: 'bold' },
             columnStyles: { 
                0: { fontStyle: 'normal' },
                2: { halign: 'right' } 
            },
        });

        drawFooter();
        doc.save(`relatorio_${driver.name.replace(/\s+/g, '_')}.pdf`);
    };

    const handleToggleUserStatus = async (user: User) => {
        const getNewData = (currentData: DatabaseContent): DatabaseContent => {
             const updatedUsers = currentData.users.map(u => 
                u.id === user.id ? { ...u, disabled: !user.disabled } : u
            );
            return {...currentData, users: updatedUsers};
        };
        
        await handleActionComplete(
            getNewData,
            { title: "Status Alterado", description: `O status de ${user.name} foi alterado.`}
        );
    }
    
    const getRoleForDisplay = (role: string | string[]): string => {
        if (Array.isArray(role)) {
            return role.join(', ');
        }
        return role || 'N/A';
    };

    const hasRole = (userRole: string | string[], roleToCheck: string): boolean => {
        if (Array.isArray(userRole)) {
            return userRole.includes(roleToCheck);
        }
        return userRole === roleToCheck;
    };
    
    return (
        <>
             <div className="flex justify-between items-center mb-4">
                 {error && <div className="text-destructive font-semibold">
                    <Info className="inline mr-2" />
                    Erro ao carregar dados. As edições estão desativadas.
                 </div>}
                 <div className="flex-grow"></div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={!!error}><UserPlus className="mr-2 h-4 w-4"/> Adicionar Usuário</Button>
                    </DialogTrigger>
                     <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                            <DialogDescription>Preencha os dados para criar um novo usuário.</DialogDescription>
                        </DialogHeader>
                        <AddUserForm onUserAdded={(newUser) => {
                             const getNewData = (currentData: DatabaseContent): DatabaseContent => {
                                 return { ...currentData, users: [...currentData.users, newUser] };
                             };
                             handleActionComplete(getNewData, { title: "Usuário Adicionado", description: `O usuário ${newUser.name} foi adicionado.` });
                        }} />
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
                    {!isLoading && error && (
                         <TableRow>
                            <TableCell colSpan={5} className="text-center p-8 text-destructive">
                                <WifiOff className="mx-auto h-8 w-8 mb-2" />
                                <p>{error}</p>
                            </TableCell>
                         </TableRow>
                    )}
                    {!isLoading && !error && users.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                             <Badge variant={
                                hasRole(user.role, 'Admin') ? 'destructive' : 
                                hasRole(user.role, 'Motorista') ? 'default' : 'secondary'
                            }>{getRoleForDisplay(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={!user.disabled ? 'outline' : 'secondary'} className={!user.disabled ? "border-green-500 text-green-600" : ""}>{user.disabled ? 'Inativo' : 'Ativo'}</Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!!error}>
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => setSelectedUserForEdit(user)}>
                                    <Edit className="mr-2 h-4 w-4"/>Editar / Ver Perfil
                                </DropdownMenuItem>
                                {hasRole(user.role, 'Motorista') && (
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
                                                <DropdownMenuItem onSelect={() => { setSelectedUserForReport(user); setReportType('pdf'); setIsReportModalOpen(true); }}>
                                                    <FileText className="mr-2 h-4 w-4" /> PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => { setSelectedUserForReport(user); setReportType('csv'); setIsReportModalOpen(true); }}>
                                                    <FileText className="mr-2 h-4 w-4" /> CSV
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className={cn("focus:bg-red-100", user.disabled ? "text-green-600 focus:text-green-700 focus:bg-green-100" : "text-red-600 focus:text-red-700")}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4"/>{user.disabled ? "Ativar Usuário" : "Desativar Usuário"}
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                               Esta ação vai {user.disabled ? 'ativar' : 'desativar'} o usuário na plataforma.
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
            
             <Dialog open={!!selectedUserForEdit} onOpenChange={(isOpen) => !isOpen && setSelectedUserForEdit(null)}>
                {selectedUserForEdit && (
                     <DialogContent className="p-0 sm:max-w-lg md:max-w-xl">
                        <DialogHeader className="p-4 sr-only">
                            <DialogTitle>Editar Perfil do Usuário</DialogTitle>
                        </DialogHeader>
                        <UserProfile 
                            user={selectedUserForEdit}
                            onBack={() => setSelectedUserForEdit(null)} 
                            onUserUpdate={(updatedUser) => {
                                const getNewData = (currentData: DatabaseContent): DatabaseContent => {
                                    const updatedUsers = currentData.users.map(u => u.id === updatedUser.id ? updatedUser : u);
                                    return { ...currentData, users: updatedUsers };
                                };
                                handleActionComplete(getNewData, { title: "Usuário Atualizado", description: "Os dados do usuário foram salvos." });
                            }}
                        />
                     </DialogContent>
                )}
            </Dialog>
            <Dialog open={!!selectedUserForLog} onOpenChange={(isOpen) => !isOpen && setSelectedUserForLog(null)}>
                {selectedUserForLog && (
                     <DialogContent>
                        <DriverStatusLogModal user={selectedUserForLog} />
                     </DialogContent>
                )}
            </Dialog>
             {selectedUserForReport && reportType && (
                <ReportFilterModal
                    isOpen={isReportModalOpen}
                    onOpenChange={setIsReportModalOpen}
                    onGenerateReport={(dateRange, isCompleteReport) => {
                        if (selectedUserForReport && reportType) {
                            handleGenerateReport(selectedUserForReport, reportType, dateRange, isCompleteReport);
                        }
                    }}
                    userName={selectedUserForReport.name}
                />
            )}
      </>
    );
  }
