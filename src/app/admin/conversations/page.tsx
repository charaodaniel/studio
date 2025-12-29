'use client';

import { useState } from "react";
import { AppLayout } from "@/components/shared/AppLayout";
import UserManagement from "@/components/admin/UserManagement";
import type { User as UserData } from "@/components/admin/UserList";

export default function ConversationsPage() {
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    return (
        <AppLayout title="Conversas">
            <div className="bg-muted/40 min-h-screen">
                <UserManagement 
                    preselectedUser={selectedUser}
                    onUserSelect={setSelectedUser}
                />
            </div>
        </AppLayout>
    );
}