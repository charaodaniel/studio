
'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, User, MapPin, Download, FileText, BarChart2, FileType, PlusCircle, AlertCircle, CloudOff, RefreshCw, Loader2, WifiOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { User as UserData } from '../admin/UserList';
import type { RecordModel } from "pocketbase";
import pb from "@/lib/pocketbase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

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

export function DriverRideHistory() {
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [rides, setRides] = useState<RideRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [newRide, setNewRide] = useState({ origin: '', destination: '', value: '' });
    const { toast } = useToast();
    
    const currentUser = pb.authStore.model as UserData | null;

    const fetchRides = useCallback(async () => {
        if (!pb.authStore.isValid || !pb.authStore.model?.id) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const driverId = pb.authStore.model.id;
            const result = await pb.collection('rides').getFullList<RideRecord>({
                filter: `driver = "${driverId}"`,
                sort: '-created',
                expand: 'passenger',
            });
            setRides(result);
        } catch (err: any) {
            console.error("Failed to fetch rides:", err);
             let errorMessage = "Não foi possível carregar seu histórico de corridas.";
            if (err.isAbort) {
                errorMessage += " A requisição demorou muito.";
            } else if (err.status === 0) {
                errorMessage += " Verifique sua conexão com a internet ou as configurações do servidor.";
            } else if (err.data?.message) {
                errorMessage += ` Detalhe: ${err.data.message}`;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRides();
    }, [fetchRides]);

    const handleExportCSV = () => {
        const headers = ["ID", "Data", "Passageiro", "Origem", "Destino", "Valor (R$)", "Status", "Iniciada Por"];
        const rows = rides.map(ride => 
            [
                ride.id, 
                new Date(ride.updated).toLocaleDateString('pt-BR'), 
                ride.expand?.passenger?.name || 'Passageiro Manual', 
                `"${ride.origin_address}"`, `"${ride.destination_address}"`, 
                ride.fare.toFixed(2).replace('.', ','), 
                ride.status, 
                ride.started_by
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(',') + "\n" 
            + rows.join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "historico_corridas_ceolin.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const calculateSummary = () => {
        const completedRides = rides.filter(r => r.status === 'completed');
        const totalValue = completedRides.reduce((acc, ride) => acc + ride.fare, 0);
        return {
            totalRides: completedRides.length,
            totalValue: totalValue.toFixed(2).replace('.', ','),
        }
    };

    const summary = calculateSummary();

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        
        const drawHeader = (data: any) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(41, 121, 255);
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
        doc.text(`Nome: ${currentUser?.name || 'N/A'}`, 14, 45);
        doc.text(`CNPJ: ${currentUser?.driver_cnpj || 'N/A'}`, 14, 50);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("INFORMAÇÕES DA PLATAFORMA", pageWidth - 14, 40, { align: 'right' });
        doc.setFontSize(9);
        doc.text(`Nome: ${appData.name}`, pageWidth - 14, 45, { align: 'right' });
        doc.text(`CNPJ: ${appData.cnpj}`, pageWidth - 14, 50, { align: 'right' });

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
            ride.expand?.passenger?.name || 'Passageiro Manual',
            `${ride.origin_address} -> ${ride.destination_address}`,
            `R$ ${ride.fare.toFixed(2).replace('.', ',')}`,
            ride.status,
        ]);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 75,
            theme: 'grid',
            headStyles: {
                fillColor: [41, 121, 255],
                textColor: 255,
                fontStyle: 'bold',
            },
            styles: {
                cellPadding: 3,
                fontSize: 9,
            },
            columnStyles: {
                3: { halign: 'right' }
            },
            didDrawPage: drawHeader,
        });

        drawFooter(doc);
        doc.save("relatorio_corridas_ceolin.pdf");
    };


    const handleAddNewRide = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pb.authStore.model) return;

        if (!newRide.origin || !newRide.destination || !newRide.value) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios' });
            return;
        }

        try {
            const now = new Date().toISOString();
            const data = {
                driver: pb.authStore.model.id,
                passenger: null,
                origin_address: newRide.origin,
                destination_address: newRide.destination,
                fare: parseFloat(newRide.value),
                status: 'completed',
                started_by: 'driver',
                is_negotiated: false,
                created: now,
                updated: now,
            };
            await pb.collection('rides').create(data);

            toast({ title: 'Corrida Registrada!', description: 'A nova corrida foi adicionada ao seu histórico.' });
            fetchRides(); // Re-fetch the list
            setNewRide({ origin: '', destination: '', value: '' });
            document.getElementById('close-new-ride-dialog')?.click();
        } catch (error) {
            console.error("Failed to create manual ride:", error);
            toast({ variant: 'destructive', title: 'Erro ao Registrar', description: 'Não foi possível registrar a corrida.'});
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            );
        }
        if (error) {
             return (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={3} className="text-center p-8 text-destructive">
                            <WifiOff className="mx-auto h-10 w-10 mb-2" />
                            <p className="font-semibold">Erro de Conexão</p>
                            <p className="text-sm">{error}</p>
                        </TableCell>
                    </TableRow>
                </TableBody>
            );
        }
        if (rides.length === 0) {
              return (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={3} className="text-center p-8 text-muted-foreground">
                            <History className="h-10 w-10 mb-4 mx-auto" />
                            <p className="font-semibold">Nenhuma corrida encontrada</p>
                            <p className="text-sm">Seu histórico de corridas aparecerá aqui.</p>
                        </TableCell>
                    </TableRow>
                </TableBody>
            )
        }
        return (
            <TableBody>
                {rides.map((ride) => (
                    <TableRow key={ride.id}>
                    <TableCell>
                        <div className="font-medium flex items-center gap-2">
                           <User className="h-3 w-3" />
                           {ride.expand?.passenger?.name || 'Passageiro Manual'}
                           {ride.started_by === 'driver' && (
                               <TooltipProvider>
                                   <Tooltip>
                                       <TooltipTrigger>
                                           <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                       </TooltipTrigger>
                                       <TooltipContent>
                                           <p>Corrida registrada manualmente por você.</p>
                                       </TooltipContent>
                                   </Tooltip>
                               </TooltipProvider>
                           )}
                        </div>
                        <div className="text-sm text-muted-foreground">{new Date(ride.updated).toLocaleDateString('pt-BR')}</div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-xs"><MapPin className="h-3 w-3 text-primary" /> {ride.origin_address}</div>
                        <div className="flex items-center gap-2 text-xs"><MapPin className="h-3 w-3 text-accent" /> {ride.destination_address}</div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">R$ {ride.fare.toFixed(2).replace('.', ',')}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );
    }
    
  return (
    <div className="bg-card p-4 rounded-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-4">
            <div>
                <h3 className="font-headline text-lg">Suas Viagens</h3>
                <p className="text-sm text-muted-foreground">Visualize e gerencie suas corridas concluídas.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar Corrida Manual
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleAddNewRide}>
                            <DialogHeader>
                                <DialogTitle>Registrar Nova Corrida</DialogTitle>
                                <DialogDescription>
                                    Preencha os dados para uma corrida iniciada presencialmente.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="origin-location">Local de Partida</Label>
                                        <Input id="origin-location" value={newRide.origin} onChange={(e) => setNewRide(prev => ({ ...prev, origin: e.target.value }))} required placeholder="Ex: Rua Principal, 123" />
                                    </div>
                                     <div className="space-y-1">
                                        <Label htmlFor="destination-location">Local de Destino</Label>
                                        <Input id="destination-location" value={newRide.destination} onChange={(e) => setNewRide(prev => ({ ...prev, destination: e.target.value }))} required placeholder="Ex: Shopping Center" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="ride-value">Valor da Corrida (R$)</Label>
                                    <Input id="ride-value" type="number" step="0.01" value={newRide.value} onChange={(e) => setNewRide(prev => ({ ...prev, value: e.target.value }))} required placeholder="25.50" />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" id="close-new-ride-dialog">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit">Registrar Corrida</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <AlertDialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportPDF}>
                                <FileType className="mr-2 h-4 w-4" />
                                Exportar Relatório (PDF)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportCSV}>
                                <FileText className="mr-2 h-4 w-4" />
                                Exportar Histórico (CSV)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsSummaryOpen(true)}>
                                <BarChart2 className="mr-2 h-4 w-4" />
                               Ver Resumo de Ganhos
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline">Resumo de Ganhos</AlertDialogTitle>
                        <AlertDialogDescription>
                           Este é um resumo dos seus ganhos com base nas corridas concluídas no seu histórico.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total de Corridas Concluídas:</span>
                                <span className="font-bold text-lg">{summary.totalRides}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Valor Total Arrecadado:</span>
                                <span className="font-bold text-lg text-primary">R$ {summary.totalValue}</span>
                            </div>
                        </div>
                        <AlertDialogFooter>
                        <AlertDialogAction>Fechar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
        <ScrollArea className="h-[60vh] sm:h-96 w-full">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Passageiro/Data</TableHead>
                    <TableHead>Trajeto</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                </TableRow>
                </TableHeader>
                {renderContent()}
            </Table>
        </ScrollArea>
    </div>
  );
}
