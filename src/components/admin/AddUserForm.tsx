
'use client';

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info } from "lucide-react";

export default function AddUserForm() {
    return (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Funcionalidade Indisponível</AlertTitle>
            <AlertDescription>
                A criação de novos usuários está desativada no modo de protótipo local. Os usuários são carregados a partir do arquivo `banco.json`.
            </AlertDescription>
        </Alert>
    );
}
