import DriverDashboard from "@/components/driver/DriverDashboard";
import AppHeader from "@/components/shared/AppHeader";

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-grow">
             <DriverDashboard />
          </main>
        </div>
    )
}
