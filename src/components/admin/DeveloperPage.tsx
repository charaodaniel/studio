
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
import PocketBase, { type LogModel } from 'pocketbase';
import Link from "next/link";
import pb from "@/lib/pocketbase";

type TestStatus = 'idle' | 'loading' | 'success' | 'error';
type ApiEndpointStatus = 'loading' | 'success' | 'error';
type EndpointState = {
    name: string;
    status: ApiEndpointStatus;
    error: string | null;
};

const collectionsToTest: string[] = ['users', 'rides', 'messages', 'driver_documents', 'driver_status_logs'];

export default function DeveloperPage() {
    const [apiUrl, setApiUrl] = useState(POCKETBASE_URL);
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [testResult, setTestResult] = useState<string | null>(null);
    const [endpointStates, setEndpointStates] = useState<EndpointState[]>(
        collectionsToTest.map(name => ({ name, status: 'loading', error: null }))
    );
    const [logs, setLogs] = useState<LogModel[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    const checkApiEndpoints = async () => {
        setIsRefreshing(true);
        
        let adminAuthFailed = false;

        // Attempt to authenticate as admin if not already
        if (!pb.authStore.isValid || pb.authStore.model?.role !== 'Admin') {
            try {
                // Using credentials directly for debug purposes
                await pb.collection('users').authWithPassword("admin@teste.com", "12345678");
                if (pb.authStore.model?.role !== 'Admin') {
                    throw new Error("O usuário autenticado não é um administrador.");
                }
                setIsAdminAuthenticated(true);
            } catch (err) {
                console.error("Admin authentication failed for developer page:", err);
                adminAuthFailed = true;
                setIsAdminAuthenticated(false);
            }
        } else {
             setIsAdminAuthenticated(true);
        }

        if (adminAuthFailed) {
            setEndpointStates(collectionsToTest.map(name => ({ name, status: 'error', error: 'Falha na autenticação do admin.' })));
            setLogs([]);
            setIsRefreshing(false);
            return;
        }


        // Test each collection endpoint
        const promises = collectionsToTest.map(async (name): Promise<EndpointState> => {
            try {
                await pb.collections.getOne(name, { requestKey: null }); // requestKey: null to prevent caching
                return { name, status: 'success', error: null };
            } catch (error: any) {
                return { name, status: 'error', error: error.message || 'Falha ao buscar' };
            }
        });

        // Fetch recent logs
        const fetchLogs = async () => {
            try {
                const result = await pb.logs.getList(1, 10, {
                    sort: '-created',
                    filter: 'level >= 4', // 4 for warning, 5 for error
                });
                setLogs(result.items);
            } catch (error) {
                console.error("Failed to fetch logs:", error);
                setLogs([]); // Clear logs on error
            }
        }
        
        const results = await Promise.all(promises);
        await fetchLogs();

        setEndpointStates(results);
        setIsRefreshing(false);
    };
    
    // Initial check on component mount
    useEffect(() => {
        checkApiEndpoints();
    }, []);


    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestResult(null);
        try {
            const tempPb = new PocketBase(apiUrl);
            // The health check is on the `/api/health` endpoint.
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

            if (error.isAbort) {
                errorMessage += " A requisição demorou muito para responder (timeout). Verifique a URL e a rede do servidor.";
            } else if (error.originalError || (error.message && error.message.includes('Failed to fetch'))) {
                 errorMessage += " Verifique se o servidor está no ar e se as configurações de CORS estão corretas para permitir acesso do seu domínio frontend. O navegador pode ter bloqueado a requisição.";
            } else if (error.status === 404) {
                 errorMessage += ` O endpoint /api/health não foi encontrado (404). Verifique se a URL base está correta (sem /_/ ou /api/).`;
            } else if (error.message) {
                 errorMessage += ` Detalhe: ${error.message}`;
            }
            
            setTestResult(errorMessage);
        }
    };
    
    const getLogLevelVariant = (level: number) => {
        if (level >= 5) return 'destructive'; // Error
        if (level === 4) return 'default'; // Warning
        return 'secondary';
    }
    const getLogLevelColor = (level: number) => {
        if (level >= 5) return 'text-red-400'; // Error
        if (level === 4) return 'text-yellow-400'; // Warning
        return 'text-gray-400';
    }
    const getLogLevelName = (level: number) => {
        if (level >= 5) return 'ERROR';
        if (level === 4) return 'WARN';
        if (level === 3) return 'INFO';
        return 'DEBUG';
    }


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
                                            <div className="mt-2 text-xs">
                                                <p>Consulte a documentação de configuração para ajuda com erros de CORS.</p>
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
                            <div className="text-2xl font-bold">{logs.length > 0 ? `${logs.filter(l => l.level >= 5).length}%` : '-'}</div>
                            <p className="text-xs text-muted-foreground">Baseado nos últimos logs de erro.</p>
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
                            {!isAdminAuthenticated && (
                                 <CardDescription className="text-destructive">
                                     Aviso: A autenticação de administrador falhou. Os resultados podem estar incorretos.
                                 </CardDescription>
                            )}
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
                            <CardTitle>Logs de Erro Recentes</CardTitle>
                            {!isAdminAuthenticated && (
                                <CardDescription className="text-destructive">
                                    Aviso: A autenticação de administrador falhou. Não é possível buscar os logs.
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto h-64">
                             {isRefreshing && <p>Carregando logs...</p>}
                             {!isRefreshing && !isAdminAuthenticated && <p className="text-yellow-400">Não foi possível autenticar como admin para ver os logs.</p>}
                             {!isRefreshing && isAdminAuthenticated && logs.length === 0 && <p className="text-slate-400">Nenhum log de aviso ou erro encontrado.</p>}
                             {isAdminAuthenticated && logs.map(log => (
                                <p key={log.id}>
                                    <span className={getLogLevelColor(log.level)}>[{getLogLevelName(log.level)}]</span>
                                    <span className="text-slate-400 mx-2">{new Date(log.created).toLocaleTimeString()}</span>
                                    {log.message}
                                </p>
                             ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
