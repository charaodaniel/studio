
'use client';

import { useState, useEffect, useCallback } from 'react';
import RideRequestForm from './RideRequestForm';
import RideStatusCard from './RideStatusCard';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import localData from '@/database/banco.json';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, Car, Send } from 'lucide-react';
import type { User as Driver } from '../admin/UserList';
import RideConfirmationModal from './RideConfirmationModal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { RideRecord } from '../driver/RideRequests';
import { useDatabaseManager } from '@/hooks/use-database-manager';

const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return '';
    return avatarPath;
};

type RideStatus = 'idle' | 'searching' | 'in_progress' | 'completed' | 'canceled' | 'accepted' | 'requested';

export interface RideDetails {
  driverName: string;
  driverAvatar: string;
  driverPhone: string;
  vehicleModel: string;
  licensePlate: string;
  eta: string;
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


export default function PassengerDashboard() {
  const { toast } = useToast();
  const { playNotification } = useNotificationSound();
  const { user } = useAuth();
  const { data: db, saveData } = useDatabaseManager<DatabaseContent>();
  const [rideStatus, setRideStatus] = useState<RideStatus>('idle');
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [activeRide, setActiveRide] = useState<RideRecord | null>(null);
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  // State for the form
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  interface DatabaseContent {
    users: Driver[];
    rides: RideRecord[];
  }

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(() => {}, () => {});
    }

