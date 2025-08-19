
'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, User, MapPin, Download, FileText, BarChart2, FileType, PlusCircle, AlertCircle, CloudOff, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";


const initialRides = [
  { id: '1', date: '25/07/2024', passenger: 'João Passageiro', origin: 'Shopping Pátio', destination: 'Centro', value: '25.50', status: 'Concluída', startedBy: 'passenger', synced: true },
  { id: '2', date: '24/07/2024', passenger: 'Maria Silva', origin: 'Aeroporto', destination: 'Zona Rural Leste', value: '150.00', status: 'Concluída', startedBy: 'passenger', synced: true },
  { id: '3', date: '22/07/2024', passenger: 'Passageiro Anônimo', origin: 'Rodoviária', destination: 'Bairro Universitário', value: '18.00', status: 'Concluída', startedBy: 'driver', synced: true },
  { id: '4', date: '20/07/2024', passenger: 'Fernanda Lima', origin: 'Centro', destination: 'Hospital Regional', value: '15.00', status: 'Cancelada', startedBy: 'passenger', synced: true },
];

// Mock data for the driver
const driverData = {
    name: "Carlos Motorista",
    cnpj: "12.345.678/0001-90"
};

const appData = {
    name: "CEOLIN Mobilidade Urbana",
    cnpj: "99.999.999/0001-99"
}

