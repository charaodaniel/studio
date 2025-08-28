

'use client';

import { useState, useEffect } from 'react';
import RideRequestForm from './RideRequestForm';
import MapPlaceholder from './MapPlaceholder';
import RideStatusCard from './RideStatusCard';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { useToast } from '@/hooks/use-toast';


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
    driver_vehicle_model: string;
    driver_vehicle_plate: string;
}

type RideStatus = 'idle' | 'searching' | 'in_progress' | 'completed' | 'canceled' | 'accepted';

export interface RideDetails {
  driverName: string;
  driverAvatar: string;
  vehicleModel: string;
  licensePlate: string;
  eta: string;
}

export default function PassengerDashboard() {
  const { toast } = useToast();
  const [rideStatus, setRideStatus] = useState<RideStatus>('idle');
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [activeRide, setActiveRide] = useState<RideRecord | null>(null);
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

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

  }, [toast]);

  useEffect(() => {
    if (!activeRide) return;

    let unsubscribe: () => void;

    const subscribeToRide = async () => {
        // Subscribe to updates for the active ride
        unsubscribe = await pb.collection('rides').subscribe<RideRecord>(activeRide.id, (e) => {
            if (e.action === 'update') {
                const updatedRide = e.record;
                
                pb.collection('rides').getOne<RideRecord>(updatedRide.id, { expand: 'driver' }).then(fullRecord => {
                  setActiveRide(fullRecord);
    
                  if (fullRecord.status === 'accepted' && fullRecord.expand?.driver) {
                      const driver = fullRecord.expand.driver;
                      setRideDetails({
                          driverName: driver.name,
                          driverAvatar: driver.avatar ? pb.getFileUrl(driver, driver.avatar) : '',
                          vehicleModel: driver.driver_vehicle_model,
                          licensePlate: driver.driver_vehicle_plate,
                          eta: '5 minutos' // ETA can be calculated in a real app
                      });
                      setRideStatus('accepted');
                  } else if (fullRecord.status === 'in_progress') {
                      setRideStatus('in_progress');
                  } else if (fullRecord.status === 'completed') {
                      handleCompleteRide();
                  } else if (fullRecord.status === 'canceled') {
                      handleCancelRide();
                      toast({
                          title: 'Corrida Cancelada',
                          description: 'O motorista cancelou a corrida.',
                          variant: 'destructive',
                      });
                  }
                });
            }
        });
    }

    subscribeToRide();

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    }
  }, [activeRide, toast]);

  const handleRequestRide = async (rideId: string) => {
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

  const handleCancelRide = async () => {
    if (activeRide) {
        try {
            await pb.collection('rides').update(activeRide.id, { status: 'canceled' });
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

  const handleRefreshLocation = () => {
    setMapRefreshKey(prev => prev + 1);
    toast({
        title: 'Localização Atualizada',
        description: 'As posições no mapa foram atualizadas.',
    });
  };

  return (
    <>
      <div className="container mx-auto p-4 grid lg:grid-cols-[400px_1fr] gap-8 h-full">
        <div className="h-full flex flex-col">
          {rideStatus === 'idle' || rideStatus === 'searching' ? (
            <RideRequestForm
              onRideRequest={handleRequestRide}
              isSearching={rideStatus === 'searching'}
              anonymousUserName={null}
            />
          ) : (
            rideDetails && activeRide && (
              <RideStatusCard
                rideDetails={rideDetails}
                rideStatus={rideStatus}
                rideId={activeRide.id}
                isNegotiated={activeRide.is_negotiated}
                onCancel={handleCancelRide}
                onComplete={handleCompleteRide}
              />
            )
          )}
        </div>
        <div className="flex-1 min-h-[400px] h-full lg:min-h-0">
          <MapPlaceholder 
            rideInProgress={rideStatus === 'in_progress' || rideStatus === 'accepted'} 
            refreshKey={mapRefreshKey}
            onRefreshLocation={handleRefreshLocation}
          />
        </div>
      </div>
    </>
  );
}
