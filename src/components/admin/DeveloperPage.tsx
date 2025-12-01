
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, Cpu, Link as LinkIcon, Server, Loader2, Code, MoreHorizontal, EyeOff, GitBranch } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { readFileFromRepo } from "@/lib/github-service";

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

export default function DeveloperPage() {
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [testResult, setTestResult] = useState<string | null>(null);
    const [dbContent, setDbContent] = useState<string>('');

    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestResult(null);
        setDbContent('');
        try {
            const { content } = await readFileFromRepo('db.json');
            if (content) {
                setTestStatus('success');
                setTestResult('Conexão com a API do GitHub e leitura do arquivo db.json bem-sucedida.');
                setDbContent(JSON.stringify(content, null, 2));
            } else {
                throw new Error("O arquivo db.json está vazio ou não foi encontrado.");
            }
        } catch (error: any) {
            setTestStatus('error');
            let errorMessage = `Falha ao conectar ou ler o repositório.`;
            
            if (error.message.includes('401') || error.message.includes('Bad credentials')) {
                errorMessage += " Causa provável: GITHUB_TOKEN inválido ou com permissões insuficientes.";
            } else if (error.message.includes('404')) {
                errorMessage += " Causa provável: GITHUB_REPO_OWNER ou GITHUB_REPO_NAME incorretos, ou o arquivo db.json não existe no repositório.";
            } else {
                errorMessage += ` Detalhe: ${error.message}`;
            }
            
            setTestResult(errorMessage);
        }
    };
    
    const envVars = [
        { name: 'GITHUB_REPO_OWNER', value: process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || '••••••••••••', type: 'system', updated: 'Configurado na Vercel' },
        { name: 'GITHUB_REPO_NAME', value: process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || '••••••••••••', type: 'system', updated: 'Configurado na Vercel' },
        { name: 'GITHUB_TOKEN', value: 'github_pat_...••••••••••', type: 'secret', updated: 'Configurado na Vercel' },
    ]

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto p-4 sm:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold font-headline text-slate-800">Painel do Desenvolvedor</h1>
                    <p className="text-muted-foreground">Ferramentas de diagnóstico para a arquitetura baseada em GitHub.</p>
                </header>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><GitBranch /> Teste de Conexão com Repositório</CardTitle>
                        <CardDescription>
                            Verifica se o aplicativo consegue ler o arquivo `db.json` do seu repositório no GitHub usando o Token de Acesso.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full max-w-md items-center space-x-2">
                            <Button onClick={handleTestConnection} disabled={testStatus === 'loading'}>
                                {testStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Testar Leitura do Repositório
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

                 <Card className="mb-6 bg-black text-gray-300 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Variáveis de Ambiente (Exemplo de Setup)</CardTitle>
                        <CardDescription className="text-gray-400">Estas são as variáveis que você deve configurar na Vercel para o app funcionar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {envVars.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-800 rounded-md bg-gray-900/50">
                            <div className="flex items-center gap-4">
                                <Code className="text-gray-500"/>
                                <div>
                                    <p className="font-mono text-sm text-white">{item.name}</p>
                                    <p className="text-xs text-gray-400">All Environments</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex items-center gap-2 font-mono text-sm px-3 py-1 bg-gray-800 rounded-md">
                                    {item.type === 'secret' ? <EyeOff className="text-gray-500"/> : <LinkIcon className="text-gray-500"/>}
                                    <span className="text-gray-400">{item.value}</span>
                                </div>
                                <p className="hidden lg:block text-sm text-gray-400">{item.updated}</p>
                                <div className="hidden sm:block w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-500"></div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                                    <MoreHorizontal className="h-5 w-5"/>
                                </Button>
                            </div>
                        </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Conteúdo do `db.json`</CardTitle>
                             <CardDescription>
                                 Isto é o que foi lido do seu repositório no último teste.
                             </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto h-96">
                            <pre><code>{dbContent || "Clique em 'Testar Leitura' para carregar os dados."}</code></pre>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
