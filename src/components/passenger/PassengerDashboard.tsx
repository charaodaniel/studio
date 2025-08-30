

'use client';

import { useState, useEffect } from 'react';
import RideRequestForm from './RideRequestForm';
import RideStatusCard from './RideStatusCard';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, Car, Send } from 'lucide-react';
import type { User as Driver } from '../admin/UserList';
import RideConfirmationModal from './RideConfirmationModal';
import { cn } from '@/lib/utils';


interface RideRecord extends RecordModel {
    status: RideStatus;
    is_negotiated: boolean;
    passenger_anonymous_name?: string;
    expand?: {
        driver: DriverRecord;
    }
}

interface DriverRecord extends RecordModel {
    name: string;
    avatar: string;
    phone: string;
    driver_vehicle_model: string;
    driver_vehicle_plate: string;
}

type RideStatus = 'idle' | 'searching' | 'in_progress' | 'completed' | 'canceled' | 'accepted';

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

  useEffect(() => {
    // Ask for location permission on component mount
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Permission granted. We don't need to use the coordinates for now.
                console.log("Location permission granted.");
            },
            (error) => {
                // Permission denied or other error.
                if (error.code === error.PERMISSION_DENIED) {
                    toast({
                        title: 'Permissão de Localização Negada',
                        description: 'Para uma melhor experiência, considere ativar a localização nas configurações do seu navegador.',
                        variant: 'destructive',
                        duration: 5000,
                    });
                }
            }
        );
    }
     const fetchDrivers = async () => {
        setIsLoadingDrivers(true);
        try {
            const driverRecords = await pb.collection('users').getFullList<Driver>({
                filter: 'role = "Motorista"',
            });
            setDrivers(driverRecords);
        } catch (error) {
            console.error("Failed to fetch drivers:", error);
            toast({ variant: 'destructive', title: 'Erro ao buscar motoristas' });
        } finally {
            setIsLoadingDrivers(false);
        }
    };
    fetchDrivers();

  }, [toast]);

  useEffect(() => {
    if (!activeRide) return;

    const subscribeToRideUpdates = async () => {
        try {
            const unsubscribe = await pb.collection('rides').subscribe(activeRide.id, (e) => {
                if (e.action === 'update') {
                    const updatedRide = e.record as RideRecord;
                    
                    pb.collection('rides').getOne<RideRecord>(updatedRide.id, { expand: 'driver' }).then(fullRecord => {
                      setActiveRide(fullRecord);
        
                      if (fullRecord.status === 'accepted' && fullRecord.expand?.driver) {
                          const driver = fullRecord.expand.driver;
                          setRideDetails({
                              driverName: driver.name,
                              driverAvatar: driver.avatar ? pb.getFileUrl(driver, driver.avatar) : '',
                              driverPhone: driver.phone,
                              vehicleModel: driver.driver_vehicle_model,
                              licensePlate: driver.driver_vehicle_plate,
                              eta: '5 minutos' // ETA can be calculated in a real app
                          });
                          setRideStatus('accepted');
                          playNotification();
                          toast({
                            title: 'Corrida Aceita!',
                            description: `${driver.name} está a caminho.`,
                          });
                      } else if (fullRecord.status === 'in_progress') {
                          setRideStatus('in_progress');
                      } else if (fullRecord.status === 'completed') {
                          handleCompleteRide();
                      } else if (fullRecord.status === 'canceled') {
                          handleCancelRide(false); // Do not update DB again
                          toast({
                              title: 'Corrida Cancelada',
                              description: 'O motorista cancelou a corrida.',
                              variant: 'destructive',
                          });
                      }
                    });
                }
            });
            
             return () => {
                pb.collection('rides').unsubscribe(activeRide.id);
            };
        } catch (error) {
            console.error("Failed to subscribe to ride updates:", error);
        }
    };

    subscribeToRideUpdates();

    return () => {
        // Correct way to unsubscribe from all subscriptions on a collection
        pb.collection('rides').unsubscribe('*');
    }
  }, [activeRide, toast, playNotification]);

  const onRideRequest = async (rideId: string) => {
    setRideStatus('searching');
    try {
        const ride = await pb.collection('rides').getOne<RideRecord>(rideId, { expand: 'driver' });
        setActiveRide(ride);
    } catch (error) {
        console.error("Failed to fetch created ride:", error);
        setRideStatus('idle');
        toast({ title: 'Erro', description: 'Não foi possível acompanhar o status da corrida.'})
    }
  };

  const handleCancelRide = async (updateDb = true) => {
    if (updateDb && activeRide) {
        try {
            await pb.collection('rides').update(activeRide.id, { status: 'canceled' });
            toast({
                title: 'Corrida Cancelada',
                description: 'Sua solicitação foi cancelada.',
                variant: 'destructive',
            });
        } catch (error) {
            console.error("Failed to cancel ride:", error);
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

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsConfirmationOpen(true);
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-8 h-full">
      <div className="w-full lg:max-w-md mx-auto">
        {rideStatus === 'idle' || rideStatus === 'searching' ? (
          <RideRequestForm
            onRideRequest={onRideRequest}
            isSearching={rideStatus === 'searching'}
            anonymousUserName={null}
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
          />
        ) : (
          rideDetails && activeRide && (
            <RideStatusCard
              rideDetails={rideDetails}
              rideStatus={rideStatus}
              rideId={activeRide.id}
              isNegotiated={activeRide.is_negotiated}
              onCancel={() => handleCancelRide(true)}
              onComplete={handleCompleteRide}
            />
          )
        )}
      </div>

      {(rideStatus === 'idle' || rideStatus === 'searching') && (
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
                                    <AvatarImage src={driver.avatar ? pb.getFileUrl(driver, driver.avatar) : ''} data-ai-hint="driver portrait" />
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
                              onClick={() => handleSelectDriver(driver)} 
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
                isNegotiated={false} // This view logic defaults to non-negotiated. The form handles negotiation.
                onConfirm={onRideRequest}
                passengerAnonymousName={null}
            />
        )}
    </div>
  );
}
