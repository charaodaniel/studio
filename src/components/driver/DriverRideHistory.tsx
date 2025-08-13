import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, PlusCircle } from "lucide-react"

const rides = [
  { id: 'RIDE001', date: '2024-07-20', passenger: 'Ana Clara', value: 'R$ 25,00', status: 'Concluída' },
  { id: 'RIDE002', date: '2024-07-20', passenger: 'Bruno Costa', value: 'R$ 100,00', status: 'Concluída' },
  { id: 'RIDE003', date: '2024-07-19', passenger: 'Carla Dias', value: 'R$ 15,50', status: 'Cancelada' },
  { id: 'RIDE004', date: '2024-07-19', passenger: 'Daniel Faria', value: 'R$ 32,00', status: 'Concluída' },
];

export default function DriverRideHistory() {
  return (
    <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold font-headline">Histórico de Corridas</h3>
            <div className="flex gap-2">
                <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Registrar Corrida</Button>
            </div>
        </div>
      <Table>
        <TableCaption>Uma lista das suas corridas recentes.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Passageiro</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rides.map((ride) => (
            <TableRow key={ride.id}>
              <TableCell>{ride.date}</TableCell>
              <TableCell className="font-medium">{ride.passenger}</TableCell>
              <TableCell className="text-right">{ride.value}</TableCell>
              <TableCell>
                <Badge variant={ride.status === 'Concluída' ? 'default' : 'destructive'}>
                  {ride.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
