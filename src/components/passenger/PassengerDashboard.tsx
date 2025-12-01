
'use client';

import { useState, useEffect, useCallback } from 'react';
import RideRequestForm from './RideRequestForm';
import RideStatusCard from './RideStatusCard';
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
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc } from 'firebase/firestore';


interface RideRecord {
    id: string;
    status: RideStatus;
    is_negotiated: boolean;
    passenger_anonymous_name?: string;
    passenger: string;
    expand?: {
        driver: DriverRecord;
    }
}

interface DriverRecord {
    id: string;
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
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
        setCurrentUser(user);
        if (user) {
            fetchActiveRide(user.uid);
        }
    });
    return unsubscribe;
  }, []);

  const fetchActiveRide = useCallback(async (userId: string) => {
    const q = query(collection(db, 'rides'), where('passenger', '==', userId), where('status', 'in', ['accepted', 'in_progress']));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
            const rideDoc = snapshot.docs[0];
            const rideData = { id: rideDoc.id, ...rideDoc.data() } as RideRecord;

            const driverDoc = await getDoc(doc(db, 'users', rideData.expand?.driver.id || ''));
            const driverData = driverDoc.data() as DriverRecord;

            setActiveRide({ ...rideData, expand: { driver: driverData } });
            setRideStatus(rideData.status);
            setRideDetails({
                driverName: driverData.name || 'Motorista',
                driverAvatar: driverData.avatar || '',
                driverPhone: driverData.phone || '',
                vehicleModel: driverData.driver_vehicle_model || 'Não informado',
                licensePlate: driverData.driver_vehicle_plate || 'Não informado',
                eta: '5 min'
            });
        } else {
            setActiveRide(null);
            setRideStatus('idle');
            setRideDetails(null);
        }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Ask for location permission
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            () => {}, // Success, do nothing
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                     toast({
                        title: 'Permissão de Localização Negada',
                        description: 'Para uma melhor experiência, considere ativar a localização.',
                        variant: 'destructive',
                        duration: 7000
                    });
                }
            }
        )
    }

    const driversQuery = query(collection(db, 'users'), where('role', 'array-contains', 'Motorista'), where('disabled', '!=', true), where('driver_status', '==', 'online'));
    const unsubscribeDrivers = onSnapshot(driversQuery, (snapshot) => {
        const driverList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
        setDrivers(driverList);
        setIsLoadingDrivers(false);
    }, (error) => {
        console.error(error);
        toast({variant: 'destructive', title: 'Erro ao buscar motoristas'});
        setIsLoadingDrivers(false);
    });

    let rideUnsubscribe: (() => void) | null = null;
    if (currentUser?.uid) {
        fetchActiveRide(currentUser.uid).then(unsub => {
            if (unsub) rideUnsubscribe = unsub;
        });
    }

    return () => {
        unsubscribeDrivers();
        if (rideUnsubscribe) rideUnsubscribe();
    }
  }, [currentUser, fetchActiveRide, toast]);
  

  const handleRideUpdate = useCallback((updatedRide: RideRecord) => {
    setActiveRide(updatedRide);
    
    if (updatedRide.status === 'accepted' && rideStatus !== 'accepted') {
        const driverData = updatedRide.expand?.driver;
        if (driverData) {
            setRideStatus('accepted');
            setRideDetails({
                driverName: driverData.name || 'Motorista',
                driverAvatar: driverData.avatar || '',
                driverPhone: driverData.phone || '',
                vehicleModel: driverData.driver_vehicle_model || 'Não informado',
                licensePlate: driverData.driver_vehicle_plate || 'Não informado',
                eta: '5 min' // Placeholder
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
    if (!activeRide?.id) return;
    
    const unsubscribe = onSnapshot(doc(db, 'rides', activeRide.id), async (docSnap) => {
      if (docSnap.exists()) {
        const rideData = { id: docSnap.id, ...docSnap.data() } as RideRecord;
        
        if (rideData.driver) {
             const driverDoc = await getDoc(doc(db, 'users', rideData.driver));
             if (driverDoc.exists()) {
                rideData.expand = { driver: driverDoc.data() as DriverRecord };
             }
        }
        handleRideUpdate(rideData);
      }
    });

    return () => unsubscribe();
  }, [activeRide?.id, handleRideUpdate]);


  const onRideRequest = (rideId: string) => {
    setRideStatus('searching');
    getDoc(doc(db, 'rides', rideId)).then(rideSnap => {
        if (rideSnap.exists()) {
            setActiveRide(rideSnap.data() as RideRecord);
        }
    }).catch(error => {
        console.error(error);
        setRideStatus('idle');
        toast({title: 'Erro', description: 'Não foi possível acompanhar o status da corrida.'})
    })
  };

  const handleCancelRide = async (updateDb = true) => {
    if (updateDb && activeRide) {
        await updateDoc(doc(db, 'rides', activeRide.id), { status: 'canceled' });
        toast({
            title: 'Corrida Cancelada',
            description: 'Sua solicitação foi cancelada.',
            variant: 'destructive'
        });
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
            anonymousUserName={currentUser ? null : 'Anônimo'}
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
                                    <AvatarImage src={driver.avatar || ''} data-ai-hint="driver portrait" />
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
                passengerAnonymousName={currentUser ? null : "Passageiro Anônimo"}
            />
        )}
    </div>
  );
}
