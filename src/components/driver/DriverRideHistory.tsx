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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import pb from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";
import type { User as UserData } from '../admin/UserList';
import { Skeleton } from "../ui/skeleton";

interface RideRecord extends RecordModel {
    passenger: string;
    driver: string;
    origin_address: string;
    destination_address: string;
    status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled';
    fare: number;
    is_negotiated: boolean;
    started_by: 'passenger' | 'driver';
    passenger_anonymous_name?: string;
    expand?: {
        driver?: RecordModel;
        passenger?: RecordModel; // Passenger can be expanded now
    }
}

const appData = {
    name: "CEOLIN Mobilidade Urbana",
    cnpj: "99.999.999/0001-99"
}

export function DriverRideHistory() {
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [rides, setRides] = useState<RideRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [newRide, setNewRide] = useState({ passenger: 'Passageiro Anônimo', origin: '', destination: '', value: '' });
    const { toast } = useToast();
    
    const currentUser = pb.authStore.model as UserData | null;

    const fetchRides = useCallback(async () => {
        if (!pb.authStore.model) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const driverId = pb.authStore.model.id;
            // Fetch and expand passenger, but handle cases where it might not be a real user
            const result = await pb.collection('rides').getFullList<RideRecord>({
                filter: `driver = "${driverId}"`,
                sort: '-created',
                expand: 'passenger', // Expand passenger to get their name
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
                new Date(ride.created).toLocaleDateString('pt-BR'), 
                ride.started_by === 'driver' ? ride.passenger_anonymous_name : ride.expand?.passenger?.name || 'Passageiro da Plataforma', 
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
        const tableColumn = ["Data", "Passageiro", "Trajeto", "Valor (R$)", "Status"];
        const tableRows: (string | null)[][] = [];

        rides.forEach(ride => {
            const rideData = [
                new Date(ride.created).toLocaleDateString('pt-BR'),
                ride.started_by === 'driver' ? ride.passenger_anonymous_name : ride.expand?.passenger?.name || 'Passageiro da Plataforma',
                `${ride.origin_address} -> ${ride.destination_address}`,
                `R$ ${ride.fare.toFixed(2).replace('.', ',')}`,
                ride.status,
            ];
            tableRows.push(rideData);
        });

        // Header
        doc.setFontSize(18);
        doc.text("Relatório de Corridas", 14, 22);
        doc.setFontSize(11);
        doc.text(`Motorista: ${currentUser?.name || 'N/A'}`, 14, 32);
        doc.text(`CNPJ Motorista: ${currentUser?.driver_cnpj || 'N/A'}`, 14, 38);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 44);

        doc.setFontSize(11);
        doc.text(`Plataforma: ${appData.name}`, 140, 32);
        doc.text(`CNPJ Plataforma: ${appData.cnpj}`, 140, 38);

        // Summary
        doc.setFontSize(12);
        doc.text("Resumo do Período", 14, 56);
        doc.setFontSize(11);
        doc.text(`Total de Corridas: ${summary.totalRides}`, 14, 62);
        doc.text(`Valor Total: R$ ${summary.totalValue}`, 14, 68);

        (doc as any).autoTable({
            startY: 75, head: [tableColumn], body: tableRows, theme: 'striped', headStyles: { fillColor: [37, 99, 235] },
        });

        doc.save("relatorio_corridas_ceolin.pdf");
    }

    const handleAddNewRide = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pb.authStore.model) return;

        if (!newRide.origin || !newRide.destination || !newRide.value) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios' });
            return;
        }

        try {
            const data = {
                driver: pb.authStore.model.id,
                // For manual rides, set the passenger to be the driver themselves.
                // This satisfies the "required" constraint.
                passenger: pb.authStore.model.id, 
                origin_address: newRide.origin,
                destination_address: newRide.destination,
                fare: parseFloat(newRide.value),
                status: 'completed' as 'completed',
                started_by: 'driver' as 'driver',
                is_negotiated: false,
                passenger_anonymous_name: newRide.passenger,
            };
            await pb.collection('rides').create(data);

            toast({ title: 'Corrida Registrada!', description: 'A nova corrida foi adicionada ao seu histórico.' });
            fetchRides(); // Re-fetch the list
            setNewRide({ passenger: 'Passageiro Anônimo', origin: '', destination: '', value: '' });
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
                           {ride.started_by === 'driver' ? ride.passenger_anonymous_name : ride.expand?.passenger?.name || 'Passageiro'}
                           {ride.started_by === 'driver' && (
                               <TooltipProvider>
                                   <Tooltip>
                                       <TooltipTrigger>
                                           <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                       </TooltipTrigger>
                                       <TooltipContent>
                                           <p>Corrida registrada manualmente pelo motorista.</p>
                                       </TooltipContent>
                                   </Tooltip>
                               </TooltipProvider>
                           )}
                        </div>
                        <div className="text-sm text-muted-foreground">{new Date(ride.created).toLocaleDateString('pt-BR')}</div>
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
                                <div className="space-y-1">
                                    <Label htmlFor="passenger-name">Nome do Passageiro (Opcional)</Label>
                                    <Input id="passenger-name" value={newRide.passenger} onChange={(e) => setNewRide(prev => ({ ...prev, passenger: e.target.value }))} placeholder="Passageiro Anônimo" />
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
