import PassengerDashboard from "@/components/passenger/PassengerDashboard";
import { AppLayout } from "@/components/shared/AppLayout";

export default function Home() {
  return (
      <AppLayout title="Bem-vindo!">
        <main className="flex-grow overflow-hidden">
          <PassengerDashboard />
        </main>
      </AppLayout>
  );
}
