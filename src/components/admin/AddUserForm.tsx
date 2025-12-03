
'use client';

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
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import pb from "@/lib/pocketbase"

const formSchema = z.object({
  name: z.string().min(2, "O nome precisa ter pelo menos 2 caracteres."),
  email: z.string().email("Por favor, insira um email válido."),
  phone: z.string().optional(),
  role: z.enum(["Passageiro", "Motorista", "Atendente", "Admin"], {
    required_error: "Você precisa selecionar um perfil.",
  }),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  passwordConfirm: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.")
}).refine((data) => data.password === data.passwordConfirm, {
    message: "As senhas não coincidem",
    path: ["passwordConfirm"],
});

interface AddUserFormProps {
    onUserAdded?: () => void;
}

export default function AddUserForm({ onUserAdded }: AddUserFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            passwordConfirm: ""
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        
        try {
            const userData: any = {
                name: values.name,
                email: values.email,
                emailVisibility: true,
                password: values.password,
                passwordConfirm: values.passwordConfirm,
                phone: values.phone || '',
                role: [values.role],
            };

            if (values.role === 'Motorista') {
                userData.driver_status = 'offline';
            }
            
            await pb.collection('users').create(userData);

            toast({
                title: "Usuário Adicionado!",
                description: `O usuário ${values.name} foi criado com sucesso.`,
            });
            form.reset();
            if (onUserAdded) {
                onUserAdded();
            }
             // This is a workaround to close the dialog.
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        } catch (error: any) {
             let description = 'Ocorreu um erro ao criar o usuário.';
            if (error?.data?.data?.email?.message) {
                 description = 'Este e-mail já está em uso por outra conta.';
            }
            toast({
                variant: 'destructive',
                title: 'Falha ao Adicionar Usuário',
                description: description,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                                <Input placeholder="Nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="usuario@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="(00) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Perfil</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um perfil" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Passageiro">Passageiro</SelectItem>
                                    <SelectItem value="Motorista">Motorista</SelectItem>
                                    <SelectItem value="Atendente">Atendente</SelectItem>
                                    <SelectItem value="Admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmar Senha</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Adicionar Usuário
                </Button>
            </form>
        </Form>
    )
}
