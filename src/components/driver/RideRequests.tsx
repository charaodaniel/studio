
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
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { useRideRequestSound } from '@/hooks/useRideRequestSound';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    scheduled_for?: string;
    ride_description?: string;
    expand?: {
        passenger: RecordModel;
    }
}

const RideRequestCard = ({ ride, onAccept, onReject, chatId }: { ride: RideRecord, onAccept: (ride: RideRecord) => void, onReject: (rideId: string) => void, chatId: string | null }) => {
    const isScheduled = !!ride.scheduled_for;

    return (
        <Card className={ride.is_negotiated ? 'border-primary' : ''}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <Avatar>
                    <AvatarImage src={ride.expand?.passenger?.avatar ? pb.getFileUrl(ride.expand.passenger, ride.expand.passenger.avatar) : ''} data-ai-hint="person face" />
                    <AvatarFallback>{ride.expand?.passenger?.name.charAt(0) || 'P'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{ride.expand?.passenger?.name || 'Passageiro'}</p>
                    <p className="text-xs text-muted-foreground">★ 4.8</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {isScheduled && (
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
                     <RideChat 
                        rideId={ride.id}
                        chatId={chatId}
                        passengerName={ride.expand?.passenger.name || 'Passageiro'} 
                        isNegotiation={true}
                        onAcceptRide={() => onAccept(ride)}
                     >
                        <Button className="w-full col-span-2">
                            <MessageSquareQuote className="mr-2 h-4 w-4" />
                            Negociar Valor
                        </Button>
                    </RideChat>
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
        if (!pb.authStore.isValid || !pb.authStore.model?.id) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const driverId = pb.authStore.model.id;
            // Verifica se já existe uma corrida aceita
            const acceptedFilter = `(status = "accepted" || status = "in_progress") && driver = "${driverId}"`;
            try {
                const alreadyAccepted = await pb.collection('rides').getFirstListItem<RideRecord>(acceptedFilter, { expand: 'passenger' });
                setAcceptedRide(alreadyAccepted);
                if (alreadyAccepted.status === 'in_progress') {
                    setPassengerOnBoard(true);
                }
                setRequests([]); // Limpa as solicitações pendentes se uma for aceita
                setIsLoading(false);
                stopRideRequestSound();
                return; 
            } catch (err: any) {
                if (err.status !== 404) throw err; 
            }

            // Se não houver corrida aceita, busca novas solicitações
            const rideFilter = `status = "requested" && driver = "${driverId}"`;
            const rideRecords = await pb.collection('rides').getFullList<RideRecord>({
                filter: rideFilter,
                expand: 'passenger',
                sort: '-created'
            });

            if (rideRecords.length > 0) {
                playRideRequestSound();
            } else {
                stopRideRequestSound();
            }

            const fullRequests = await Promise.all(rideRecords.map(async (ride) => {
                let chatId: string | null = null;
                if (ride.is_negotiated) {
                    try {
                        const chatRecord = await pb.collection('chats').getFirstListItem(`ride="${ride.id}"`);
                        chatId = chatRecord.id;
                    } catch (e) {
                       console.warn(`Não foi possível encontrar chat para a corrida negociada ${ride.id}`);
                    }
                }
                return { ride, chatId };
            }));

            setRequests(fullRequests);

        } catch (err) {
            console.error(err);
            setError("Não foi possível buscar as solicitações de corrida.");
            stopRideRequestSound();
        } finally {
            setIsLoading(false);
        }
    }, [playRideRequestSound, stopRideRequestSound]);

    useEffect(() => {
        if (manualRideOverride) return;
        fetchRequests();

        const handleUpdate = (e: { record: RideRecord, action: string }) => {
            const driverId = pb.authStore.model?.id;
            if (driverId && e.record.driver === driverId) {
                fetchRequests();
            }
        };

        pb.collection('rides').subscribe('*', handleUpdate);

        return () => {
            pb.collection('rides').unsubscribe('*');
            stopRideRequestSound();
        };
    }, [fetchRequests, manualRideOverride, stopRideRequestSound]);


    const handleAccept = async (ride: RideRecord) => {
        if (!pb.authStore.model) return;
        stopRideRequestSound();

        try {
            const updatedRide = await pb.collection('rides').update<RideRecord>(ride.id, {
                status: 'accepted'
            }, { expand: 'passenger' });

            toast({ title: "Corrida Aceita!", description: `Você aceitou a corrida de ${ride.expand?.passenger.name}.` });
            setAcceptedRide(updatedRide);
            setRequests([]); 
            setPassengerOnBoard(false);
            
            const newStatus = ride.is_negotiated ? 'rural-trip' : 'urban-trip';
            setDriverStatus(newStatus);
        } catch (error) {
            console.error("Failed to accept ride:", error);
            toast({ variant: "destructive", title: "Erro", description: "Esta corrida já foi aceita por outro motorista."});
            fetchRequests();
        }
    };
    
    const handleReject = async (rideId: string) => {
        try {
            await pb.collection('rides').update(rideId, { status: 'canceled' });
            toast({ variant: "destructive", title: "Corrida Rejeitada" });
            setRequests(prev => prev.filter(r => r.ride.id !== rideId));
            if (requests.length <= 1) {
                stopRideRequestSound();
            }
        } catch (error) {
            console.error("Failed to update ride to canceled:", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível rejeitar a corrida."});
        }
    };

    const handlePassengerOnBoard = async () => {
        if (!acceptedRide) return;
        try {
            await pb.collection('rides').update(acceptedRide.id, { status: 'in_progress' });
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
            await pb.collection('rides').update(acceptedRide.id, { status: 'completed' });
            toast({ title: "Viagem Finalizada!", description: `A corrida foi concluída com sucesso.` });
            setAcceptedRide(null);
            setPassengerOnBoard(false);
            
            if (isManual && onManualRideEnd) {
                onManualRideEnd();
            } else {
                setDriverStatus('online');
                fetchRequests();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível finalizar a viagem."});
        }
    }
    
    const handleCancelByDriver = async () => {
        if (!acceptedRide) return;
        const isManual = acceptedRide.started_by === 'driver';
        try {
            await pb.collection('rides').update(acceptedRide.id, { status: 'canceled' });
            toast({ variant: "destructive", title: "Corrida Cancelada", description: "A corrida foi cancelada." });
            setAcceptedRide(null);
            setPassengerOnBoard(false);
            
            if (isManual && onManualRideEnd) {
                onManualRideEnd();
            } else {
                setDriverStatus('online');
                fetchRequests();
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

    const handleStartQuickRide = async () => {
        if (!pb.authStore.model) return;
        
        try {
            const rideData: Partial<RideRecord> = {
                driver: pb.authStore.model.id,
                status: 'in_progress',
                started_by: 'driver',
                origin_address: 'Corrida Rápida',
                destination_address: 'Corrida Rápida',
                fare: 0,
                is_negotiated: false,
            };

            const newRide = await pb.collection('rides').create<RideRecord>(rideData);

            toast({ title: "Corrida Rápida Iniciada!", description: "A viagem está em andamento." });
            setAcceptedRide(newRide);
            setPassengerOnBoard(true);
            setDriverStatus('urban-trip');

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar a corrida rápida.' });
        }
    };

    if (acceptedRide) {
         const passengerName = acceptedRide.expand?.passenger?.name || acceptedRide.passenger_anonymous_name || "Passageiro";
         return (
             <Card className="shadow-lg border-primary">
                 <CardHeader>
                    <CardTitle className="font-headline">Corrida em Andamento</CardTitle>
                    <CardDescription>Comunique-se com seu passageiro e gerencie o progresso da viagem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-row items-center gap-4 space-y-0 pb-4">
                        <Avatar>
                             <AvatarImage src={acceptedRide.expand?.passenger?.avatar ? pb.getFileUrl(acceptedRide.expand.passenger, acceptedRide.expand.passenger.avatar) : ''} data-ai-hint="person face" />
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
                             <Button className="w-full" onClick={handleEndRide}>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                Finalizar Viagem
                            </Button>
                             <Button className="w-full" onClick={handleNavigate}>
                                <Navigation className="mr-2 h-4 w-4" />
                                Waze
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
                                <Button variant="outline" className="w-full text-amber-600 border-amber-500 hover:bg-amber-50 hover:text-amber-700">
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Imprevisto
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
                                    <AlertDialogAction className="bg-amber-600 hover:bg-amber-700" onClick={handleCancelByDriver}>Sim, Cancelar Corrida</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                </CardFooter>
            </Card>
         )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 border rounded-lg bg-card text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" /> Procurando solicitações...
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-destructive p-8 border rounded-lg bg-card">
                <WifiOff className="mx-auto h-8 w-8 mb-2"/>
                <CardTitle>Erro de Rede</CardTitle>
                <CardDescription>{error}</CardDescription>
            </div>
        )
    }
    
    if(requests.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8 border rounded-lg bg-card space-y-4">
                <CardTitle>Nenhuma solicitação no momento</CardTitle>
                <CardDescription>Aguardando novas corridas...</CardDescription>
                <Button onClick={handleStartQuickRide}>
                    <Zap className="mr-2 h-4 w-4" />
                    Corrida Rápida (Urbano)
                </Button>
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

    

    