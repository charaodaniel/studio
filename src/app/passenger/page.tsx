import { PassengerProfilePage } from "@/components/passenger/PassengerProfilePage";
import { AppLayout } from "@/components/shared/AppLayout";

export default function Page() {
    return (
        <AppLayout title="Meu Perfil">
            <div className="bg-muted/40 min-h-screen">
                <PassengerProfilePage />
            </div>
        </AppLayout>
    )
}
