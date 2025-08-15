
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertTriangle, CheckCircle, Cpu, Link as LinkIcon, Server, Terminal, Loader2 } from "lucide-react"
import { POCKETBASE_URL } from "@/lib/pocketbase"
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import PocketBase from 'pocketbase';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

export default function DeveloperPage() {
    const [apiUrl, setApiUrl] = useState(POCKETBASE_URL);
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [testResult, setTestResult] = useState<string | null>(null);

    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestResult(null);
        try {
            const tempPb = new PocketBase(apiUrl);
            const health = await tempPb.health.check();
            if (health.code === 200) {
                setTestStatus('success');
                setTestResult(`Conexão bem-sucedida! O servidor respondeu com status ${health.code}: ${health.message}.`);
            } else {
                throw new Error(`O servidor respondeu com um status inesperado: ${health.code} ${health.message}`);
            }
        } catch (error: any) {
            setTestStatus('error');
            let errorMessage = "Falha ao conectar na API. Verifique a URL, o status do servidor e as configurações de CORS.";
            if (error.isAbort) {
                errorMessage = "A requisição demorou muito para responder (timeout). Verifique a URL e a rede do servidor.";
            } else if (error.originalError) {
                errorMessage += ` Detalhe: ${error.originalError.message || 'Erro de rede'}`;
            } else if (error.message) {
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
                <p className="text-muted-foreground">Monitoramento da saúde do sistema e ferramentas de depuração.</p>
            </header>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LinkIcon /> Teste de Conexão com API</CardTitle>
                     <CardDescription>Verifique a conexão com o backend do PocketBase. A URL base da API é usada para os testes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full max-w-md items-center space-x-2">
                        <Input
                            type="url"
                            placeholder="URL da API"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            disabled={testStatus === 'loading'}
                        />
                        <Button onClick={handleTestConnection} disabled={testStatus === 'loading'}>
                            {testStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Testar
                        </Button>
                    </div>
                    {testStatus !== 'idle' && (
                        <div className="mt-4">
                            {testStatus === 'loading' && (
                                <p className="text-sm text-muted-foreground flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando conexão...
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
                                    <AlertTitle>Erro na Conexão</AlertTitle>
                                    <AlertDescription>
                                        {testResult}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">120ms</div>
                        <p className="text-xs text-muted-foreground">Média das últimas 24h</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0.15%</div>
                        <p className="text-xs text-muted-foreground">Média das últimas 24h</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uso de CPU</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45%</div>
                        <p className="text-xs text-muted-foreground">Média do cluster</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">60%</div>
                        <p className="text-xs text-muted-foreground">Média do cluster</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Status da API</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Endpoint</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow><TableCell>/auth</TableCell><TableCell><Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Operacional</Badge></TableCell></TableRow>
                                <TableRow><TableCell>/rides</TableCell><TableCell><Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Operacional</Badge></TableCell></TableRow>
                                <TableRow><TableCell>/users</TableCell><TableCell><Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="mr-1 h-3 w-3" /> Degradado</Badge></TableCell></TableRow>
                                <TableRow><TableCell>/payments</TableCell><TableCell><Badge className="bg-red-100 text-red-800"><AlertTriangle className="mr-1 h-3 w-3" /> Interrupção</badge></TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Logs de Erro Recentes</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                        <p><span className="text-red-400">[ERROR]</span> 500: Failed to connect to payment gateway.</p>
                        <p><span className="text-yellow-400">[WARN]</span> 404: User profile picture not found for user_id: 123.</p>
                        <p><span className="text-red-400">[ERROR]</span> Timeout on /users endpoint.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
    );

    