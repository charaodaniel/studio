

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Loader2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbase';
import { type User as Driver } from '../admin/UserList';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RideConfirmationModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    driver: Driver;
    origin: string;
    destination: string;
    isNegotiated: boolean;
    onConfirm: (rideId: string) => void;
    passengerAnonymousName: string | null;
    scheduledFor?: Date;
}

export default function RideConfirmationModal({
    isOpen, onOpenChange, driver, origin, destination, isNegotiated, onConfirm, passengerAnonymousName, scheduledFor
}: RideConfirmationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [calculatedFare, setCalculatedFare] = useState<number>(0);
    const [distance, setDistance] = useState<number>(0);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && !isNegotiated) {
            // Simula cálculo de distância para a tarifa
            const randomDistance = Math.floor(Math.random() * 10) + 2; // Distância aleatória entre 2 e 12 km
            setDistance(randomDistance);

            let fare = 0;
            if (driver.driver_fare_type === 'fixed' && driver.driver_fixed_rate) {
                fare = driver.driver_fixed_rate;
            } else if (driver.driver_fare_type === 'km' && driver.driver_km_rate) {
                fare = randomDistance * driver.driver_km_rate;
            }
            setCalculatedFare(fare);
        }
    }, [isOpen, isNegotiated, driver]);

    const handleConfirmRide = async () => {
        setIsLoading(true);
        const currentUser = pb.authStore.model;
        if (!currentUser && !passengerAnonymousName) {
            toast({
                variant: 'destructive',
                title: 'Erro de Identificação',
                description: 'Você precisa estar logado ou fornecer um nome para solicitar uma corrida.',
            });
            setIsLoading(false);
            return;
        }

        if (!origin || !destination) {
            toast({
                variant: 'destructive',
                title: 'Dados Incompletos',
                description: 'Os campos de origem e destino são obrigatórios.',
            });
            setIsLoading(false);
            return;
        }

        try {
            const rideData: { [key: string]: any } = {
                passenger: currentUser?.id || null,
                driver: driver.id,
                origin_address: origin,
                destination_address: destination,
                status: "requested",
                is_negotiated: isNegotiated,
                started_by: "passenger",
                fare: isNegotiated ? 0 : (calculatedFare || 0),
                passenger_anonymous_name: passengerAnonymousName,
            };

            if (scheduledFor) {
                rideData.scheduled_for = scheduledFor.toISOString();
                rideData.ride_description = `Viagem agendada para ${format(scheduledFor, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;
            }

            const rideRecord = await pb.collection('rides').create(rideData);

            if (isNegotiated && currentUser) {
                await pb.collection('chats').create({
                    participants: [currentUser.id, driver.id],
                    ride: rideRecord.id,
                    last_message: `Solicitação de corrida para: ${destination}`
                });
            }
            
            toast({
                title: "Corrida Solicitada!",
                description: `Sua solicitação foi enviada para ${driver.name}.`,
            });
            onConfirm(rideRecord.id);

        } catch (error: any) {
            console.error("Failed to create ride:", error.data || error);
            const errorMessage = error.data?.message || "Não foi possível criar sua solicitação. Verifique os dados e tente novamente.";
            toast({
                variant: "destructive",
                title: "Erro ao Solicitar Corrida",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Confirmar Corrida</DialogTitle>
                    <DialogDescription>
                        Revise os detalhes da sua corrida com {driver.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {scheduledFor && (
                         <div className="p-4 border rounded-lg flex justify-between items-center bg-blue-50 border-blue-200">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-6 w-6 text-blue-600"/>
                                <div>
                                    <p className="font-semibold">Viagem Agendada</p>
                                    <p className="text-xs text-blue-800/80">{format(scheduledFor, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">De</p>
                                <p className="font-medium">{origin}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                             <div>
                                <p className="text-xs text-muted-foreground">Para</p>
                                <p className="font-medium">{destination}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border rounded-lg flex justify-between items-center bg-muted/50">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-6 w-6 text-primary"/>
                            <div>
                                <p className="font-semibold">Valor Estimado</p>
                                {driver.driver_fare_type === 'km' && !isNegotiated && (
                                     <p className="text-xs text-muted-foreground">{distance} km @ R$ {driver.driver_km_rate?.toFixed(2)}/km</p>
                                )}
                            </div>
                        </div>
                        <p className="font-bold text-2xl text-primary">
                            {isNegotiated ? 'A Negociar' : `R$ ${calculatedFare.toFixed(2)}`}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
                    <Button onClick={handleConfirmRide} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar e Chamar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
