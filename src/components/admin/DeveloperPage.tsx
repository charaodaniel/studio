'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, AlertTriangle, CheckCircle, Cpu, Link as LinkIcon, Server, Loader2, Code, MoreHorizontal, EyeOff, GitBranch } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import pb from "@/lib/pocketbase";

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

export default function DeveloperPage() {
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [testResult, setTestResult] = useState<string | null>(null);
    const [pbUrl, setPbUrl] = useState(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://mobmv.shop');

    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestResult(null);
        try {
            const health = await pb.health.check();
            if (health.code === 200) {
                setTestStatus('success');
                setTestResult(`Conexão com o PocketBase em ${pb.baseUrl} bem-sucedida!`);
            } else {
                throw new Error(`O servidor retornou o status: ${health.code} ${health.message}`);
            }
        } catch (error: any) {
            setTestStatus('error');
            let errorMessage = `Falha ao conectar ao servidor PocketBase.`;
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage += ` Causa provável: A URL do PocketBase (${pb.baseUrl}) está incorreta, offline ou bloqueada por CORS.`;
            } else {
                errorMessage += ` Detalhe: ${error.message}`;
            }
            
            setTestResult(errorMessage);
        }
    };
    
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto p-4 sm:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold font-headline text-slate-800">Painel do Desenvolvedor</h1>
                    <p className="text-muted-foreground">Ferramentas de diagnóstico para o backend PocketBase.</p>
                </header>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Server /> Teste de Conexão com Backend</CardTitle>
                        <CardDescription>
                            Verifica se o aplicativo consegue se comunicar com o servidor PocketBase configurado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex w-full max-w-md items-center space-x-2">
                           <Input value={pbUrl} readOnly disabled/>
                            <Button onClick={handleTestConnection} disabled={testStatus === 'loading'}>
                                {testStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Testar Conexão
                            </Button>
                        </div>

                        {testStatus !== 'idle' && (
                            <div className="mt-4">
                                {testStatus === 'loading' && (
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando...
                                    </p>
                                )}
                                {testStatus === 'success' && (
                                    <Alert variant="default" className="border-green-500 bg-green-50">
                                        <CheckCircle className="h-4 w-4 !text-green-600" />
                                        <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
                                        <AlertDescription className="text-green-700">
                                            {testResult}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {testStatus === 'error' && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Erro de Conexão</AlertTitle>
                                        <AlertDescription>
                                            {testResult}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Variáveis de Ambiente</CardTitle>
                        <CardDescription>
                            A variável abaixo precisa estar configurada no arquivo `.env.local` (para desenvolvimento)
                             e nas "Environment Variables" da Vercel (para produção).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-md bg-slate-100">
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="font-mono text-sm">NEXT_PUBLIC_POCKETBASE_URL</p>
                                    <p className="text-xs text-muted-foreground">Ex: https://mobmv.shop</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
