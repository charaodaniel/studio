
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitBranch, Loader2, Server, Terminal, WifiOff } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useDatabaseManager } from "@/hooks/use-database-manager";

const GITHUB_REPO_OWNER = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME;

export default function DeveloperPage() {
    const { database, isLoading, error, refreshDatabase } = useDatabaseManager();

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto p-4 sm:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold font-headline text-slate-800">Painel do Desenvolvedor</h1>
                    <p className="text-muted-foreground">Ferramentas de diagnóstico e configuração do backend (GitHub as CMS).</p>
                </header>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Server /> Conexão com a API</CardTitle>
                        <CardDescription>
                            Verifica o status da conexão com a API interna que se comunica com o GitHub.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex w-full max-w-md items-center space-x-2">
                            <Button onClick={refreshDatabase} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Testar Conexão
                            </Button>
                        </div>

                        <div className="mt-4">
                            {isLoading && (
                                <p className="text-sm text-muted-foreground flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando dados do repositório...
                                </p>
                            )}
                            {!isLoading && database && (
                                <Alert variant="default" className="border-green-500 bg-green-50">
                                    <Terminal className="h-4 w-4 !text-green-600" />
                                    <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
                                    <AlertDescription className="text-green-700">
                                        Conexão bem-sucedida! O arquivo `banco.json` foi carregado.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {!isLoading && error && (
                                <Alert variant="destructive">
                                    <WifiOff className="h-4 w-4" />
                                    <AlertTitle>Erro de Conexão</AlertTitle>
                                    <AlertDescription>
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><GitBranch /> Configuração do Ambiente</CardTitle>
                        <CardDescription>
                            As variáveis abaixo precisam estar configuradas no arquivo `.env.local` (para desenvolvimento)
                             e nas "Environment Variables" da sua plataforma de hospedagem (Vercel, Netlify, etc.).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="font-mono text-sm p-3 border rounded-md bg-slate-100">
                           NEXT_PUBLIC_GITHUB_REPO_OWNER="{GITHUB_REPO_OWNER || 'Não configurado'}"
                        </p>
                        <p className="font-mono text-sm p-3 border rounded-md bg-slate-100">
                           NEXT_PUBLIC_GITHUB_REPO_NAME="{GITHUB_REPO_NAME || 'Não configurado'}"
                        </p>
                         <p className="font-mono text-sm p-3 border rounded-md bg-slate-100">
                           GITHUB_TOKEN="********" (Esta variável é secreta e não deve ser exposta)
                        </p>
                         <p className="text-xs text-muted-foreground pt-2">
                            Consulte a <Link href="/docs/painel-edicao-sem-banco.md" className="underline hover:text-primary">documentação do CMS via GitHub</Link> para mais detalhes.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
