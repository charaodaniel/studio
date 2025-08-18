import RideRequestForm from './RideRequestForm';
import MapPlaceholder from './MapPlaceholder';

export default function PassengerDashboard() {
  return (
    <div className="container mx-auto p-4 grid lg:grid-cols-[400px_1fr] gap-8 h-full">
      <div className="h-full flex flex-col">
        <RideRequestForm />
      </div>
      <div className="flex-1 min-h-[400px] h-full lg:min-h-0">
        <MapPlaceholder />
      </div>
    </div>
  );
}
