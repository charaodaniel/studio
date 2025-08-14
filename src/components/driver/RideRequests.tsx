import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Handshake, Check, X, MapPin } from "lucide-react"
import NegotiationChat from "./NegotiationChat"
import { useState } from "react"

const requests = [
    { id: 1, title: "Corrida para o Centro", description: "Novo pedido de passageiro", type: "Tarifa Fixa", from: "R. das Flores, 123", to: "Av. Principal, 456", price: "R$ 25,00", passengerOffer: null, driverSuggestion: null },
    { id: 2, title: "Viagem para Cidade Vizinha", description: "Pedido intermunicipal", type: "A Negociar", from: "Centro da Cidade Atual", to: "Cidade Vizinha (aprox. 50km)", price: null, passengerOffer: "R$ 80,00", driverSuggestion: "R$ 100,00" },
    { id: 3, title: "Levar ao Aeroporto", description: "Novo pedido de passageiro", type: "Tarifa Fixa", from: "Bairro das Palmeiras, 789", to: "Aeroporto Internacional", price: "R$ 45,00", passengerOffer: null, driverSuggestion: null },
];


export default function RideRequests() {
    const [selectedRequest, setSelectedRequest] = useState(requests[1]);
    
  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold font-headline">Novas Solicitações</h3>
            {requests.map(request => (
                <Card key={request.id} className={`cursor-pointer transition-all ${selectedRequest?.id === request.id ? 'border-primary shadow-lg' : 'hover:bg-card/90'}`} onClick={() => setSelectedRequest(request)}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="font-headline text-md">{request.title}</CardTitle>
                                <CardDescription className="text-xs">{request.description}</CardDescription>
                            </div>
                            <Badge variant={request.type === "Tarifa Fixa" ? 'default' : 'secondary'} className={request.type === "A Negociar" ? "bg-accent text-accent-foreground" : ""}>{request.type}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span>{request.from}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span>{request.to}</span></div>
                        {request.price && <div className="font-bold text-md text-primary pt-2">{request.price}</div>}
                    </CardContent>
                </Card>
            ))}
        </div>
      
      <div className="h-full">
        {selectedRequest ? (
             selectedRequest.type === 'A Negociar' ? (
                <NegotiationChat request={selectedRequest}/>
             ) : (
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="font-headline">{selectedRequest.title}</CardTitle>
                        <CardDescription>{selectedRequest.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span>{selectedRequest.from}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span>{selectedRequest.to}</span></div>
                        <div className="font-bold text-2xl text-primary pt-4">{selectedRequest.price}</div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button className="w-full"><Check className="mr-2 h-4 w-4" /> Aceitar</Button>
                        <Button variant="destructive" className="w-full"><X className="mr-2 h-4 w-4" /> Rejeitar</Button>
                    </CardFooter>
                </Card>
             )
        ) : (
            <div className="flex items-center justify-center h-full bg-card rounded-lg">
                <p className="text-muted-foreground">Selecione uma solicitação para ver os detalhes.</p>
            </div>
        )}
      </div>
    </div>
  )
}