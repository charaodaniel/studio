import AdminDashboard from "@/components/admin/AdminDashboard";
import { AppLayout } from "@/components/shared/AppLayout";

export default function AdminPage() {
  return (
    <AppLayout title="Painel Administrativo">
        <div className="bg-muted/40 min-h-screen">
            <AdminDashboard />
        </div>
    </AppLayout>
  );
}
