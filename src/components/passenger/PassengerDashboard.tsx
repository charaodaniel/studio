import RideRequestForm from './RideRequestForm';
import MapPlaceholder from './MapPlaceholder';

export default function PassengerDashboard() {
  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)]">
      <div className="lg:w-1/3 lg:max-w-md">
        <RideRequestForm />
      </div>
      <div className="flex-1 min-h-[300px]">
        <MapPlaceholder />
      </div>
    </div>
  );
}
