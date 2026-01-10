
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GitBranch, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DeveloperPageOld() {
    const [jsonContent, setJsonContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSaveContent = async () => {
        setIsLoading(true);
        let parsedContent;
        try {
            parsedContent = JSON.parse(jsonContent);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'JSON Inválido',
                description: 'O conteúdo inserido não é um JSON válido. Por favor, verifique a sintaxe.',
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/save-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filePath: 'src/database/banco.json', // Caminho do arquivo a ser atualizado
                    content: JSON.stringify(parsedContent, null, 2), // Formata o JSON antes de salvar
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao salvar o arquivo no GitHub.');
            }
            
            toast({
                title: 'Conteúdo Salvo com Sucesso!',
                description: 'O arquivo foi atualizado no repositório. Um novo deploy foi iniciado.',
            });
            setJsonContent(''); // Limpa o campo após o sucesso

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: error.message || 'Ocorreu um erro desconhecido.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto p-4 sm:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold font-headline text-slate-800">Painel de Edição de Conteúdo (Legado)</h1>
                    <p className="text-muted-foreground">Altere o conteúdo do site atualizando o arquivo `banco.json` diretamente no repositório.</p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><GitBranch /> Editar banco.json</CardTitle>
                        <CardDescription>
                            Cole o conteúdo completo do novo arquivo JSON abaixo. Ao salvar, um `commit` será feito no repositório,
                            disparando um novo deploy com as alterações.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder='Cole o conteúdo do seu arquivo JSON aqui...'
                            className="min-h-[400px] font-mono text-xs"
                            value={jsonContent}
                            onChange={(e) => setJsonContent(e.target.value)}
                        />
                         <Button onClick={handleSaveContent} disabled={isLoading || !jsonContent} className="mt-4 w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar e Fazer Deploy
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
