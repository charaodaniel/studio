import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Badge } from "@/components/ui/badge";
  import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
  import { ScrollArea } from "../ui/scroll-area";
  
  const drivers = [
    { id: 1, name: "Roberto Andrade", vehicle: 'Chevrolet Onix', avatar: 'RA', status: "Online" },
    { id: 2, name: "João Silva", vehicle: 'Toyota Corolla', avatar: 'JS', status: "Em Viagem" },
    { id: 3, name: "Maria Souza", vehicle: 'Honda Civic', avatar: 'MS', status: "Online" },
    { id: 4, name: "Carlos Lima", vehicle: 'Chevrolet Onix', avatar: 'CL', status: "Offline" },
    { id: 5, name: "Ana Pereira", vehicle: 'Hyundai HB20', avatar: 'AP', status: "Online" },
    { id: 6, name: "Beatriz Costa", vehicle: 'Fiat Mobi', avatar: 'BC', status: "Offline" },
    { id: 7, name: "Daniel Faria", vehicle: 'Renault Kwid', avatar: 'DF', status: "Em Viagem" },

  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Online':
            return 'default';
        case 'Em Viagem':
            return 'secondary';
        case 'Offline':
            return 'destructive';
        default:
            return 'outline';
    }
  }

  const getStatusClass = (status: string) => {
     switch (status) {
        case 'Online':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Em Viagem':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Offline':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return '';
    }
  }
  
  export default function DriverStatusList() {
    return (
        <ScrollArea className="h-full">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Motorista</TableHead>
                        <TableHead className="hidden sm:table-cell">Veículo</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${driver.avatar}`} data-ai-hint="driver portrait" />
                                    <AvatarFallback>{driver.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{driver.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{driver.vehicle}</TableCell>
                        <TableCell>
                            <Badge variant={'outline'} className={getStatusClass(driver.status)}>{driver.status}</Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
      </ScrollArea>
    );
  }
  