    const fetchDrivers = () => {
        try {
            const records = localData.users
                .filter(u => u.role.includes("Motorista") && !(u as any).disabled && u.driver_status === 'online')
                .map(u => ({
                    ...u,
                    id: u.id || `local_${Math.random()}`,
                    collectionId: '_pb_users_auth_',
                    collectionName: 'users',
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                    role: Array.isArray(u.role) ? u.role : [u.role],
                    disabled: (u as any).disabled || false,
                })) as Driver[];

            setDrivers(records);
        } catch (err) {
            console.error(err);
            toast({variant: 'destructive', title: 'Erro ao buscar motoristas'});
        } finally {
            setIsLoadingDrivers(false);
        }
    }
    fetchDrivers();
  }, [toast]);
  

  const handleRideUpdate = useCallback((updatedRide: RideRecord) => {
    setActiveRide(updatedRide);
    
    const driverData = localData.users.find(u => u.id === updatedRide.driver) as Driver | undefined;

    if (updatedRide.status === 'accepted' && rideStatus !== 'accepted') {
        if (driverData) {
            setRideStatus('accepted');
            setRideDetails({
                driverName: driverData.name || 'Motorista',
                driverAvatar: driverData.avatar ? getAvatarUrl(driverData.avatar) : '',
                driverPhone: driverData.phone || '',
                vehicleModel: driverData.driver_vehicle_model || 'Não informado',
                licensePlate: driverData.driver_vehicle_plate || 'Não informado',
                eta: '5 min'
            });
            playNotification();
            toast({title: "Corrida Aceita!", description: `${driverData.name} está a caminho.`});
        }
    } else if (updatedRide.status === 'in_progress') {
        setRideStatus('in_progress');
    } else if (updatedRide.status === 'completed') {
        handleCompleteRide();
    } else if (updatedRide.status === 'canceled') {
        handleCancelRide(false); // No need to update db again
        toast({title: "Corrida Cancelada", description: "A corrida foi cancelada.", variant: 'destructive'});
    }
}, [playNotification, rideStatus, toast]);

  useEffect(() => {
    // This effect simulates checking for an active ride.
    if (user && db?.rides) {
        const activeRideFromLocal = db.rides.find(r => 
            r.passenger === user.id && 
            (r.status === "accepted" || r.status === "in_progress" || r.status === "requested")
        );

        if (activeRideFromLocal) {
            setRideStatus(activeRideFromLocal.status);
            if (activeRideFromLocal.status !== 'requested') {
                handleRideUpdate(activeRideFromLocal);
            }
        } else {
            if (rideStatus !== 'idle') {
                setRideStatus('idle');
            }
        }
    } else if (!user) {
        // If no user is logged in, ensure we are in an idle state.
        setRideStatus('idle');
        setRideDetails(null);
        setActiveRide(null);
    }
  }, [user, rideStatus, handleRideUpdate, db]);
  

  const onRideRequest = async (rideData: Omit<RideRecord, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>) => {
    const now = new Date();
    const rideId = `ride_local_${now.getTime()}`;

    const newRide: RideRecord = {
        id: rideId,
        collectionId: 'b1wtu7ah1l75gen',
        collectionName: 'rides',
        created: now.toISOString(),
        updated: now.toISOString(),
        ...rideData
    };

    try {
        await saveData((currentData) => {
            const dbContent = currentData || { users: [], rides: [], documents: [], chats: [], messages: [], institutional_info: {} };
            return {
                ...dbContent,
                rides: [...(dbContent.rides || []), newRide],
            };
        });

        toast({ title: 'Procurando Motorista...', description: 'Sua solicitação foi enviada.' });
        setRideStatus('searching');
        setActiveRide(newRide);

        // Simulates a driver accepting. In a real scenario, this would be a real-time update.
        const interval = setInterval(() => {
            // In a real app, this would be a real-time subscription, but we poll localData for simulation
            const updatedRide = localData.rides.find(r => r.id === rideId) as RideRecord | undefined;
            if (updatedRide && updatedRide.status !== 'requested') {
                handleRideUpdate(updatedRide);
                clearInterval(interval);
            }
        }, 3000);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao Solicitar', description: 'Não foi possível enviar a solicitação.' });
        setRideStatus('idle');
    }
  };

  const handleCancelRide = async (updateDb = true) => {
    if (updateDb && activeRide) {
        try {
            await saveData((currentData) => {
                const dbContent = currentData || { users: [], rides: [], documents: [], chats: [], messages: [], institutional_info: {} };
                const updatedRides = (dbContent.rides || []).map((r: RideRecord) => r.id === activeRide.id ? { ...r, status: 'canceled' as const } : r);
                return { ...dbContent, rides: updatedRides };
            });
            toast({
                title: 'Corrida Cancelada',
                description: 'Sua solicitação foi cancelada.',
                variant: 'destructive'
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível cancelar a corrida.' });
        }
    }
    setRideStatus('idle');
    setRideDetails(null);
    setActiveRide(null);
  };
  
  const handleCompleteRide = () => {
    toast({ title: "Viagem Concluída!", description: "Obrigado por viajar com a gente."});
    setRideStatus('completed');
     // Reset after a delay
    setTimeout(() => {
        setRideStatus('idle');
        setRideDetails(null);
        setActiveRide(null);
    }, 5000);
  }

  const handleSelectDriver = (driver: Driver, isNegotiated: boolean) => {
    if (!origin || !destination) {
        toast({
            variant: 'destructive',
            title: 'Campos obrigatórios',
            description: 'Por favor, preencha os campos de origem e destino antes de escolher um motorista.',
        });
        return;
    }
    setSelectedDriver(driver);
    setIsConfirmationOpen(true);
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-8 h-full">
      <div className="w-full lg:max-w-md mx-auto">
        {rideStatus === 'idle' || rideStatus === 'searching' || rideStatus === 'requested' ? (
          <RideRequestForm
            onRideRequest={onRideRequest}
            isSearching={rideStatus === 'searching' || rideStatus === 'requested'}
            anonymousUserName={user ? null : 'Anônimo'}
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
          />
        ) : (
          rideDetails && activeRide && (
            <RideStatusCard
              rideDetails={rideDetails}
              rideStatus={activeRide.status}
              rideId={activeRide.id}
              isNegotiated={activeRide.is_negotiated}
              onCancel={() => handleCancelRide(true)}
              onComplete={handleCompleteRide}
            />
          )
        )}
      </div>

      {(rideStatus === 'idle' || rideStatus === 'searching' || rideStatus === 'requested') && (
        <div className="space-y-4">
            <h2 className="font-headline text-xl text-center">Motoristas Disponíveis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {drivers.map(driver => {
                const isAvailable = driver.driver_status === 'online';
                return (
                    <Card key={driver.id} className="flex flex-col">
                        <CardContent className="p-4 flex-grow">
                            <div className="flex flex-col items-center text-center gap-2">
                                <Avatar className="h-16 w-16 mb-2">
                                    <AvatarImage src={driver.avatar ? getAvatarUrl(driver.avatar) : ''} data-ai-hint="driver portrait" />
                                    <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <p className="font-bold">{driver.name}</p>
                                <Badge variant="outline" className={cn("text-xs", getStatusVariant(driver.driver_status))}>
                                    {getStatusLabel(driver.driver_status)}
                                </Badge>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Car className="h-4 w-4" />
                                    <span>{driver.driver_vehicle_model || 'Não informado'}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                    <span>4.8</span>
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 pt-0">
                           <Button 
                              className="w-full" 
                              onClick={() => handleSelectDriver(driver, false)} 
                              disabled={!isAvailable}>
                                <Send className="mr-2 h-4 w-4" /> Chamar
                            </Button>
                        </div>
                    </Card>
                )
            })}
            </div>
        </div>
      )}

        {selectedDriver && (
            <RideConfirmationModal
                isOpen={isConfirmationOpen}
                onOpenChange={setIsConfirmationOpen}
                driver={selectedDriver}
                origin={origin}
                destination={destination}
                onConfirm={onRideRequest}
                isNegotiated={false} // This needs to be dynamic based on the context later
                passengerAnonymousName={user ? null : "Passageiro Anônimo"}
            />
        )}
    </div>
  );
}
