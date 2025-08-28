import DeveloperPage from "@/components/admin/DeveloperPage";
import { AppLayout } from "@/components/shared/AppLayout";

export default function Page() {
    return (
        <AppLayout title="Painel do Desenvolvedor">
            <DeveloperPage />
        </AppLayout>
    );
}
