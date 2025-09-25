

'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, User, MapPin, Download, FileText, BarChart2, FileType, PlusCircle, AlertCircle, CloudOff, RefreshCw, Loader2, WifiOff, Calendar as CalendarIcon, AlertTriangle, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
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
import { addDays, format, startOfMonth, endOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { DateRange as ReactDateRange } from "react-day-picker";
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";

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
    scheduled_for?: string;
    ride_description?: string;
    expand?: {
        driver?: RecordModel;
        passenger?: RecordModel;
    }
}

interface DriverRideHistoryProps {
    onManualRideStart: (ride: RideRecord) => void;
    setDriverStatus: (status: string) => void;
}

const appData = {
    name: "CEOLIN Mobilidade Urbana",
    cnpj: "52.905.738/0001-00"
}

export function DriverRideHistory({ onManualRideStart, setDriverStatus }: DriverRideHistoryProps) {
    const [rides, setRides] = useState<RideRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [newRide, setNewRide] = useState({ origin: '', destination: '', value: '', passengerName: '' });
    const { toast } = useToast();
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportType, setReportType] = useState<'pdf' | 'csv' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    
    const [dateRange, setDateRange] = useState<ReactDateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfDay(new Date()),
    });

    // States for scheduling
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
    const [scheduledTime, setScheduledTime] = useState<string>('');


    const fetchRides = useCallback(async (filterOverride?: string) => {
        if (!pb.authStore.model?.id) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const driverId = pb.authStore.model.id;
            let filter = '';
            
            if (filterOverride) {
                filter = `driver = "${driverId}" && (${filterOverride})`;
            } else if (dateRange?.from && dateRange?.to) {
                const startDate = format(dateRange.from, "yyyy-MM-dd 00:00:00");
                const endDate = format(endOfDay(dateRange.to), "yyyy-MM-dd 23:59:59");
                filter = `driver = "${driverId}" && created >= "${startDate}" && created <= "${endDate}"`;
            } else {
                 setIsLoading(false);
                 return;
            }
            
            const result = await pb.collection('rides').getFullList<RideRecord>({
                filter: filter,
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
    }, [dateRange]);

    useEffect(() => {
        const handleAuthChange = (token: string, model: RecordModel | null) => {
            const userModel = model as UserData | null;
            setCurrentUser(userModel);
            if (userModel) {
                fetchRides();
            } else {
                setRides([]);
                setIsLoading(false);
            }
        }
        
        handleAuthChange(pb.authStore.token, pb.authStore.model);

        const unsubscribeAuth = pb.authStore.onChange(handleAuthChange);

        const handleRidesUpdate = (e: { record: RideRecord, action: string }) => {
            if (pb.authStore.model && e.record.driver === pb.authStore.model.id) {
                 fetchRides();
            }
        };

        pb.collection('rides').subscribe('*', handleRidesUpdate);

        return () => {
            pb.collection('rides').unsubscribe('*');
            unsubscribeAuth();
        };
    }, [fetchRides]);

    const fetchAllRides = async (): Promise<RideRecord[]> => {
        if (!currentUser) return [];
        try {
            return await pb.collection('rides').getFullList<RideRecord>({
                filter: `driver = "${currentUser.id}"`,
                sort: '-created',
                expand: 'passenger',
            });
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro ao buscar histórico completo." });
            return [];
        }
    };

    const handleGenerateReport = async (type: 'pdf' | 'csv', dateRange: DateRange, isCompleteReport: boolean) => {
        if (!currentUser) return;

        const ridesToExport = isCompleteReport
            ? await fetchAllRides()
            : await pb.collection('rides').getFullList<RideRecord>({
                filter: `driver = "${currentUser.id}" && created >= "${format(dateRange.from, 'yyyy-MM-dd 00:00:00')}" && created <= "${format(endOfDay(dateRange.to), 'yyyy-MM-dd 23:59:59')}"`,
                sort: '-created',
                expand: 'passenger',
            });

        if (ridesToExport.length === 0) {
            toast({ title: "Nenhuma corrida encontrada", description: "Não há corridas neste período para gerar um relatório." });
            return;
        }

        if (type === 'csv') {
            handleExportCSV(ridesToExport);
        } else {
            handleExportPDF(ridesToExport, dateRange, isCompleteReport);
        }
    };

    const handleExportCSV = (ridesToExport: RideRecord[]) => {
        const headers = ["ID", "Data", "Passageiro", "Origem", "Destino", "Valor (R$)", "Status"];
        const rows = ridesToExport.map(ride => 
            [
                ride.id, 
                ride.created ? new Date(ride.created).toLocaleString('pt-BR') : 'Data Inválida',
                ride.expand?.passenger?.name || ride.passenger_anonymous_name || (ride.started_by === 'driver' ? currentUser?.name : 'N/A'),
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
        link.setAttribute("download", `historico_${currentUser?.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = (ridesToExport: RideRecord[], dateRange: DateRange, isCompleteReport: boolean) => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        let finalY = 0;

        const validDateRides = ridesToExport.filter(ride => ride.created && !isNaN(new Date(ride.created).getTime()));
        const invalidDateRides = ridesToExport.filter(ride => !ride.created || isNaN(new Date(ride.created).getTime()));

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
                : `Período: ${dateRange.from.toLocaleDateString('pt-BR')} a ${dateRange.to.toLocaleDateString('pt-BR')}`;
            doc.text(periodText, pageWidth - 14, 27, { align: 'right' });
            
            doc.setDrawColor(200);
            doc.line(14, 30, pageWidth - 14, 30);
        };

        const drawFooter = () => {
            const pageCount = doc.internal.pages.length;
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
        doc.text(`Nome: ${currentUser?.name || 'N/A'}`, 14, 45);
        doc.text(`CNPJ: ${currentUser?.driver_cnpj || 'N/A'}`, 14, 50);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("INFORMAÇÕES DA PLATAFORMA", pageWidth - 14, 40, { align: 'right' });
        doc.setFontSize(9);
        doc.text(`Nome: ${appData.name}`, pageWidth - 14, 45, { align: 'right' });
        doc.text(`CNPJ: ${appData.cnpj}`, pageWidth - 14, 50, { align: 'right' });
        
        let startY = 62;

        if (validDateRides.length > 0) {
            const tableColumn = ["Data", "Passageiro", "Trajeto", "Valor (R$)", "Status"];
            const tableRows = validDateRides.map(ride => [
                new Date(ride.created).toLocaleString('pt-BR'),
                ride.expand?.passenger?.name || ride.passenger_anonymous_name || (ride.started_by === 'driver' ? currentUser?.name : 'N/A'),
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

        if (invalidDateRides.length > 0) {
            finalY += 10;
            doc.setFontSize(12);
            doc.setTextColor(40);
            doc.setFont('helvetica', 'bold');
            doc.text("Corridas com Data de Registro Inválida", 14, finalY);

            finalY += 5;
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(150);
            const warningText = "Aviso: Corridas anteriores a 13/09/2024 podem não exibir a data correta devido a um erro no servidor.";
            const splitText = doc.splitTextToSize(warningText, pageWidth - 28);
            doc.text(splitText, 14, finalY);
            finalY += (splitText.length * 3) + 2;


            const invalidTableColumn = ["Passageiro", "Trajeto", "Valor (R$)", "Status"];
            const invalidTableRows = invalidDateRides.map(ride => [
                ride.expand?.passenger?.name || ride.passenger_anonymous_name || (ride.started_by === 'driver' ? currentUser?.name : 'N/A'),
                `${ride.origin_address} -> ${ride.destination_address}`,
                `R$ ${ride.fare.toFixed(2).replace('.', ',')}`,
                ride.status,
            ]);

            (doc as any).autoTable({
                head: [invalidTableColumn],
                body: invalidTableRows,
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' }, // Orange header
                styles: { cellPadding: 3, fontSize: 9 },
                columnStyles: { 2: { halign: 'right' } },
                 didParseCell: (data: any) => {
                    if (data.column.dataKey === 3) {
                        if (data.cell.raw === 'completed') data.cell.styles.textColor = '#16a34a';
                        else if (data.cell.raw === 'canceled') data.cell.styles.textColor = '#dc2626';
                    }
                },
            });
            finalY = (doc as any).lastAutoTable.finalY || finalY;
        }

        // Performance Summary based only on valid rides
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
        doc.save("relatorio_corridas_ceolin.pdf");
    };

    const getFullScheduledDate = () => {
        if (!isScheduling || !scheduledDate || !scheduledTime) return undefined;
        const [hours, minutes] = scheduledTime.split(':');
        const date = new Date(scheduledDate);
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return date;
    }

    const timeOptions = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2);
        const minute = (i % 2) * 30;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    });

    const handleStartManualRide = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = pb.authStore.model as UserData | null;
        if (!user) return;
    
        if (!newRide.origin || !newRide.destination || !newRide.value) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios' });
            return;
        }

        const fullScheduledDate = getFullScheduledDate();
        if (isScheduling && !fullScheduledDate) {
            toast({ variant: 'destructive', title: 'Data/Hora de Agendamento Inválida' });
            return;
        }
    
        setIsSubmitting(true);
        try {
            const rideData: { [key: string]: any } = {
                driver: user.id,
                passenger_anonymous_name: newRide.passengerName || user.name, // Use provided name or driver's name
                origin_address: newRide.origin,
                destination_address: newRide.destination,
                fare: parseFloat(newRide.value),
                status: isScheduling ? 'requested' : 'accepted',
                started_by: 'driver',
                is_negotiated: false,
            };

            if (isScheduling && fullScheduledDate) {
                rideData.scheduled_for = fullScheduledDate.toISOString();
                rideData.ride_description = `Viagem agendada para ${format(fullScheduledDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}. Passageiro: ${newRide.passengerName}. Valor: R$ ${newRide.value}`;
            }

            const createdRide = await pb.collection('rides').create<RideRecord>(rideData);
    
            if (isScheduling) {
                toast({ title: 'Corrida Agendada!', description: 'A corrida agendada foi adicionada às suas solicitações.' });
                fetchRides();
            } else {
                toast({ title: 'Corrida Iniciada!', description: 'A corrida manual foi iniciada e está em andamento.' });
                onManualRideStart(createdRide);
            }

            setNewRide({ origin: '', destination: '', value: '', passengerName: '' });
            setIsScheduling(false);
            setScheduledDate(undefined);
            setScheduledTime('');
            document.getElementById('close-new-ride-dialog')?.click();
        } catch (error: any) {
            console.error("Failed to create manual ride:", error.data || error);
            const errorMessage = error.data?.message || "Não foi possível registrar a corrida.";
            toast({ variant: 'destructive', title: 'Erro ao Registrar', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartQuickRide = async () => {
        if (!currentUser) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não encontrado.' });
            return;
        }
        
        let fare = 0;
        let status: 'in_progress' | 'accepted' = 'in_progress';
        
        if (currentUser.driver_fare_type === 'fixed' && currentUser.driver_fixed_rate) {
            fare = currentUser.driver_fixed_rate;
        } else if (currentUser.driver_fare_type === 'km' && currentUser.driver_km_rate) {
            // For KM-based quick rides, we start with 0 and let the driver handle the final value.
            // But we need to go through the 'accepted' status to allow for the flow.
            status = 'accepted';
        }

        try {
            const rideData: Partial<RideRecord> = {
                driver: currentUser.id,
                status: status,
                started_by: 'driver',
                origin_address: 'Corrida Rápida',
                destination_address: 'A definir',
                fare: fare,
                is_negotiated: false,
                passenger_anonymous_name: 'Passageiro (Rápida)'
            };

            const newRide = await pb.collection('rides').create<RideRecord>(rideData);

            toast({ title: "Corrida Rápida Iniciada!", description: "A viagem está pronta para começar." });
            onManualRideStart(newRide);
            setDriverStatus('urban-trip');

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar a corrida rápida.' });
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
                            <p className="text-sm">Seu histórico de corridas para o período selecionado aparecerá aqui.</p>
                        </TableCell>
                    </TableRow>
                </TableBody>
            )
        }
        return (
            <TableBody>
                {rides.map((ride) => {
                    const dateStr = ride.created && !isNaN(new Date(ride.created).getTime()) 
                        ? new Date(ride.created).toLocaleString('pt-BR') 
                        : 'Data Inválida';

                    return (
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
                                <div className={`text-sm ${dateStr === 'Data Inválida' ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{dateStr}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-xs"><MapPin className="h-3 w-3 text-primary" /> {ride.origin_address}</div>
                                <div className="flex items-center gap-2 text-xs"><MapPin className="h-3 w-3 text-accent" /> {ride.destination_address}</div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">R$ {ride.fare.toFixed(2).replace('.', ',')}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        );
    }
    
  return (
    <>
    <div className="bg-card p-4 rounded-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
                <h3 className="font-headline text-lg">Suas Viagens</h3>
                <p className="text-sm text-muted-foreground">Filtre e gerencie suas corridas concluídas.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[260px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                                    </>
                                ) : (
                                    format(dateRange.from, "dd/MM/yy")
                                )
                            ) : (
                                <span>Escolha uma data</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            locale={ptBR}
                        />
                    </PopoverContent>
                </Popover>
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => fetchRides('created = null || created = ""')} disabled={isLoading}>
                                    <AlertTriangle className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Ver corridas com data inválida</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button variant="ghost" size="icon" onClick={() => fetchRides()} disabled={isLoading}>
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-end gap-2 mb-4">
             <Button variant="secondary" onClick={handleStartQuickRide}>
                <Zap className="mr-2 h-4 w-4" />
                Corrida Rápida
            </Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar Corrida
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <form onSubmit={handleStartManualRide}>
                        <DialogHeader>
                            <DialogTitle>Registrar Nova Corrida</DialogTitle>
                            <DialogDescription>
                                Preencha os dados para uma corrida combinada ou agendada.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-1">
                                <Label htmlFor="passenger-name">Nome do Passageiro</Label>
                                <Input id="passenger-name" value={newRide.passengerName} onChange={(e) => setNewRide(prev => ({ ...prev, passengerName: e.target.value }))} required placeholder="Ex: João Silva" />
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
                                <Label htmlFor="ride-value">Valor Combinado (R$)</Label>
                                <Input id="ride-value" type="number" step="0.01" value={newRide.value} onChange={(e) => setNewRide(prev => ({ ...prev, value: e.target.value }))} required placeholder="25.50" />
                            </div>
                            
                            <div className="space-y-2 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="scheduling-switch" className="font-semibold">Agendar para o futuro?</Label>
                                    <Switch id="scheduling-switch" checked={isScheduling} onCheckedChange={setIsScheduling} />
                                </div>
                                {isScheduling && (
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("justify-start text-left font-normal", !scheduledDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {scheduledDate ? format(scheduledDate, "dd/MM/yy") : <span>Data</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus locale={ptBR} /></PopoverContent>
                                        </Popover>
                                        <Select value={scheduledTime} onValueChange={setScheduledTime}>
                                            <SelectTrigger><Clock className="mr-2 h-4 w-4" /><SelectValue placeholder="Horário" /></SelectTrigger>
                                            <SelectContent>{timeOptions.map(time => (<SelectItem key={time} value={time}>{time}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" id="close-new-ride-dialog" disabled={isSubmitting}>Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isScheduling ? 'Agendar Corrida' : 'Iniciar Corrida Agora'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
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
    {currentUser && reportType && (
        <ReportFilterModal
            isOpen={isReportModalOpen}
            onOpenChange={setIsReportModalOpen}
            onGenerateReport={(dateRange, isCompleteReport) => {
                handleGenerateReport(reportType, dateRange, isCompleteReport);
            }}
            userName={currentUser.name}
        />
    )}
    </>
  );
}

