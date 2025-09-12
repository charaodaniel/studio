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
import { useState, useEffect, useCallback, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { User as UserData } from '../admin/UserList';
import type { RecordModel, ListResult } from "pocketbase";
import pb from "@/lib/pocketbase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import ReportFilterModal, { type DateRange } from "../shared/ReportFilterModal";

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

interface DriverRideHistoryProps {
    onManualRideStart: (ride: RideRecord) => void;
}

const appData = {
    name: "CEOLIN Mobilidade Urbana",
    cnpj: "52.905.738/0001-00"
}

export function DriverRideHistory({ onManualRideStart }: DriverRideHistoryProps) {
    const [rides, setRides] = useState<RideRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [newRide, setNewRide] = useState({ passengerName: '', origin: '', destination: '', value: '' });
    const { toast } = useToast();
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportType, setReportType] = useState<'pdf' | 'csv' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const isFetching = useRef(false);

    const fetchRides = useCallback(async (pageNum = 1) => {
        if (!pb.authStore.model?.id || isFetching.current) return;
        
        isFetching.current = true;
        if (pageNum === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }
        setError(null);
        
        try {
            const driverId = pb.authStore.model.id;
            const result: ListResult<RideRecord> = await pb.collection('rides').getList(pageNum, 50, { // Fetch 50 items per page
                filter: `driver = "${driverId}"`,
                sort: '-created',
                expand: 'passenger',
            });
            
            setRides(prev => pageNum === 1 ? result.items : [...prev, ...result.items]);
            setPage(result.page);
            setTotalPages(result.totalPages);

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
            if (pageNum === 1) setIsLoading(false);
            else setIsLoadingMore(false);
            isFetching.current = false;
        }
    }, []);

    useEffect(() => {
        const handleAuthChange = (token: string, model: RecordModel | null) => {
            const userModel = model as UserData | null;
            setCurrentUser(userModel);
            if (userModel) {
                fetchRides(1); // Fetch first page on login
            } else {
                setRides([]);
                setIsLoading(false);
            }
        }
        
        handleAuthChange(pb.authStore.token, pb.authStore.model);

        const unsubscribeAuth = pb.authStore.onChange(handleAuthChange);

        const handleRidesUpdate = (e: { record: RideRecord, action: string }) => {
            if (pb.authStore.model && e.record.driver === pb.authStore.model.id) {
                 fetchRides(1);
            }
        };

        pb.collection('rides').subscribe('*', handleRidesUpdate);

        return () => {
            unsubscribeAuth();
            pb.realtime.unsubscribe();
        };
    }, [fetchRides]);

    const handleGenerateReport = async (type: 'pdf' | 'csv', dateRange: DateRange) => {
        if (!currentUser) return;
        const startDate = dateRange.from.toISOString().split('T')[0] + ' 00:00:00';
        const endDate = dateRange.to.toISOString().split('T')[0] + ' 23:59:59';

        const filteredRides = await pb.collection('rides').getFullList<RideRecord>({
            filter: `driver = "${currentUser.id}" && created >= "${startDate}" && created <= "${endDate}"`,
            sort: '-created',
            expand: 'passenger',
        });

        if (filteredRides.length === 0) {
            toast({ title: "Nenhuma corrida encontrada", description: "Não há corridas neste período para gerar um relatório." });
            return;
        }

        if (type === 'csv') {
            handleExportCSV(filteredRides);
        } else {
            handleExportPDF(filteredRides, dateRange);
        }
    };


    const handleExportCSV = (ridesToExport: RideRecord[]) => {
        const headers = ["ID", "Data", "Passageiro", "Origem", "Destino", "Valor (R$)", "Status", "Iniciada Por"];
        const rows = ridesToExport.map(ride => 
            [
                ride.id, 
                new Date(ride.updated).toLocaleString('pt-BR'), 
                ride.expand?.passenger?.name || ride.passenger_anonymous_name || (ride.started_by === 'driver' ? currentUser?.name : 'N/A'),
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

    const handleExportPDF = (ridesToExport: RideRecord[], dateRange: DateRange) => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        let finalY = 0;
        
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
            const periodText = `Período: ${dateRange.from.toLocaleDateString('pt-BR')} a ${dateRange.to.toLocaleDateString('pt-BR')}`;
            doc.text(periodText, pageWidth - 14, 27, { align: 'right' });
            
            doc.setDrawColor(200);
            doc.line(14, 30, pageWidth - 14, 30);
        };

        const drawFooter = () => {
            const pageCount = doc.internal.pages.length;
            doc.setFontSize(8);
            doc.setTextColor(150);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
            }
        };

        drawHeader();

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
        
        const hasManualRides = ridesToExport.some(ride => ride.started_by === 'driver');
        if (hasManualRides) {
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Aviso: Este relatório pode conter corridas registradas manualmente, que possuem dados limitados sobre o passageiro.", 14, 58);
        }

        const tableColumn = ["Data", "Passageiro", "Trajeto", "Valor (R$)", "Status"];
        const tableRows: (string | null)[][] = ridesToExport.map(ride => [
            new Date(ride.updated).toLocaleString('pt-BR'),
            ride.expand?.passenger?.name || ride.passenger_anonymous_name || (ride.started_by === 'driver' ? currentUser?.name : 'N/A'),
            `${ride.origin_address} -> ${ride.destination_address}`,
            `R$ ${ride.fare.toFixed(2).replace('.', ',')}`,
            ride.status,
        ]);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 62,
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
            didDrawPage: (data: any) => {},
            didParseCell: (data: any) => {
                // Color rows based on status
                if (data.column.dataKey === 4) { // Status column
                    if (data.cell.raw === 'completed') {
                        data.cell.styles.textColor = '#16a34a'; // green
                    } else if (data.cell.raw === 'canceled') {
                        data.cell.styles.textColor = '#dc2626'; // red
                    }
                }
            },
        });
        
        finalY = (doc as any).lastAutoTable.finalY || 75;

        // Performance Summary
        const completedRides = ridesToExport.filter(r => r.status === 'completed');
        const canceledRides = ridesToExport.filter(r => r.status === 'canceled');
        const totalRides = ridesToExport.length;
        const totalValue = completedRides.reduce((acc, ride) => acc + ride.fare, 0);

        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text("Resumo de Desempenho", 14, finalY + 10);
        
        (doc as any).autoTable({
            startY: finalY + 15,
            head: [['Métrica', 'Total', 'Valor']],
            body: [
                ['Corridas Concluídas', completedRides.length.toString(), `R$ ${totalValue.toFixed(2).replace('.', ',')}`],
                ['Corridas Canceladas', canceledRides.length.toString(), 'R$ 0,00'],
                ['Total de Corridas', totalRides.toString(), `R$ ${totalValue.toFixed(2).replace('.', ',')}`],
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
        doc.save("relatorio_corridas_ceolin.pdf");
    };


    const handleStartManualRide = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = pb.authStore.model;
        if (!user) return;
    
        if (!newRide.origin || !newRide.destination || !newRide.value) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios' });
            return;
        }
    
        setIsSubmitting(true);
        try {
            const data = {
                driver: user.id,
                passenger: null,
                passenger_anonymous_name: newRide.passengerName || user.name, // Fallback to driver's name
                origin_address: newRide.origin,
                destination_address: newRide.destination,
                fare: parseFloat(newRide.value),
                status: 'accepted', // Start as accepted to begin flow
                started_by: 'driver',
                is_negotiated: false,
            };
            const createdRide = await pb.collection('rides').create<RideRecord>(data, { expand: 'passenger' }); // expand passenger even if null
    
            toast({ title: 'Corrida Iniciada!', description: 'A corrida manual foi iniciada e está em andamento.' });
            
            onManualRideStart(createdRide);

            setNewRide({ passengerName: '', origin: '', destination: '', value: '' });
            document.getElementById('close-new-ride-dialog')?.click();
        } catch (error) {
            console.error("Failed to create manual ride:", error);
            toast({ variant: 'destructive', title: 'Erro ao Registrar', description: 'Não foi possível registrar a corrida.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <TableBody>
                    {[...Array(5)].map((_, i) => (
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
                           {ride.expand?.passenger?.name || ride.passenger_anonymous_name || (ride.started_by === 'driver' ? currentUser?.name : 'N/A')}
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
                        <div className="text-sm text-muted-foreground">{new Date(ride.updated).toLocaleString('pt-BR')}</div>
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
    <>
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
                        <form onSubmit={handleStartManualRide}>
                            <DialogHeader>
                                <DialogTitle>Iniciar Nova Corrida Manual</DialogTitle>
                                <DialogDescription>
                                    Preencha os dados para uma corrida iniciada presencialmente.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                               <div className="space-y-1">
                                    <Label htmlFor="passenger-name">Nome do Passageiro (Opcional)</Label>
                                    <Input id="passenger-name" value={newRide.passengerName} onChange={(e) => setNewRide(prev => ({ ...prev, passengerName: e.target.value }))} placeholder="Nome do passageiro" />
                                </div>
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
                                    <Button type="button" variant="secondary" id="close-new-ride-dialog" disabled={isSubmitting}>Cancelar</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Iniciar Corrida
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => { setReportType('pdf'); setIsReportModalOpen(true); }}>
                            <FileType className="mr-2 h-4 w-4" />
                            Relatório (PDF)
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setReportType('csv'); setIsReportModalOpen(true); }}>
                            <FileText className="mr-2 h-4 w-4" />
                            Histórico (CSV)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
        {page < totalPages && (
            <div className="mt-4 text-center">
                <Button onClick={() => fetchRides(page + 1)} disabled={isLoadingMore}>
                    {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Carregar Mais Corridas
                </Button>
            </div>
        )}
    </div>
    {currentUser && reportType && (
        <ReportFilterModal
            isOpen={isReportModalOpen}
            onOpenChange={setIsReportModalOpen}
            onGenerateReport={(dateRange) => {
                handleGenerateReport(reportType, dateRange);
            }}
            userName={currentUser.name}
        />
    )}
    </>
  );
}
