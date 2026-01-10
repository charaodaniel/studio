
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, AlertTriangle, CheckCircle, Cpu, Link as LinkIcon, Server, Loader2, Code, MoreHorizontal, EyeOff, GitBranch } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PocketBase from 'pocketbase';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

export default function DeveloperPage() {
    const { toast } = useToast();
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [testResult, setTestResult] = useState<string | null>(null);
    const [pbUrl, setPbUrl] = useState(process.env.NEXT_PUBLIC_POCKETBASE_URL || '');
    const [githubRepo, setGithubRepo] = useState(process.env.GITHUB_REPO || '');
    const [githubToken, setGithubToken] = useState(process.env.GITHUB_TOKEN ? '********' : '');


    const handleTestConnection = async () => {
        if (!pbUrl) {
             setTestStatus('error');
             setTestResult('A URL do PocketBase não pode estar vazia.');
             return;
        }
        setTestStatus('loading');
        setTestResult(null);
        try {
            const tempPb = new PocketBase(pbUrl);
            const health = await tempPb.health.check();
            if (health.code === 200) {
                setTestStatus('success');
                setTestResult(`Conexão com o PocketBase em ${pbUrl} bem-sucedida!`);
            } else {
                throw new Error(`O servidor retornou o status: ${health.code} ${health.message}`);
            }
        } catch (error: any) {
            setTestStatus('error');
            let errorMessage = `Falha ao conectar ao servidor PocketBase.`;
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage += ` Causa provável: A URL (${pbUrl}) está incorreta, offline ou bloqueada por CORS.`;
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
                    <p className="text-muted-foreground">Ferramentas de diagnóstico e configuração do backend.</p>
                </header>
                
                 <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Server /> Conexão com Backend (PocketBase)</CardTitle>
                        <CardDescription>
                            Verifique a conexão com o servidor PocketBase. Esta URL é definida pela variável `NEXT_PUBLIC_POCKETBASE_URL`.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex w-full max-w-md items-center space-x-2">
                           <Input 
                                value={pbUrl} 
                                onChange={(e) => setPbUrl(e.target.value)}
                                placeholder="https://seu-pocketbase.com"
                            />
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
                        <CardTitle className="flex items-center gap-2"><GitBranch /> Configuração do CMS (GitHub)</CardTitle>
                        <CardDescription>
                            Verifique as variáveis de ambiente usadas para salvar o conteúdo no repositório do GitHub.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Repositório (GITHUB_REPO)</Label>
                            <Input value={githubRepo} readOnly placeholder="Ex: seu-usuario/seu-repo"/>
                        </div>
                        <div>
                            <Label>Token (GITHUB_TOKEN)</Label>
                            <Input value={githubToken} readOnly placeholder="Token não configurado"/>
                        </div>
                         <Alert variant={githubRepo && githubToken ? 'default' : 'destructive'}>
                            <AlertTitle>{githubRepo && githubToken ? 'Configurado' : 'Pendente'}</AlertTitle>
                            <AlertDescription>
                                {githubRepo && githubToken 
                                ? 'As variáveis para o CMS via GitHub parecem estar configuradas.' 
                                : 'Configure GITHUB_REPO e GITHUB_TOKEN nas variáveis de ambiente para usar o salvamento no GitHub.'}
                            </AlertDescription>
                        </Alert>
                        <p className="text-xs text-muted-foreground pt-2">
                           Esta funcionalidade está desativada no modo de protótipo local.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
