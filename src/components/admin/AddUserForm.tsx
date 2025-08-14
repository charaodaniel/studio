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
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                    Nome
                </Label>
                <Input id="name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                    Email
                </Label>
                <Input id="email" type="email" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                    Perfil
                </Label>
                <Select>
                    <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                    Senha
                </Label>
                <Input id="password" type="password" className="col-span-3" />
            </div>
            <div className="col-start-2 col-span-3">
                 <Button type="submit" className="w-full">Adicionar Usuário</Button>
            </div>
        </form>
    )
}