import { DriverProfilePage } from "@/components/driver/DriverProfilePage";
import { AppLayout } from "@/components/shared/AppLayout";

export default function Page() {
    return (
       <AppLayout title="Painel do Motorista">
         <div className="bg-muted/40 min-h-screen">
            <DriverProfilePage />
        </div>
       </AppLayout>
    )
}
