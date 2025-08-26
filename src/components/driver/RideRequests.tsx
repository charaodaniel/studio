

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, MapPin, DollarSign, MessageSquareQuote, CheckSquare, AlertTriangle, UserCheck, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RideChat } from './NegotiationChat';
import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { Loader2, WifiOff } from 'lucide-react';

interface RideRecord extends RecordModel {
    passenger: string;
    driver: string;
    origin_address: string;
    destination_address: string;
    status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled';
    fare: number;
    is_negotiated: boolean;
    started_by: 'passenger' | 'driver';
    expand: {
        passenger: RecordModel;
    }
}

const RideRequestCard = ({ ride, onAccept, onReject }: { ride: RideRecord, onAccept: (ride: RideRecord) => void, onReject: (rideId: string) => void }) => {
    return (
        <Card className={ride.is_negotiated ? 'border-primary' : ''}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <Avatar>
                    <AvatarImage src={ride.expand.passenger.avatar ? pb.getFileUrl(ride.expand.passenger, ride.expand.passenger.avatar) : ''} data-ai-hint="person face" />
                    <AvatarFallback>{ride.expand.passenger.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{ride.expand.passenger.name}</p>
                    <p className="text-xs text-muted-foreground">★ 4.8</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-semibold">De:</span> {ride.origin_address}
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span className="font-semibold">Para:</span> {ride.destination_address}
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <DollarSign className="h-4 w-4 text-accent" />
                    <span className="font-bold text-lg">{ride.is_negotiated ? 'A Negociar' : `R$ ${ride.fare.toFixed(2)}`}</span>
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
                {ride.is_negotiated ? (
                     <RideChat 
                        passengerName={ride.expand.passenger.name} 
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

export function RideRequests({ setDriverStatus }: { setDriverStatus: (status: string) => void }) {
    const { toast } = useToast();
    const [requests, setRequests] = useState<RideRecord[]>([]);
    const [acceptedRide, setAcceptedRide] = useState<RideRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [passengerOnBoard, setPassengerOnBoard] = useState(false);

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Find rides requested but not yet accepted by any driver
            const result = await pb.collection('rides').getFullList<RideRecord>({
                filter: 'status = "requested"',
                expand: 'passenger',
            });
            setRequests(result);
        } catch (err) {
            console.error(err);
            setError("Não foi possível buscar as solicitações de corrida.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();

        // Subscribe to real-time updates
        const unsubscribe = pb.collection('rides').subscribe<RideRecord>('*', (e) => {
            if (e.action === 'create' && e.record.status === 'requested') {
                setRequests(prev => [e.record, ...prev]);
            }
            if (e.action === 'update') {
                setRequests(prev => prev.filter(r => r.id !== e.record.id)); // Remove if another driver accepts
            }
        });

        return () => {
            pb.collection('rides').unsubscribe('*');
        };

    }, [fetchRequests]);


    const handleAccept = async (ride: RideRecord) => {
        if (!pb.authStore.model) return;

        try {
            const updatedRide = await pb.collection('rides').update<RideRecord>(ride.id, {
                driver: pb.authStore.model.id,
                status: 'accepted'
            }, { expand: 'passenger' });

            toast({ title: "Corrida Aceita!", description: `Você aceitou a corrida de ${ride.expand.passenger.name}.` });
            setAcceptedRide(updatedRide);
            setPassengerOnBoard(false);
            
            const newStatus = ride.is_negotiated ? 'rural-trip' : 'urban-trip';
            setDriverStatus(newStatus);
        } catch (error) {
            console.error("Failed to accept ride:", error);
            toast({ variant: "destructive", title: "Erro", description: "Esta corrida já foi aceita por outro motorista."});
            fetchRequests(); // Re-sync
        }
    };
    
    const handleReject = async (rideId: string) => {
        // In a real scenario, you might just ignore it. 
        // For the prototype, we remove it from the local list.
        const ride = requests.find(r => r.id === rideId);
        if (!ride) return;
        toast({ variant: "destructive", title: "Corrida Rejeitada" });
        setRequests(prev => prev.filter(r => r.id !== rideId));
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
        try {
            await pb.collection('rides').update(acceptedRide.id, { status: 'completed' });
            toast({ title: "Viagem Finalizada!", description: `A corrida com ${acceptedRide.expand.passenger.name} foi concluída.` });
            setAcceptedRide(null);
            setPassengerOnBoard(false);
            setDriverStatus('online');
            fetchRequests(); // Check for new requests
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível finalizar a viagem."});
        }
    }

    if (acceptedRide) {
         return (
             <Card className="shadow-lg border-primary">
                 <CardHeader>
                    <CardTitle className="font-headline">Corrida em Andamento</CardTitle>
                    <CardDescription>Comunique-se com seu passageiro e gerencie o progresso da viagem.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row items-center gap-4 space-y-0 pb-4">
                        <Avatar>
                             <AvatarImage src={acceptedRide.expand.passenger.avatar ? pb.getFileUrl(acceptedRide.expand.passenger, acceptedRide.expand.passenger.avatar) : ''} data-ai-hint="person face" />
                            <AvatarFallback>{acceptedRide.expand.passenger.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{acceptedRide.expand.passenger.name}</p>
                            <p className="text-xs text-green-600 font-bold">{!passengerOnBoard ? 'A CAMINHO DO PASSAGEIRO' : 'VIAGEM EM ANDAMENTO'}</p>
                        </div>
                    </div>
                    <RideChat passengerName={acceptedRide.expand.passenger.name} isNegotiation={false}>
                        <Button className="w-full">
                            <MessageSquareQuote className="mr-2 h-4 w-4" />
                            Abrir Chat com {acceptedRide.expand.passenger.name}
                        </Button>
                    </RideChat>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    {!passengerOnBoard ? (
                        <Button className="w-full" onClick={handlePassengerOnBoard}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Passageiro a Bordo
                        </Button>
                    ) : (
                        <Button variant="destructive" className="w-full" onClick={handleEndRide}>
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Finalizar Viagem
                        </Button>
                     )}
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full text-amber-600 border-amber-500 hover:bg-amber-50 hover:text-amber-700 mt-2">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Informar Imprevisto
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Informar Imprevisto ao Passageiro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Isso notificará o passageiro que você teve um problema e solicitará a troca de motorista. Use esta opção apenas em caso de real necessidade.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-amber-600 hover:bg-amber-700">Sim, Notificar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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
            <div className="text-center text-muted-foreground p-8 border rounded-lg bg-card">
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
                    {requests.map((req) => (
                        <RideRequestCard 
                            key={req.id}
                            ride={req}
                            onAccept={handleAccept}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

