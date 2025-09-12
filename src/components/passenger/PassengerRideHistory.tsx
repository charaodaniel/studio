'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Car, MapPin, WifiOff, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import pb from "@/lib/pocketbase";
import type { RecordModel, ListResult } from "pocketbase";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

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
    created: string;
    updated: string;
    expand?: {
        driver?: RecordModel;
    }
}

export function PassengerRideHistory() {
    const [rides, setRides] = useState<RideRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const isFetching = useRef(false);
    
    const fetchRides = useCallback(async (pageNum = 1) => {
        if (!pb.authStore.isValid || isFetching.current) return;

        isFetching.current = true;
        if (pageNum === 1) setIsLoading(true);
        else setIsLoadingMore(true);
        
        setError(null);
        
        try {
            const passengerId = pb.authStore.model!.id;
            const result: ListResult<RideRecord> = await pb.collection('rides').getList(pageNum, 50, {
                filter: `passenger = "${passengerId}"`,
                sort: '-created',
                expand: 'driver',
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
            if (model) {
                fetchRides(1);
            } else {
                setRides([]);
                setIsLoading(false);
            }
        };

        handleAuthChange(pb.authStore.token, pb.authStore.model);

        const unsubscribeAuth = pb.authStore.onChange(handleAuthChange);

        const handleRidesUpdate = (e: { record: RideRecord, action: string }) => {
            if (pb.authStore.model && e.record.passenger === pb.authStore.model.id) {
                 fetchRides(1);
            }
        };

        pb.collection('rides').subscribe('*', handleRidesUpdate);

        return () => {
            unsubscribeAuth();
            pb.realtime.unsubscribe();
        };
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
                {rides.map((ride) => (
                    <TableRow key={ride.id}>
                        <TableCell>
                            <div className="font-medium flex items-center gap-2">
                            <Car className="h-3 w-3" />
                            {ride.expand?.driver?.name || "Motorista não definido"}
                            </div>
                            <div className="text-sm text-muted-foreground">{new Date(ride.created).toLocaleString('pt-BR')}</div>
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
        {page < totalPages && (
            <div className="mt-4 text-center">
                <Button onClick={() => fetchRides(page + 1)} disabled={isLoadingMore}>
                    {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Carregar Mais
                </Button>
            </div>
        )}
    </div>
  );
}
