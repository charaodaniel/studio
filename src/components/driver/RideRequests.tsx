
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, MapPin, DollarSign, MessageSquareQuote, CheckSquare, AlertTriangle, UserCheck, CheckCheck, WifiOff, Loader2, Navigation, Calendar, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RideChat } from './NegotiationChat';
import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useRideRequestSound } from '@/hooks/useRideRequestSound';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type User } from '../admin/UserList';
import type { RecordModel } from 'pocketbase';
import { useDatabaseManager } from '@/hooks/use-database-manager';
import { useAuth } from '@/hooks/useAuth';


const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return '';
    return avatarPath;
};

export interface RideRecord extends RecordModel {
    passenger: string | null;
    driver: string;
    origin_address: string;
    destination_address: string;
    status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled';
    fare: number;
    is_negotiated: boolean;
    started_by: 'passenger' | 'driver';
    passenger_anonymous_name?: string | null;
    scheduled_for?: string;
    ride_description?: string;
    expand?: {
        passenger?: User;
    }
}

interface DatabaseContent {
  users: User[];
  rides: RideRecord[];
}


const RideRequestCard = ({ ride, onAccept, onReject, chatId }: { ride: RideRecord, onAccept: (ride: RideRecord) => void, onReject: (rideId: string) => void, chatId: string | null }) => {
    const isScheduled = !!ride.scheduled_for;
    const passengerAvatar = ride.expand?.passenger?.avatar ? getAvatarUrl(ride.expand.passenger.avatar) : '';

    return (
        <Card className={ride.is_negotiated ? 'border-primary' : ''}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <Avatar>
                    <AvatarImage src={passengerAvatar} data-ai-hint="person face" />
                    <AvatarFallback>{ride.expand?.passenger?.name.charAt(0) || 'P'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{ride.expand?.passenger?.name || 'Passageiro'}</p>
                    <p className="text-xs text-muted-foreground">★ 4.8</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {isScheduled && ride.scheduled_for && (
                     <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 border-blue-200">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-800">
                           {format(new Date(ride.scheduled_for), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-semibold">De:</span> {ride.origin_address}
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span className="font-semibold">Para:</span> {ride.destination_address}
                </div>
                {!isScheduled && (
                     <div className="flex items-center gap-2 pt-2">
                        <DollarSign className="h-4 w-4 text-accent" />
                        <span className="font-bold text-lg">{ride.is_negotiated ? 'A Negociar' : `R$ ${ride.fare.toFixed(2)}`}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
                {ride.is_negotiated ? (
                    <>
                        <Button variant="outline" className="w-full" onClick={() => onReject(ride.id)}>
                            <X className="mr-2 h-4 w-4" />
                            Recusar
                        </Button>
                         <RideChat 
                            rideId={ride.id}
                            chatId={chatId}
                            passengerName={ride.expand?.passenger?.name || 'Passageiro'} 
                            isNegotiation={true}
                            onAcceptRide={() => onAccept(ride)}
                         >
                            <Button className="w-full">
                                <MessageSquareQuote className="mr-2 h-4 w-4" />
                                Negociar
                            </Button>
                        </RideChat>
                    </>
                ) : (
                    <>
                        <Button variant="outline" className="w-full" onClick={() => onReject(ride.id)}>
                            <X className="mr-2 h-4 w-4" />
                            Rejeitar
                        </Button>
                        <Button className="w-full" onClick={() => onAccept(ride)}>
                            <Check className="mr-2 h-4 w-4" />
                            Aceitar
                        </Button>
                    </>
                )}

            </CardFooter>
        </Card>
    );
}

interface FullRideRequest {
    ride: RideRecord;
    chatId: string | null;
}

export function RideRequests({ setDriverStatus, manualRideOverride, onManualRideEnd }: { setDriverStatus: (status: string) => void, manualRideOverride: RideRecord | null, onManualRideEnd: () => void }) {
    const { toast } = useToast();
    const { playRideRequestSound, stopRideRequestSound } = useRideRequestSound();
    const { data: db, isLoading: isDbLoading, error: dbError, saveData, fetchData } = useDatabaseManager<DatabaseContent>();
    const { user: currentUser } = useAuth();
    
    const [requests, setRequests] = useState<FullRideRequest[]>([]);
    const [acceptedRide, setAcceptedRide] = useState<RideRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [passengerOnBoard, setPassengerOnBoard] = useState(false);
    

    useEffect(() => {
        if (manualRideOverride) {
            setAcceptedRide(manualRideOverride);
            setIsLoading(false);
            if (manualRideOverride.status === 'in_progress') {
                setPassengerOnBoard(true);
            }
        }
    }, [manualRideOverride]);

    const fetchRequests = useCallback(async () => {
        if (!currentUser || !db) {
            setIsLoading(false);
            return;
        };
        
        setIsLoading(true);
        setError(null);
        
        try {
            const driverId = currentUser.id;
            
            const driverRides = db.rides.filter(r => r.driver === driverId);

            const alreadyAccepted = driverRides.find(r => r.status === "accepted" || r.status === "in_progress");

            if (alreadyAccepted) {
                const passenger = alreadyAccepted.passenger ? db.users.find(u => u.id === alreadyAccepted.passenger) : undefined;
                setAcceptedRide({ ...alreadyAccepted, expand: { passenger } });
                if (alreadyAccepted.status === 'in_progress') {
                    setPassengerOnBoard(true);
                }
                setRequests([]);
                stopRideRequestSound();
            } else {
                const requestedRecords = driverRides.filter(r => r.status === "requested");
                 if (requestedRecords.length > 0) {
                    playRideRequestSound();
                } else {
                    stopRideRequestSound();
                }

                 const fullRequests: FullRideRequest[] = requestedRecords.map(ride => {
                    const passenger = ride.passenger ? db.users.find(u => u.id === ride.passenger) : undefined;
                    return {
                        ride: { ...ride, expand: { passenger } },
                        chatId: null // Chat logic can be added here if needed
                    }
                 });
                setRequests(fullRequests);
            }
        } catch (err) {
            console.error(err);
            setError("Não foi possível buscar as solicitações de corrida.");
            stopRideRequestSound();
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, db, playRideRequestSound, stopRideRequestSound]);

    useEffect(() => {
        if (manualRideOverride) return;

        fetchRequests();

        const interval = setInterval(fetchRequests, 5000); // Poll for new data every 5 seconds
        
        return () => {
            clearInterval(interval);
            stopRideRequestSound();
        }

    }, [fetchRequests, manualRideOverride, stopRideRequestSound]);


    const handleAccept = async (ride: RideRecord) => {
        stopRideRequestSound();
        try {
            await saveData((currentData) => {
                const updatedRides = (currentData?.rides || []).map(r => 
                    r.id === ride.id ? { ...r, status: 'accepted' as const } : r
                );
                return { ...(currentData || {}), rides: updatedRides } as DatabaseContent;
            });

            const passenger = db?.users.find(u => u.id === ride.passenger);
            const updatedRide = { ...ride, status: 'accepted' as const, expand: { passenger } };

            toast({ title: "Corrida Aceita!", description: `Você aceitou a corrida de ${updatedRide.expand?.passenger?.name}.` });
            setAcceptedRide(updatedRide);
            setRequests([]); 
            setPassengerOnBoard(false);
            
            const newStatus = ride.is_negotiated ? 'rural-trip' : 'urban-trip';
            setDriverStatus(newStatus);
        } catch (error) {
            console.error("Failed to accept ride:", error);
            toast({ variant: "destructive", title: "Erro", description: "Esta corrida pode já ter sido aceita ou cancelada."});
            fetchData();
        }
    };
    
    const handleReject = async (rideId: string) => {
        try {
             await saveData((currentData) => {
                const updatedRides = (currentData?.rides || []).map(r => 
                    r.id === rideId ? { ...r, status: 'canceled' as const } : r
                );
                return { ...(currentData || {}), rides: updatedRides } as DatabaseContent;
            });
            toast({ variant: "destructive", title: "Corrida Rejeitada" });
            setRequests(prev => prev.filter(r => r.ride.id !== rideId));
            if (requests.length <= 1) {
                stopRideRequestSound();
            }
        } catch (error) {
            console.error("Failed to reject ride:", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível rejeitar a corrida."});
        }
    };

    const handlePassengerOnBoard = async () => {
        if (!acceptedRide) return;
        try {
            await saveData(currentData => {
                const updatedRides = (currentData?.rides || []).map(r => r.id === acceptedRide.id ? { ...r, status: 'in_progress' as const } : r);
                return { ...(currentData || {}), rides: updatedRides } as DatabaseContent;
            });
            setAcceptedRide(prev => prev ? { ...prev, status: 'in_progress' } : null);
            setPassengerOnBoard(true);
            toast({ title: "Passageiro a Bordo!", description: "A viagem foi iniciada." });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível iniciar a viagem."});
        }
    };

    const handleEndRide = async () => {
        if (!acceptedRide) return;
        const isManual = acceptedRide.started_by === 'driver';
        try {
             await saveData(currentData => {
                const updatedRides = (currentData?.rides || []).map(r => r.id === acceptedRide.id ? { ...r, status: 'completed' as const } : r);
                return { ...(currentData || {}), rides: updatedRides } as DatabaseContent;
            });
            toast({ title: "Viagem Finalizada!", description: `A corrida foi concluída com sucesso.` });
            setAcceptedRide(null);
            setPassengerOnBoard(false);
            
            if (isManual && onManualRideEnd) {
                onManualRideEnd();
            } else {
                setDriverStatus('online');
                fetchData();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível finalizar a viagem."});
        }
    }
    
    const handleCancelByDriver = async () => {
        if (!acceptedRide) return;
        const isManual = acceptedRide.started_by === 'driver';
        try {
             await saveData(currentData => {
                const updatedRides = (currentData?.rides || []).map(r => r.id === acceptedRide.id ? { ...r, status: 'canceled' as const } : r);
                return { ...(currentData || {}), rides: updatedRides } as DatabaseContent;
            });
            toast({ variant: "destructive", title: "Corrida Cancelada", description: "A corrida foi cancelada." });
            setAcceptedRide(null);
            setPassengerOnBoard(false);
            
            if (isManual && onManualRideEnd) {
                onManualRideEnd();
            } else {
                setDriverStatus('online');
                fetchData();
            }
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível cancelar a corrida."});
        }
    }

    const handleNavigate = () => {
        if (!acceptedRide) return;

        const destination = passengerOnBoard 
            ? acceptedRide.destination_address 
            : acceptedRide.origin_address;
        
        const encodedAddress = encodeURIComponent(destination);
        const wazeUrl = `https://waze.com/ul?q=${encodedAddress}`;
        
        window.open(wazeUrl, '_blank');
    };

    if (acceptedRide) {
         const passengerName = acceptedRide.expand?.passenger?.name || acceptedRide.passenger_anonymous_name || "Passageiro";
         const passengerAvatar = acceptedRide.expand?.passenger?.avatar ? getAvatarUrl(acceptedRide.expand.passenger.avatar) : '';
         return (
             <Card className="shadow-lg border-primary">
                 <CardHeader>
                    <CardTitle className="font-headline">Corrida em Andamento</CardTitle>
                    <CardDescription>Comunique-se com seu passageiro e gerencie o progresso da viagem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-row items-center gap-4 space-y-0 pb-4">
                        <Avatar>
                             <AvatarImage src={passengerAvatar} data-ai-hint="person face" />
                            <AvatarFallback>{passengerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{passengerName}</p>
                            <p className="text-xs text-green-600 font-bold">{!passengerOnBoard ? 'A CAMINHO DO PASSAGEIRO' : 'VIAGEM EM ANDAMENTO'}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 text-sm p-3 border rounded-md bg-muted/50">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <div>
                            <span className="font-semibold">Destino:</span> {acceptedRide.destination_address}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm p-3 border rounded-md bg-muted/50">
                        <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                        <div>
                            <span className="font-semibold">Valor:</span> R$ {acceptedRide.fare.toFixed(2)}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    {!passengerOnBoard ? (
                         <div className="grid grid-cols-2 gap-2 w-full">
                             <Button className="w-full" onClick={handleNavigate}>
                                <Navigation className="mr-2 h-4 w-4" />
                                Ir até Passageiro
                            </Button>
                            <Button className="w-full" onClick={handlePassengerOnBoard}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Passageiro a Bordo
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <Button className="w-full" onClick={handleNavigate}>
                                <Navigation className="mr-2 h-4 w-4" />
                                Navegar para Destino
                            </Button>
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleEndRide}>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                Finalizar Viagem
                            </Button>
                        </div>
                     )}
                     <div className="grid grid-cols-2 gap-2 w-full mt-2">
                        {acceptedRide.started_by === 'passenger' ? (
                            <RideChat rideId={acceptedRide.id} chatId={null} passengerName={passengerName} isNegotiation={false}>
                                <Button variant="outline" className="w-full">
                                    <MessageSquareQuote className="mr-2 h-4 w-4" />
                                    Chat
                                </Button>
                            </RideChat>
                        ) : (<div/>)}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className={acceptedRide.started_by !== 'passenger' ? 'col-span-2' : ''}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Cancelar a Corrida?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Isso notificará o passageiro (se aplicável) que você teve um problema e cancelará a viagem. Use esta opção apenas em caso de real necessidade.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleCancelByDriver}>Sim, Cancelar Corrida</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                </CardFooter>
            </Card>
         )
    }

    if (isLoading || isDbLoading) {
        return (
            <div className="flex items-center justify-center p-8 border rounded-lg bg-card text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" /> Procurando solicitações...
            </div>
        )
    }

    if (error || dbError) {
        return (
            <div className="text-center text-destructive p-8 border rounded-lg bg-card">
                <WifiOff className="mx-auto h-8 w-8 mb-2"/>
                <CardTitle>Erro de Rede</CardTitle>
                <CardDescription>{error || dbError}</CardDescription>
            </div>
        )
    }
    
    if(requests.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8 border rounded-lg bg-card space-y-4">
                <CardTitle>Nenhuma solicitação no momento</CardTitle>
                <CardDescription>Aguardando novas corridas...</CardDescription>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="font-headline text-lg">Você tem {requests.length} nova(s) solicitação(ões).</h3>
            <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                    {requests.map(({ ride, chatId }) => (
                        <RideRequestCard 
                            key={ride.id}
                            ride={ride}
                            chatId={chatId}
                            onAccept={handleAccept}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

    

