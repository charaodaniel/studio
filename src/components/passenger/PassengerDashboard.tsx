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

  useEffect(() => {
    if (!activeRide) return;

    // Subscribe to updates for the active ride
    const unsubscribe = pb.collection('rides').subscribe<RideRecord>(activeRide.id, (e) => {
        if (e.action === 'update') {
            const updatedRide = e.record;
            setActiveRide(updatedRide);

            if (updatedRide.status === 'accepted' && updatedRide.expand?.driver) {
                const driver = updatedRide.expand.driver;
                setRideDetails({
                    driverName: driver.name,
                    driverAvatar: driver.avatar ? pb.getFileUrl(driver, driver.avatar) : '',
                    vehicleModel: driver.driver_vehicle_model,
                    licensePlate: driver.driver_vehicle_plate,
                    eta: '5 minutos' // ETA can be calculated in a real app
                });
                setRideStatus('accepted');
            } else if (updatedRide.status === 'in_progress') {
                setRideStatus('in_progress');
            } else if (updatedRide.status === 'completed') {
                handleCompleteRide();
            } else if (updatedRide.status === 'canceled') {
                handleCancelRide();
                toast({
                    title: 'Corrida Cancelada',
                    description: 'O motorista cancelou a corrida.',
                    variant: 'destructive',
                });
            }
        }
    }, { expand: 'driver' });

    return () => {
        unsubscribe();
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

  return (
    <>
      <div className="container mx-auto p-4 grid lg:grid-cols-[400px_1fr] gap-8 h-full">
        <div className="h-full flex flex-col">
          {rideStatus === 'idle' || rideStatus === 'searching' ? (
            <RideRequestForm
              onRideRequest={handleRequestRide}
              isSearching={rideStatus === 'searching'}
            />
          ) : (
            rideDetails && (
              <RideStatusCard
                rideDetails={rideDetails}
                rideStatus={rideStatus}
                onCancel={handleCancelRide}
                onComplete={handleCompleteRide}
              />
            )
          )}
        </div>
        <div className="flex-1 min-h-[400px] h-full lg:min-h-0">
          <MapPlaceholder rideInProgress={rideStatus === 'in_progress' || rideStatus === 'accepted'} />
        </div>
      </div>
    </>
  );
}
