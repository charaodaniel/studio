

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, Cpu, Link as LinkIcon, Server, Loader2, Info, RefreshCw } from "lucide-react";
import { POCKETBASE_URL } from "@/lib/pocketbase";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import PocketBase, { type RecordModel } from 'pocketbase';
import Link from "next/link";
import pb from "@/lib/pocketbase";

type TestStatus = 'idle' | 'loading' | 'success' | 'error';
type ApiEndpointStatus = 'loading' | 'success' | 'error';
type EndpointState = {
    name: string;
    status: ApiEndpointStatus;
    error: string | null;
};

interface DriverStatusLog extends RecordModel {
    driver: string;
    status: string;
    expand: {
        driver: RecordModel;
    }
}


const collectionsToTest: string[] = ['users', 'rides', 'messages', 'driver_documents', 'driver_status_logs'];

export default function DeveloperPage() {
    const [apiUrl, setApiUrl] = useState(POCKETBASE_URL);
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [testResult, setTestResult] = useState<string | null>(null);
    const [endpointStates, setEndpointStates] = useState<EndpointState[]>(
        collectionsToTest.map(name => ({ name, status: 'loading', error: null }))
    );
    const [logs, setLogs] = useState<DriverStatusLog[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [logErrorMessage, setLogErrorMessage] = useState<string | null>(null);
    
    const checkApiEndpoints = async () => {
        setIsRefreshing(true);
        setLogErrorMessage(null);
        
        // Test each collection endpoint using standard user auth if available
        if (pb.authStore.isValid) {
            const testUserPb = new PocketBase(POCKETBASE_URL);
            // Use current auth token for tests
            testUserPb.authStore.save(pb.authStore.token, pb.authStore.model);

            const promises = collectionsToTest.map(async (name): Promise<EndpointState> => {
                try {
                    // Using `requestKey: null` disables caching for this request
                    await testUserPb.collections.getOne(name, { requestKey: null }); 
                    return { name, status: 'success', error: null };
                } catch (error: any) {
                    let errorMessage = 'Falha ao buscar. ';
                    if (error.status === 403 || error.status === 401) {
                        errorMessage += 'Verifique as "API Rules" da coleção.';
                    } else {
                        errorMessage += error.message || 'Erro desconhecido.';
                    }
                    return { name, status: 'error', error: errorMessage };
                }
            });
             const results = await Promise.all(promises);
            setEndpointStates(results);
        } else {
             const results = collectionsToTest.map(name => ({ name, status: 'error' as 'error', error: "Não autenticado. Faça login como admin." }));
             setEndpointStates(results);
        }


        // Fetch driver status logs
        try {
            if (pb.authStore.model?.role.includes('Admin')) {
                 const logResults = await pb.collection('driver_status_logs').getFullList<DriverStatusLog>({
                    sort: '-created',
                    expand: 'driver',
                });
                setLogs(logResults);
            } else {
                setLogErrorMessage("Apenas administradores podem ver os logs de status.");
                setLogs([]);
            }
        } catch(err: any) {
            console.error("Failed to fetch driver status logs:", err);
            setLogErrorMessage(err.message || "Não foi possível carregar os logs de status.");
            setLogs([]);
        }

        setIsRefreshing(false);
    };
    
    // Initial check on component mount
    useEffect(() => {
        checkApiEndpoints();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestResult(null);
        try {
            const tempPb = new PocketBase(apiUrl);
            const health = await tempPb.health.check();

            if (health && health.code === 200) {
                setTestStatus('success');
                setTestResult(`Conexão bem-sucedida! O servidor em ${apiUrl}/api/health respondeu com status ${health.code}: ${health.message}.`);
            } else {
                throw new Error(`O servidor respondeu com um status inesperado: ${JSON.stringify(health)}`);
            }
        } catch (error: any) {
            setTestStatus('error');
            let errorMessage = `Falha ao conectar na API em ${apiUrl}.`;
            let solution = '';

            if (error.isAbort || (error.message && error.message.includes('Failed to fetch'))) {
                 errorMessage += " Causa provável: O navegador bloqueou a requisição.";
                 solution = "Isso geralmente é um problema de CORS. Verifique se a URL do seu app (ex: https://seu-app.vercel.app) está na lista de 'Allowed Origins' nas configurações do seu PocketBase Admin.";
            } else if (error.status === 404) {
                 errorMessage += ` O endpoint /api/health não foi encontrado (404).`;
                 solution = "Causa provável: O proxy reverso (Nginx, Caddy) não está configurado corretamente. Verifique se ele está encaminhando as requisições de '/api/' para a porta correta do PocketBase (geralmente 8090).";
            } else if (error.message) {
                 errorMessage += ` Detalhe: ${error.message}`;
                 solution = "O servidor está no ar, mas retornou um erro inesperado. Verifique os logs do PocketBase no seu servidor para mais detalhes."
            }
            
            setTestResult(`${errorMessage} ${solution}`);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto p-4 sm:p-8">
                <header className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold font-headline text-slate-800">Painel do Desenvolvedor</h1>
                        <p className="text-muted-foreground">Monitoramento da saúde do sistema e ferramentas de depuração.</p>
                    </div>
                    <Button onClick={checkApiEndpoints} disabled={isRefreshing} variant="outline" size="sm">
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                         <span className="sr-only">Atualizar</span>
                    </Button>
                </header>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LinkIcon /> Teste de Conexão com API</CardTitle>
                        <CardDescription>
                            Verifique a conexão com o backend do PocketBase. A URL configurada no app é usada para os testes.
                             O teste verifica o endpoint <strong>/api/health</strong>.
                        </CardDescription>
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
                                            <div className="mt-2 text-xs font-mono p-2 bg-slate-100 rounded">
                                                <p>Consulte o arquivo <code className="font-bold">POCKETBASE_SETUP.md</code> na raiz do projeto para um guia detalhado de solução de problemas de CORS e Nginx.</p>
                                            </div>
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
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Monitore no painel do seu provedor de VPS.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Monitore no painel do seu provedor de VPS.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Uso de CPU</CardTitle>
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Monitore no painel do seu provedor de VPS.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Monitore no painel do seu provedor de VPS.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status das Coleções da API</CardTitle>
                             <CardDescription>
                                 Testado com as credenciais do usuário logado.
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Coleção</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {endpointStates.map(({ name, status, error }) => (
                                        <TableRow key={name}>
                                            <TableCell className="font-mono text-xs">{`/api/collections/${name}`}</TableCell>
                                            <TableCell>
                                                {status === 'loading' && <Badge variant="secondary"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Verificando...</Badge>}
                                                {status === 'success' && <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Operacional</Badge>}
                                                {status === 'error' && <Badge variant="destructive" title={error || 'Erro desconhecido'}><AlertTriangle className="mr-1 h-3 w-3" /> Erro</Badge>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Logs de Status do Motorista</CardTitle>
                             <CardDescription>
                                 Exibe os últimos logs da coleção `driver_status_logs`.
                             </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto h-64">
                             {isRefreshing && <p className="text-gray-400">Carregando logs...</p>}
                             {!isRefreshing && logErrorMessage && (
                                <p className="text-yellow-400">
                                    <AlertTriangle className="inline-block h-4 w-4 mr-2"/>
                                    {logErrorMessage}
                                </p>

                             )}
                             {!isRefreshing && !logErrorMessage && logs.length > 0 && logs.map(log => (
                                <p key={log.id}>
                                    <span className="text-cyan-400">[{new Date(log.created).toLocaleString('pt-BR')}]</span>
                                    <span className="text-violet-400 mx-2">{log.expand?.driver?.name || 'Motorista desconhecido'}:</span>
                                    <span className="text-slate-300">{log.status}</span>
                                </p>
                             ))}
                             {!isRefreshing && !logErrorMessage && logs.length === 0 && (
                                 <p className="text-gray-400">Nenhum log de status encontrado.</p>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
