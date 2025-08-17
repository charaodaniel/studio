import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Handshake, Check, X, MapPin, MessageSquare, Eye } from "lucide-react"
import NegotiationChat from "./NegotiationChat"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const requests = [
    { id: 1, passengerName: "João Passageiro", rating: 4.8, avatar: 'JP', from: "Shopping Pátio", to: "Centro da Cidade", price: "R$ 25,50", type: "Tarifa Fixa", passengerOffer: null, driverSuggestion: null },
    { id: 2, passengerName: "Maria Eduarda", rating: 4.9, avatar: 'ME', from: "Bairro das Palmeiras, 789", to: "Cidade Vizinha (aprox. 50km)", price: null, type: "A Negociar", passengerOffer: "R$ 80,00", driverSuggestion: "R$ 100,00" },
];


export default function RideRequests() {
    const [selectedRequest, setSelectedRequest] = useState(requests[1]);
    
  return (
    <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold font-headline">Você tem {requests.length} novas solicitações.</h3>
        {requests.map(request => (
            <Card key={request.id} className="cursor-pointer transition-all shadow-md overflow-hidden">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${request.avatar}`} data-ai-hint="passenger portrait" />
                            <AvatarFallback>{request.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold">{request.passengerName}</p>
                            <p className="text-sm text-muted-foreground">⭐ {request.rating}</p>
                        </div>
                    </div>
                     <div className="text-sm space-y-2 pl-2 border-l-2 ml-5">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-1 text-green-500" /> 
                            <p><span className="text-muted-foreground">De:</span> {request.from}</p>
                        </div>
                        <div className="flex items-start gap-2">
                             <MapPin className="w-4 h-4 mt-1 text-red-500" />
                             <p><span className="text-muted-foreground">Para:</span> {request.to}</p>
                        </div>
                    </div>
                    {request.price && <div className="font-bold text-xl text-primary pt-2 text-center">{request.price}</div>}
                </CardContent>
                <CardFooter className="p-0">
                    <Button variant={'secondary'} className="flex-1 rounded-none rounded-bl-lg">
                        <X className="mr-2"/> Rejeitar
                    </Button>
                     <Button className="flex-1 rounded-none rounded-br-lg">
                        <Check className="mr-2"/> Aceitar
                    </Button>
                </CardFooter>
            </Card>
        ))}
    </div>
  )
}
