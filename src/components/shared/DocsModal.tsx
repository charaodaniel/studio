
'use client';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle as UiCardTitle } from '@/components/ui/card';
import Logo from '@/components/shared/Logo';
import { User, Car, ShieldCheck } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';


export default function DocsModal() {
  return (
     <DialogContent className="max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
            <DialogTitle className="font-headline text-xl">Central de Ajuda</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
            <div className="bg-muted/40 py-8 md:py-12 px-4">
                <header className="text-center mb-12">
                <div className="flex justify-center mb-4 w-48 mx-auto">
                    <Logo />
                </div>
                <h1 className="text-4xl font-bold font-headline text-slate-800">Central de Ajuda e Documentação</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Tudo o que você precisa saber para usar o CEOLIN Mobilidade Urbana.
                </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card>
                    <CardHeader>
                    <UiCardTitle className="flex items-center gap-3 font-headline">
                        <User className="text-primary" />
                        Para Passageiros
                    </UiCardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        <strong>1. Solicite sua Viagem:</strong> Abra o aplicativo, insira seu local de partida e destino. Para corridas locais, o valor estimado é calculado automaticamente. Para viagens ao interior, você pode negociar o valor diretamente com o motorista.
                    </p>
                    <p>
                        <strong>2. Escolha o Motorista:</strong> Veja a lista de motoristas disponíveis, seus veículos e avaliações. Para viagens negociáveis, inicie uma conversa para acertar o valor.
                    </p>
                    <p>
                        <strong>3. Confirme e Acompanhe:</strong> Após confirmar a solicitação, acompanhe a chegada do seu motorista pelo mapa em tempo real.
                    </p>
                    <p>
                        <strong>4. Viaje com Segurança:</strong> Todas as informações do motorista e do veículo estão disponíveis para você. Em caso de necessidade, utilize o chat para se comunicar durante a viagem.
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                    <UiCardTitle className="flex items-center gap-3 font-headline">
                        <Car className="text-primary" />
                        Para Motoristas
                    </UiCardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        <strong>1. Fique Online:</strong> Acesse seu painel e altere seu status para "Online" para começar a receber solicitações de corridas.
                    </p>
                    <p>
                        <strong>2. Receba e Aceite Corridas:</strong> Novas solicitações aparecerão em seu painel. Analise a origem, destino e valor. Para corridas de interior, você pode negociar o valor final com o passageiro através do chat.
                    </p>
                    <p>
                        <strong>3. Gerencie a Viagem:</strong> Após aceitar, utilize os botões para indicar quando o passageiro embarcou e para finalizar a corrida ao chegar ao destino.
                    </p>
                    <p>
                        <strong>4. Mantenha seu Perfil Atualizado:</strong> No seu painel, você pode atualizar suas informações pessoais, dados do veículo, documentos e configurações de tarifa.
                    </p>
                    </CardContent>
                </Card>
                </div>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                    <UiCardTitle className="flex items-center gap-3 font-headline">
                        <ShieldCheck className="text-primary" />
                        Informações Institucionais
                    </UiCardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                        <p><strong>Razão Social:</strong> CEOLIN LTDA</p>
                        <p><strong>CNPJ:</strong> 52.905.738/0001-00</p>
                        <p><strong>Contato para Suporte:</strong> suporte@ceolin.com.br</p>
                        <p><strong>Endereço:</strong> Manoel Viana, RS, Brasil</p>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
     </DialogContent>
  );
}
