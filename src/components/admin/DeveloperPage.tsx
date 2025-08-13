import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertTriangle, CheckCircle, Cpu, Link as LinkIcon, Server, Terminal } from "lucide-react"

export default function DeveloperPage() {
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
            </CardHeader>
            <CardContent>
                <div className="flex w-full max-w-md items-center space-x-2">
                    <Input type="url" placeholder="URL da API" defaultValue="https://api.ceolin-mobilidade.com/v1/health" />
                    <Button>Testar</Button>
                </div>
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
                            <TableRow><TableCell>/payments</TableCell><TableCell><Badge className="bg-red-100 text-red-800"><AlertTriangle className="mr-1 h-3 w-3" /> Interrupção</Badge></TableCell></TableRow>
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
  )
}
