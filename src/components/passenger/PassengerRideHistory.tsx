'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Car, MapPin, WifiOff, Loader2, Calendar as CalendarIcon, RefreshCw, AlertTriangle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { addDays, format, startOfMonth, endOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { DateRange as ReactDateRange } from "react-day-picker";
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, onSnapshot, doc } from "firebase/firestore";
import { User } from "../admin/UserList";


interface RideRecord {
    id: string;
    passenger: string;
    driver: string;
    origin_address: string;
    destination_address: string;
    status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled';
    fare: number;
    is_negotiated: boolean;
    started_by: 'passenger' | 'driver';
    passenger_anonymous_name?: string;
    createdAt: any;
    updatedAt: any;
    expand?: {
        driver?: User;
    }
}

export function PassengerRideHistory() {
    const [rides, setRides] = useState<RideRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [dateRange, setDateRange] = useState<ReactDateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfDay(new Date()),
    });
    
    const fetchRides = useCallback(async (filterOverride?: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const passengerId = currentUser.uid;
            let q;
            
            if (filterOverride) {
                q = query(collection(db, 'rides'), where('passenger', '==', passengerId), where('createdAt', '==', null));
            } else if (dateRange?.from && dateRange?.to) {
                const startDate = dateRange.from;
                const endDate = endOfDay(dateRange.to);
                q = query(collection(db, 'rides'), where('passenger', '==', passengerId), where('createdAt', '>=', startDate), where('createdAt', '<=', endDate), orderBy('createdAt', 'desc'));
            } else {
                setIsLoading(false);
                return;
            }

            const querySnapshot = await getDocs(q);
            const rideRecords: RideRecord[] = [];
            for (const docSnap of querySnapshot.docs) {
                const ride = { id: docSnap.id, ...docSnap.data() } as RideRecord;
                if (ride.driver) {
                    const driverDoc = await getDoc(doc(db, 'users', ride.driver));
                    if (driverDoc.exists()) {
                        ride.expand = { driver: { id: driverDoc.id, ...driverDoc.data() } as User };
                    }
                }
                rideRecords.push(ride);
            }
            
            setRides(rideRecords);

        } catch (err: any) {
            console.error("Failed to fetch rides:", err);
            setError("Não foi possível carregar seu histórico de corridas.");
        } finally {
            setIsLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchRides();
            } else {
                setRides([]);
                setIsLoading(false);
            }
        });
        
        return () => unsubscribe();
    }, [fetchRides]);
    
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
                {rides.map((ride) => {
                    const dateStr = ride.createdAt?.toDate ? new Date(ride.createdAt.toDate()).toLocaleString('pt-BR') : 'Data Inválida';

                    return (
                        <TableRow key={ride.id}>
                            <TableCell>
                                <div className="font-medium flex items-center gap-2">
                                <Car className="h-3 w-3" />
                                {ride.expand?.driver?.name || "Motorista não definido"}
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
    <div className="bg-card p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
             <h3 className="font-headline text-lg">Histórico de Viagens</h3>
             <div className="flex gap-2 w-full sm:w-auto">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
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
                                <Button variant="outline" size="icon" onClick={() => fetchRides('createdAt = null')} disabled={isLoading}>
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
        <ScrollArea className="h-96 w-full">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Motorista/Data</TableHead>
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
