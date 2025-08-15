import DriverDashboard from "@/components/driver/DriverDashboard";
import AppHeader from "@/components/shared/AppHeader";
import Logo from "@/components/shared/Logo";
import Link from "next/link";

export default function Page() {
    return (
        <div className="bg-muted/40 min-h-screen">
            <div className="container mx-auto p-4 sm:p-8">
                <header className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold font-headline text-slate-800">Painel do Motorista</h1>
                        <p className="text-muted-foreground">Gerencie suas corridas, perfil e ganhos.</p>
                    </div>
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <Logo className="h-6 w-6" />
                        <span className="font-semibold font-headline">CEOLIN Mobilidade Urbana</span>
                    </Link>
                </header>
                <DriverDashboard />
            </div>
        </div>
    )
}
