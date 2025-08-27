
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbase';
import { type User as Driver } from '../admin/UserList';

interface RideConfirmationModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    driver: Driver;
    origin: string;
    destination: string;
    isNegotiated: boolean;
    onConfirm: (rideId: string) => void;
}

export default function RideConfirmationModal({
    isOpen, onOpenChange, driver, origin, destination, isNegotiated, onConfirm
}: RideConfirmationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [calculatedFare, setCalculatedFare] = useState<number>(0);
    const [distance, setDistance] = useState<number>(0);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && !isNegotiated) {
            // Simulate distance calculation for fare
            const randomDistance = Math.floor(Math.random() * 10) + 2; // Random distance between 2 and 12 km
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
        if (!pb.authStore.model) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Você precisa estar logado para confirmar.',
            });
            setIsLoading(false);
            return;
        }

        const data: { [key: string]: any } = {
            // Ensure required fields have default values
            status: "requested",
            started_by: "passenger",
            is_negotiated: isNegotiated,
            origin_address: origin || 'Não informado',
            destination_address: destination || 'Não informado',
            passenger: pb.authStore.model.id,
            target_driver: driver.id,
            fare: isNegotiated ? 0 : calculatedFare,
            distance_km: isNegotiated ? null : distance
        };

        try {
            const record = await pb.collection('rides').create(data);
            toast({
                title: "Corrida Solicitada!",
                description: `Sua solicitação foi enviada para ${driver.name}.`,
            });
            onConfirm(record.id);
        } catch (error) {
            console.error("Failed to create ride:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Solicitar Corrida",
                description: "Não foi possível criar sua solicitação. Tente novamente.",
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
