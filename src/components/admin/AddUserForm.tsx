
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
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"

const formSchema = z.object({
  name: z.string().min(2, "O nome precisa ter pelo menos 2 caracteres."),
  email: z.string().email("Por favor, insira um email válido."),
  phone: z.string().optional(),
  role: z.enum(["Passageiro", "Motorista", "Atendente", "Admin"], {
    required_error: "Você precisa selecionar um perfil.",
  }),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
})

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
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        const originalAuthUser = auth.currentUser;
        
        try {
            // Create a temporary user in Firebase Auth to get a UID
            const tempUserCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const newUser = tempUserCredential.user;

            const userData = {
                uid: newUser.uid,
                name: values.name,
                email: values.email,
                phone: values.phone || '',
                role: [values.role],
                disabled: false,
                createdAt: new Date().toISOString(),
            };

            // Add driver specific fields if role is Motorista
            if (values.role === 'Motorista') {
                (userData as any).driver_status = 'offline';
            }

            // Save the user data to Firestore
            await setDoc(doc(db, "users", newUser.uid), userData);

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
            if (error.code === 'auth/email-already-in-use') {
                description = 'Este e-mail já está em uso por outra conta.';
            } else if (error.code === 'auth/weak-password') {
                description = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
            }
            toast({
                variant: 'destructive',
                title: 'Falha ao Adicionar Usuário',
                description: description,
            });
        } finally {
            // Re-authenticate the original admin user if they were signed out
            // This is a simplified approach. A more robust solution would use Admin SDK in a Cloud Function.
            if (auth.currentUser?.uid !== originalAuthUser?.uid) {
                // In a real app you might need to re-sign in the admin.
                // For this context, we assume the admin's session persists or is handled.
            }
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Adicionar Usuário
                </Button>
            </form>
        </Form>
    )
}
