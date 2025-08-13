import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Search, Send } from "lucide-react"
  
  const conversations = [
    { id: 1, name: "João Silva", lastMessage: "O passageiro não apareceu...", unread: 2, type: 'Motorista' },
    { id: 2, name: "Ana Clara", lastMessage: "Tive um problema com a cobrança.", unread: 0, type: 'Passageiro' },
    { id: 3, name: "Carlos Lima", lastMessage: "Meu app está travando.", unread: 0, type: 'Motorista' },
  ]
  
  export default function OperatorConversationsPage() {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <div className="flex flex-col w-full max-w-xs border-r">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold font-headline">Conversas</h2>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar..." className="pl-8" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((convo) => (
              <div key={convo.id} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 border-b">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${convo.name.charAt(0)}`} data-ai-hint="user portrait"/>
                  <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{convo.name} <span className="text-xs text-muted-foreground">({convo.type})</span></p>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
                {convo.unread > 0 && (
                  <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {convo.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png?text=J" data-ai-hint="user portrait"/>
              <AvatarFallback>J</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">João Silva</p>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/30">
            {/* Chat messages would go here */}
            <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback>J</AvatarFallback>
                </Avatar>
                <div className="bg-card rounded-lg p-3 text-sm shadow-sm">
                    <p className="font-bold">João Silva</p>
                    <p>Olá, estou no local de partida há 10 minutos mas o passageiro não apareceu. O que devo fazer?</p>
                </div>
            </div>
            <div className="flex items-start gap-3 flex-row-reverse">
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback>OP</AvatarFallback>
                </Avatar>
                <div className="bg-primary text-primary-foreground rounded-lg p-3 text-sm shadow-sm">
                    <p className="font-bold">Operador</p>
                    <p>Olá, João. Vou tentar contato com o passageiro. Por favor, aguarde mais 5 minutos. Se não houver resposta, você pode cancelar a corrida sem penalidade.</p>
                </div>
            </div>
          </div>
          <div className="p-4 border-t bg-background">
            <div className="relative">
              <Input placeholder="Digite sua mensagem..." className="pr-12" />
              <Button size="icon" className="absolute top-1/2 -translate-y-1/2 right-2">
                <Send className="w-4 h-4"/>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  