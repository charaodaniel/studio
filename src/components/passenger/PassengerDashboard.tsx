import RideRequestForm from './RideRequestForm';
import MapPlaceholder from './MapPlaceholder';

export default function PassengerDashboard() {
  return (
    <div className="container mx-auto p-4 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        <div className="lg:col-span-1">
          <RideRequestForm />
        </div>
        <div className="lg:col-span-2 h-[500px] lg:h-auto">
          <MapPlaceholder />
        </div>
      </div>
    </div>
  );
}
