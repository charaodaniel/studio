
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Logo from '../shared/Logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useAuth } from '@/hooks/useAuth';
import { useDatabaseManager } from '@/hooks/use-database-manager';
import { type User } from '../admin/UserList';

interface DatabaseContent {
  users: User[];
  rides: any[];
  documents: any[];
  chats: any[];
  messages: any[];
  institutional_info: any;
}


export default function DriverAuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const { data: db, saveData, fetchData } = useDatabaseManager<DatabaseContent>();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // States for login form
  const [loginIdentity, setLoginIdentity] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // States for registration form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(loginIdentity, loginPassword);
      if (!user.role.includes('Motorista')) {
        throw new Error('Este login é exclusivo para motoristas.');
      }
      
      toast({ title: 'Login bem-sucedido!', description: `Bem-vindo de volta, ${user.name}!` });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      router.push('/driver');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: error.message || 'Email/Telefone ou senha inválidos. Por favor, tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
     e.preventDefault();
    if (!regName || !regPhone || !regPassword) {
      toast({ variant: 'destructive', title: 'Campos Obrigatórios', description: 'Nome, Telefone e Senha são obrigatórios.' });
      return;
    }
    if (!db) {
        toast({ variant: 'destructive', title: 'Erro de Banco de Dados', description: 'Não foi possível carregar os dados para o registro.' });
        return;
    }

    setIsLoading(true);

    const newUser: Omit<User, 'collectionId' | 'collectionName' | 'created' | 'updated'> & { password_placeholder: string } = {
        id: `usr_local_${Date.now()}`,
        name: regName,
        email: regEmail,
        phone: regPhone,
        role: ['Motorista'],
        avatar: '',
        password_placeholder: regPassword,
        driver_status: 'offline',
        driver_vehicle_model: "",
        driver_vehicle_plate: "",
        driver_cnpj: "",
        driver_pix_key: "",
        driver_fare_type: "km",
        driver_km_rate: 2.5, // Default km rate
        driver_accepts_rural: false,
        disabled: false,
    };

    try {
        const updatedDb = { ...db, users: [...db.users, newUser as User] };
        await saveData(updatedDb);
        await fetchData();
        toast({
            title: "Registro bem-sucedido!",
            description: `Bem-vindo, ${regName}! Você já pode fazer login.`,
        });
        // Clear form and switch to login tab
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setActiveTab('login');
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erro no Registro',
            description: 'Não foi possível completar seu registro. Tente novamente.',
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <>
       <DialogHeader className="p-6">
        <div className="flex justify-center mb-4 w-32 mx-auto">
            <Logo />
        </div>
        <DialogTitle className="font-headline text-2xl text-center">Acesso do Motorista</DialogTitle>
        <DialogDescription className="text-center">Faça login ou crie uma conta para começar a dirigir.</DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[80vh]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-6 pb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="identity-login-driver">Email ou Telefone</Label>
                  <Input id="identity-login-driver" type="text" placeholder="seu@email.com ou (00) 99999-9999" required disabled={isLoading} value={loginIdentity} onChange={(e) => setLoginIdentity(e.target.value)} />
                </div>
                <div className="space-y-2">
                   <div className="flex items-center">
                     <Label htmlFor="password-login-driver">Senha</Label>
                     <Dialog>
                        <DialogTrigger asChild>
                            <button type="button" className="ml-auto inline-block text-sm underline">Esqueceu sua senha?</button>
                        </DialogTrigger>
                        <DialogContent>
                            <ForgotPasswordForm />
                        </DialogContent>
                     </Dialog>
                   </div>
                   <div className="relative">
                        <Input 
                            id="password-login-driver" 
                            type={showLoginPassword ? 'text' : 'password'} 
                            required 
                            disabled={isLoading} 
                            value={loginPassword} 
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pr-10"
                        />
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-1/2 -translate-y-1/2 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            tabIndex={-1}
                        >
                            {showLoginPassword ? <EyeOff /> : <Eye />}
                        </Button>
                   </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name-register-driver">Nome</Label>
                  <Input id="name-register-driver" placeholder="Seu nome completo" required value={regName} onChange={(e) => setRegName(e.target.value)} disabled={isLoading}/>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="phone-register-driver">Telefone (será seu usuário)</Label>
                  <Input id="phone-register-driver" type="tel" placeholder="(00) 99999-9999" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} disabled={isLoading}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register-driver">Email (Opcional)</Label>
                  <Input id="email-register-driver" type="email" placeholder="seu@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} disabled={isLoading}/>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="password-register-driver">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="password-register-driver" 
                      type={showRegPassword ? 'text' : 'password'} 
                      required 
                      disabled={isLoading} 
                      value={regPassword} 
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1/2 -translate-y-1/2 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        tabIndex={-1}
                    >
                        {showRegPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                   {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Conta
                </Button>
            </form>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </>
  );
}
