import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Handshake, Check, X, MapPin } from "lucide-react"
import NegotiationChat from "./NegotiationChat"

export default function RideRequests() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline">Corrida para o Centro</CardTitle>
              <CardDescription>Novo pedido de passageiro</CardDescription>
            </div>
            <Badge variant="default">Tarifa Fixa</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span>R. das Flores, 123</span></div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span>Av. Principal, 456</span></div>
          <div className="font-bold text-lg text-primary">R$ 25,00</div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button className="w-full"><Check className="mr-2 h-4 w-4" /> Aceitar</Button>
          <Button variant="destructive" className="w-full"><X className="mr-2 h-4 w-4" /> Rejeitar</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline">Viagem para Cidade Vizinha</CardTitle>
              <CardDescription>Pedido intermunicipal</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">A Negociar</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span>Centro da Cidade Atual</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span>Cidade Vizinha (aprox. 50km)</span></div>
            <div className="text-sm text-muted-foreground">Oferta do passageiro: <span className="font-bold text-foreground">R$ 80,00</span></div>
            <div className="text-sm text-muted-foreground">Sua sugestão: <span className="font-bold text-foreground">R$ 100,00</span></div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full"><Handshake className="mr-2 h-4 w-4" /> Iniciar Negociação</Button>
        </CardFooter>
      </Card>
      
      <div className="md:col-span-2">
        <NegotiationChat />
      </div>
    </div>
  )
}
