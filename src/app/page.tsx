import AppHeader from "@/components/shared/AppHeader";
import PassengerDashboard from "@/components/passenger/PassengerDashboard";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <main className="flex-grow overflow-hidden">
        <PassengerDashboard />
      </main>
    </div>
  );
}