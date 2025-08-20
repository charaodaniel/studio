'use client';

import { useState } from 'react';
import RideRequestForm from './RideRequestForm';
import MapPlaceholder from './MapPlaceholder';
import RideStatusCard from './RideStatusCard';

type RideStatus = 'idle' | 'searching' | 'in_progress' | 'completed';

export interface RideDetails {
  driverName: string;
  driverAvatar: string;
  vehicleModel: string;
  licensePlate: string;
  eta: string;
}

export default function PassengerDashboard() {
  const [rideStatus, setRideStatus] = useState<RideStatus>('idle');
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);

  const handleRequestRide = () => {
    setRideStatus('searching');
    // Simulate finding a driver
    setTimeout(() => {
      setRideDetails({
        driverName: 'Roberto Andrade',
        driverAvatar: 'https://placehold.co/128x128.png',
        vehicleModel: 'Chevrolet Onix',
        licensePlate: 'BRA2E19',
        eta: '5 minutos',
      });
      setRideStatus('in_progress');
    }, 3000);
  };

  const handleCancelRide = () => {
    setRideStatus('idle');
    setRideDetails(null);
  };
  
  const handleCompleteRide = () => {
    setRideStatus('completed');
     // Reset after a delay
    setTimeout(() => {
        setRideStatus('idle');
        setRideDetails(null);
    }, 5000);
  }

  return (
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
        <MapPlaceholder rideInProgress={rideStatus === 'in_progress'} />
      </div>
    </div>
  );
}
