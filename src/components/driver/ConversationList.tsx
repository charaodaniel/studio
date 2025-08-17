
'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import ChatView from "./ChatView";
import type { User } from "../admin/UserList";
import { ScrollArea } from "../ui/scroll-area";

const conversationsPlaceholder = [
    { id: '1', name: "João Passageiro", email: "jp@email.com", lastMessage: "Ok, combinado. Estou a caminho.", unread: 0, type: 'Passageiro', avatar: 'JP', phone: '11987654321', time: "10:40" },
    { id: '2', name: "Maria Silva", email: "ms@email.com", lastMessage: "Obrigada pela corrida!", unread: 0, type: 'Passageiro', avatar: 'MS', phone: '11912345678', time: "Ontem" },
];

export default function ConversationList() {
    return (
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold font-headline mb-4">Suas Conversas</h3>
            <div className="space-y-1">
                {conversationsPlaceholder.map((convo) => (
                    <Dialog key={convo.id}>
                        <DialogTrigger asChild>
                            <div className="flex items-center gap-3 p-3 -mx-3 cursor-pointer rounded-lg hover:bg-muted/50">
                                <Avatar className="h-12 w-12">
                                <AvatarImage src={convo.avatar} data-ai-hint="user portrait"/>
                                <AvatarFallback>{convo.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-baseline">
                                        <p className="font-semibold truncate">{convo.name}</p>
                                        <p className="text-xs text-muted-foreground">{convo.time}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="p-0 sm:max-w-lg h-[90vh] flex flex-col">
                            <DialogHeader className="p-4 pb-0 sr-only">
                                <DialogTitle>Chat com {convo.name}</DialogTitle>
                                <DialogDescription>Sua conversa com {convo.name}</DialogDescription>
                            </DialogHeader>
                            <ChatView user={convo as User} />
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    )
}
