import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AddUserForm() {
    return (
        <form className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">
                    Nome
                </Label>
                <Input id="name" />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">
                    Email
                </Label>
                <Input id="email" type="email" />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="role">
                    Perfil
                </Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="passageiro">Passageiro</SelectItem>
                        <SelectItem value="motorista">Motorista</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="atendente">Atendente</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="password">
                    Senha
                </Label>
                <Input id="password" type="password" />
            </div>
            <Button type="submit" className="w-full">Adicionar Usuário</Button>
        </form>
    )
}
