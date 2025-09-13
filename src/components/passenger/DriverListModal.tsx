

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Car, Info, Send, WifiOff, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogHeader } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Image from 'next/image';
import pb from '@/lib/pocketbase';
import type { User as Driver } from '../admin/UserList';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import RideConfirmationModal from './RideConfirmationModal';

interface DriverListModalProps {
    origin: string;
    destination: string;
    isNegotiated: boolean;
    onRideRequest: (rideId: string) => void;
    passengerAnonymousName: string | null;
    scheduledFor?: Date;
}

const getStatusVariant = (status?: string) => {
    switch (status) {
        case 'online':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'urban-trip':
        case 'rural-trip':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'offline':
        default:
            return 'bg-red-100 text-red-800 border-red-200';
    }
};

const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
        'online': 'Online',
        'offline': 'Offline',
        'urban-trip': 'Em Viagem',
        'rural-trip': 'Em Viagem',
    };
    return labels[status || 'offline'] || status;
};


export default function DriverListModal({ origin, destination, isNegotiated, onRideRequest, passengerAnonymousName, scheduledFor }: DriverListModalProps) {
    const [openDriverId, setOpenDriverId] = useState<string | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    const fetchDrivers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // A API rule permite que qualquer um liste usuários com o perfil "Motorista".
            // Para viagens agendadas, mostramos todos, caso contrário, apenas online.
            const filter = scheduledFor 
                ? 'role = "Motorista" && disabled = false'
                : 'role = "Motorista" && disabled = false && driver_status = "online"';
            
            const allDrivers = await pb.collection('users').getFullList<Driver>({
                filter: filter,
            });
            setDrivers(allDrivers);
        } catch (err: any) {
            console.error("Failed to fetch drivers:", err);
            if (err.status === 403) {
                 setError("Você não tem permissão para ver os motoristas. Contate o administrador.");
            } else {
                setError("Não foi possível carregar os motoristas. Verifique a conexão.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [scheduledFor]);

    useEffect(() => {
        fetchDrivers();
        
        const unsubscribe = pb.collection('users').subscribe('*', (e) => {
            if (e.record.role === 'Motorista') {
                fetchDrivers();
            }
        });

        return () => {
            pb.collection('users').unsubscribe('*');
        };
    }, [fetchDrivers]);

    const handleToggle = (driverId: string) => {
        setOpenDriverId(prevId => prevId === driverId ? null : driverId);
    };

    const handleSelectDriver = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsConfirmationOpen(true);
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-grow">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </Card>
                    ))}
                </div>
            )
        }
        if (error) {
            return (
                <div className="text-center p-8 text-destructive">
                    <WifiOff className="mx-auto h-10 w-10 mb-2" />
                    <p className="font-semibold">Erro de Conexão</p>
                    <p className="text-sm">{error}</p>
                </div>
            );
        }
        if (drivers.length === 0) {
            return <p className="text-center text-muted-foreground p-4">Nenhum motorista disponível no momento.</p>
        }
        return (
             <div className="space-y-2">
                {drivers.map((driver) => {
                    const isAvailable = driver.driver_status === 'online' || scheduledFor;
                    return (
                        <Collapsible
                            key={driver.id}
                            open={openDriverId === driver.id}
                            onOpenChange={() => handleToggle(driver.id)}
                            className="w-full"
                        >
                            <Card className="hover:bg-muted/50 transition-colors">
                                <div className="flex items-center p-4 gap-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                                <Avatar className="h-12 w-12 cursor-pointer">
                                                <AvatarImage src={driver.avatar ? pb.getFileUrl(driver, driver.avatar) : ''} data-ai-hint="driver portrait" />
                                                <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </DialogTrigger>
                                        <DialogContent className="p-0 max-w-xs">
                                            <Image src={driver.avatar ? pb.getFileUrl(driver, driver.avatar) : 'https://placehold.co/400x400.png'} alt={`Foto de ${driver.name}`} width={400} height={400} className="rounded-lg"/>
                                        </DialogContent>
                                    </Dialog>
                                    
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                        <p className="font-bold">{driver.name}</p>
                                        <Badge variant="outline" className={cn("text-xs", getStatusVariant(driver.driver_status))}>
                                            {getStatusLabel(driver.driver_status)}
                                        </Badge>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                            <span>4.8</span>
                                        </div>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <Info className="mr-2 h-4 w-4" /> Ver
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent>
                                    <div className="px-4 pb-4 space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Car className="h-4 w-4" /> {driver.driver_vehicle_model || 'Veículo não informado'} - {driver.driver_vehicle_plate || 'Placa não informada'}
                                            </p>
                                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                                {driver.driver_vehicle_photo && (
                                                    <Image src={pb.getFileUrl(driver, driver.driver_vehicle_photo, {thumb: "100x100"})} alt={`Veículo de ${driver.name}`} fill className="object-cover" data-ai-hint="car photo" />
                                                )}
                                            </div>
                                        </div>
                                        <Button className="w-full bg-accent hover:bg-accent/90" onClick={() => handleSelectDriver(driver)} disabled={!isAvailable}>
                                            {isAvailable ? <Send className="mr-2 h-4 w-4" /> : null}
                                            {isAvailable ? `Chamar ${driver.name.split(' ')[0]}` : 'Indisponível'}
                                        </Button>
                                    </div>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    )
                })}
            </div>
        )
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle className="font-headline">Escolha um Motorista</DialogTitle>
                <DialogDescription>
                    {scheduledFor ? 'Escolha um motorista para agendar sua corrida.' : 'Selecione um motorista para sua corrida ou veja mais detalhes.'}
                </DialogDescription>
                <ScrollArea className="h-96 pr-4 mt-4">
                    {renderContent()}
                </ScrollArea>
            </DialogHeader>

            {selectedDriver && (
                <RideConfirmationModal
                    isOpen={isConfirmationOpen}
                    onOpenChange={setIsConfirmationOpen}
                    driver={selectedDriver}
                    origin={origin}
                    destination={destination}
                    isNegotiated={isNegotiated}
                    onConfirm={(rideId) => {
                        setIsConfirmationOpen(false);
                        onRideRequest(rideId);
                        // Close the parent dialog as well
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                    }}
                    passengerAnonymousName={passengerAnonymousName}
                    scheduledFor={scheduledFor}
                />
            )}
        </>
    );
}
