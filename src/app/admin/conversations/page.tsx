import UserManagement from "@/components/admin/UserManagement";
import { AppLayout } from "@/components/shared/AppLayout";

export default function ConversationsPage() {
    return (
        <AppLayout title="Conversas">
            <UserManagement />
        </AppLayout>
    );
}