export function DriverRideHistory() {
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [rides, setRides] = useState(initialRides);
    const [newRide, setNewRide] = useState({ passenger: 'Passageiro Anônimo', origin: '', destination: '', value: '' });
    const { toast } = useToast();
    const [isOffline, setIsOffline] = useState(false); // Simula o estado da rede

    const handleExportCSV = () => {
        const headers = ["ID", "Data", "Passageiro", "Origem", "Destino", "Valor (R$)", "Status", "Iniciada Por"];
        const rows = rides.map(ride => 
            [ride.id, ride.date, ride.passenger, `"${ride.origin}"`, `"${ride.destination}"`, ride.value.replace('.', ','), ride.status, ride.startedBy].join(',')
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
        const completedRides = rides.filter(r => r.status === 'Concluída');
        const totalValue = completedRides.reduce((acc, ride) => acc + parseFloat(ride.value), 0);
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
                ride.date,
                ride.passenger,
                `${ride.origin} -> ${ride.destination}`,
                `R$ ${ride.value.replace('.', ',')}`,
                ride.status,
            ];
            tableRows.push(rideData);
        });

        // Header
        doc.setFont("sans-serif", "bold");
        doc.setFontSize(20);
        doc.text(appData.name, 14, 22);
        
        doc.setFont("sans-serif", "normal");
        doc.setFontSize(10);
        doc.text(`CNPJ: ${appData.cnpj}`, 14, 28);
        
        doc.setFontSize(16);
        doc.setFont("sans-serif", "bold");
        doc.text("Relatório de Corridas", 14, 40);
        
        doc.setFont("sans-serif", "normal");
        doc.setFontSize(12);
        doc.text(`Motorista: ${driverData.name}`, 14, 50);
        if (driverData.cnpj) {
            doc.text(`CNPJ do Motorista: ${driverData.cnpj}`, 14, 56);
        }
        doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 62);


        // Table
        (doc as any).autoTable({
            startY: 70,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }, // Cor primária
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.setFont("sans-serif", "bold");
        doc.text("Resumo de Ganhos", 14, finalY + 15);
        doc.setFontSize(12);
        doc.setFont("sans-serif", "normal");
        doc.text(`Total de Corridas Concluídas: ${summary.totalRides}`, 14, finalY + 22);
        doc.text(`Valor Total Arrecadado: R$ ${summary.totalValue}`, 14, finalY + 29);
        

        doc.save("relatorio_corridas_ceolin.pdf");
    }

    const handleAddNewRide = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRide.origin || !newRide.destination || !newRide.value) {
            toast({
                variant: 'destructive',
                title: 'Campos obrigatórios',
                description: 'Por favor, preencha todos os campos para registrar a corrida.',
            });
            return;
        }

        const newRideData = {
            id: (rides.length + 1).toString(),
            date: new Date().toLocaleDateString('pt-BR'),
            passenger: newRide.passenger || 'Passageiro Anônimo',
            origin: newRide.origin,
            destination: newRide.destination,
            value: parseFloat(newRide.value).toFixed(2),
            status: 'Concluída',
            startedBy: 'driver' as const,
            synced: !isOffline,
        };

        setRides(prevRides => [newRideData, ...prevRides]);
        toast({
            title: isOffline ? 'Corrida Salva Localmente!' : 'Corrida Registrada!',
            description: isOffline 
                ? 'A corrida será enviada ao servidor assim que a conexão for restaurada.'
                : 'A nova corrida foi adicionada ao seu histórico.',
        });
        
        // Reset form and close dialog
        setNewRide({ passenger: 'Passageiro Anônimo', origin: '', destination: '', value: '' });
        // This is a workaround to close the dialog. A better approach is to control the open state.
        document.getElementById('close-new-ride-dialog')?.click();
    };

    const handleSync = () => {
        toast({
            title: "Sincronizando...",
            description: "Enviando dados de corridas offline para o servidor."
        });
        setTimeout(() => {
            setRides(prevRides => prevRides.map(r => ({ ...r, synced: true })));
            toast({
                title: "Sincronização Concluída!",
                description: "Todos os dados foram enviados com sucesso."
            });
        }, 2000);
    }

  if (rides.length === 0) {
      return (
        <div>
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border rounded-lg bg-card">
                    <History className="h-10 w-10 mb-4" />
                    <p className="font-semibold">Nenhuma corrida encontrada</p>
                    <p className="text-sm">Seu histórico de corridas aparecerá aqui.</p>
            </div>
        </div>
      )
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
                            Iniciar Nova Corrida
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
                                <div className="text-xs text-muted-foreground p-2 text-center border rounded-md">
                                    Status da Rede: 
                                    <span className={isOffline ? 'text-destructive font-bold' : 'text-green-600 font-bold'}>
                                        {isOffline ? ' OFFLINE' : ' ONLINE'}
                                    </span>.
                                    <Button type="button" variant="link" size="sm" className="h-auto p-0 ml-1" onClick={() => setIsOffline(!isOffline)}>
                                        (Simular {isOffline ? 'Online' : 'Offline'})
                                    </Button>
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
        <div>
            {rides.some(r => !r.synced) && (
                <div className="mb-4">
                    <Button onClick={handleSync} className="w-full" variant="secondary">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sincronizar Corridas Offline ({rides.filter(r => !r.synced).length})
                    </Button>
                </div>
            )}
            <ScrollArea className="h-[60vh] sm:h-96 w-full">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Passageiro/Data</TableHead>
                        <TableHead>Trajeto</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {rides.map((ride) => (
                        <TableRow key={ride.id}>
                        <TableCell>
                            <div className="font-medium flex items-center gap-2">
                               <User className="h-3 w-3" />
                               {ride.passenger}
                               {ride.startedBy !== 'passenger' && (
                                   <TooltipProvider>
                                       <Tooltip>
                                           <TooltipTrigger>
                                               <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                           </TooltipTrigger>
                                           <TooltipContent>
                                               <p>Corrida iniciada pelo motorista.</p>
                                           </TooltipContent>
                                       </Tooltip>
                                   </TooltipProvider>
                               )}
                               {!ride.synced && (
                                    <TooltipProvider>
                                       <Tooltip>
                                           <TooltipTrigger>
                                                <CloudOff className="h-4 w-4 text-destructive" />
                                           </TooltipTrigger>
                                           <TooltipContent>
                                               <p>Esta corrida foi salva localmente e ainda não foi sincronizada com o servidor.</p>
                                           </TooltipContent>
                                       </Tooltip>
                                   </TooltipProvider>
                               )}
                            </div>
                            <div className="text-sm text-muted-foreground">{ride.date}</div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2 text-xs"><MapPin className="h-3 w-3 text-primary" /> {ride.origin}</div>
                            <div className="flex items-center gap-2 text-xs"><MapPin className="h-3 w-3 text-accent" /> {ride.destination}</div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">R$ {ride.value.replace('.', ',')}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    </div>
  );
}
