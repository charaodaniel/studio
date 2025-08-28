import { AppLayout } from "@/components/shared/AppLayout";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppLayout title="Documentação">
            {children}
        </AppLayout>
    );
}
