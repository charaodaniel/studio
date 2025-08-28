import { OperatorPage } from "@/components/operator/OperatorPage";
import { AppLayout } from "@/components/shared/AppLayout";

export default function Page() {
    return (
        <AppLayout title="Painel de Operações">
            <div className="bg-muted/40 min-h-screen">
            <OperatorPage />
            </div>
        </AppLayout>
    )
}
