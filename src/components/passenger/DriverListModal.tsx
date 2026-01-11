
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
import type { User as Driver } from '../admin/UserList';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import RideConfirmationModal from './RideConfirmationModal';
import localData from '@/database/banco.json';
import type { RideRecord } from '../driver/RideRequests';

interface DocumentRecord {
    id: string;
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string; 
    is_verified: boolean;
}

interface DatabaseContent {
    users: Driver[];
    rides: RideRecord[];
    documents: DocumentRecord[];
    chats: any[];
    messages: any[];
    institutional_info: any;
}


interface DriverListModalProps {
    origin: string;
    destination: string;
    onRideRequest: (rideData: Omit<RideRecord, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>) => void;
    passengerAnonymousName: string | null;
    scheduledFor?: Date;
}

const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return '';
    return avatarPath;
};

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


export default function DriverListModal({ origin, destination, onRideRequest, passengerAnonymousName, scheduledFor }: DriverListModalProps) {
    const [openDriverId, setOpenDriverId] = useState<string | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    const fetchDrivers = useCallback(() => {
        setIsLoading(true);
        setError(null);
        try {
            const db = localData as DatabaseContent;
            const driverList = db.users
                .filter(u => Array.isArray(u.role) ? u.role.includes('Motorista') : u.role === 'Motorista')
                .map(u => ({
                    ...u,
                    id: u.id || `local_${Math.random()}`,
                    collectionId: '_pb_users_auth_',
                    collectionName: 'users',
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                    role: Array.isArray(u.role) ? u.role : [u.role],
                    disabled: (u as any).disabled || false,
                })) as unknown as Driver[];

            let filteredDrivers = driverList.filter(d => !d.disabled);
            
            // For immediate rides, only show online drivers.
            if (!scheduledFor) {
                filteredDrivers = filteredDrivers.filter(d => d.driver_status === "online");
            }
            
            setDrivers(filteredDrivers);
        } catch(err) {
            setError("Não foi possível carregar os motoristas do arquivo local.");
        } finally {
            setIsLoading(false);
        }
    }, [scheduledFor]);

    useEffect(() => {
        fetchDrivers();
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
                    const avatarUrl = getAvatarUrl(driver.avatar);
                    
                    const db = localData as DatabaseContent;
                    const vehicleDoc = db.documents.find(d => d.driver === driver.id && d.document_type === "VEHICLE_PHOTO");
                    const vehiclePhotoUrl = vehicleDoc ? vehicleDoc.file : '';

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
                                                <AvatarImage src={avatarUrl} data-ai-hint="driver portrait" />
                                                <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </DialogTrigger>
                                        <DialogContent className="p-0 max-w-xs">
                                            <Image src={avatarUrl || 'https://placehold.co/400x400.png'} alt={`Foto de ${driver.name}`} width={400} height={400} className="rounded-lg"/>
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
                                                {vehiclePhotoUrl && (
                                                    <Image src={vehiclePhotoUrl} alt={`Veículo de ${driver.name}`} fill className="object-cover" data-ai-hint="car photo" />
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
                    isNegotiated={false}
                    onConfirm={(rideData) => {
                        setIsConfirmationOpen(false);
                        onRideRequest(rideData);
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                    }}
                    passengerAnonymousName={passengerAnonymousName}
                    scheduledFor={scheduledFor}
                />
            )}
        </>
    );
}
