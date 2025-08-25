

'use client';
import { Button } from '@/components/ui/button';
import { KeyRound, Car, Settings, UserCircle, ChevronRight, Upload, Camera, Eye, Edit, X, LogOut, FileText as FileTextIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { ImageEditorDialog } from '../shared/ImageEditorDialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Switch } from '../ui/switch';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import pb from '@/lib/pocketbase';
import type { User } from '../admin/UserList';
import type { RecordModel } from 'pocketbase';

interface DocumentRecord extends RecordModel {
    driver: string;
    document_type: 'CNH' | 'CRLV';
    file: string;
    is_verified: boolean;
}

const DocumentUploader = ({ label, docType, driverId, onUpdate }: { label: string, docType: 'CNH' | 'CRLV', driverId: string, onUpdate: () => void }) => {
    const { toast } = useToast();
    const [document, setDocument] = useState<DocumentRecord | null>(null);
    const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const record = await pb.collection('driver_documents').getFirstListItem<DocumentRecord>(`driver="${driverId}" && document_type="${docType}"`);
                setDocument(record);
            } catch (error) {
                // It's ok if not found
                setDocument(null);
            }
        };
        fetchDocument();
    }, [driverId, docType]);

    const handleFileSave = async (newImage: string) => {
        try {
            const formData = new FormData();
            const blob = await(await fetch(newImage)).blob();
            formData.append('file', blob, `${docType}-${driverId}.png`);
            formData.append('driver', driverId);
            formData.append('document_type', docType);

            if (document?.id) {
                await pb.collection('driver_documents').update(document.id, formData);
            } else {
                await pb.collection('driver_documents').create(formData);
            }
            toast({ title: `${label} atualizado com sucesso!`});
            onUpdate(); // Trigger parent re-fetch
        } catch(error) {
            toast({ variant: 'destructive', title: `Erro ao salvar ${label}`, description: "Tente novamente." });
        }
    }
    
    const docUrl = document ? pb.getFileUrl(document, document.file) : null;

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
                {docUrl ? (
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="relative cursor-pointer group">
                                <Image src={docUrl} alt={`Pré-visualização de ${label}`} width={128} height={96} className="rounded-lg object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <Eye className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                             <DialogHeader>
                                <DialogTitle>{label}</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center">
                                <Image src={docUrl} alt={`Visualização de ${label}`} width={800} height={600} className="rounded-lg object-contain max-h-[80vh]" />
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <div className="h-24 w-32 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">Sem imagem</p>
                    </div>
                )}
                 <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                    <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Camera className="mr-2" />
                        Câmera ou Upload
                    </Button>
                    </DialogTrigger>
                    <ImageEditorDialog 
                        isOpen={isCameraDialogOpen}
                        currentImage={docUrl || ''}
                        onImageSave={handleFileSave} 
                        onDialogClose={() => setIsCameraDialogOpen(false)}
                    />
                </Dialog>
            </div>
        </div>
    );
};


export function ProfileForm({ user, onUpdate }: { user: User, onUpdate: (user: User) => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingVehicleInfo, setIsEditingVehicleInfo] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  
  // States for Personal Info
  const [formData, setFormData] = useState<Partial<User>>(user);
  const [newPassword, setNewPassword] = useState({ password: '', confirmPassword: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({...prev, [id]: value }));
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({...prev, driver_accepts_rural: checked }))
  }

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({...prev, driver_fare_type: value as 'fixed' | 'km' }))
  }

  const handleSave = async (section: string) => {
    try {
        const updatedRecord = await pb.collection('users').update<User>(user.id, formData);
        onUpdate(updatedRecord); // Update parent state
        toast({
          title: 'Sucesso!',
          description: `Suas alterações na seção de ${section} foram salvas.`,
        });
        setIsEditingPersonalInfo(false);
        setIsEditingVehicleInfo(false);
        setIsEditingSettings(false);
    } catch (error) {
        console.error("Failed to save:", error);
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: "Não foi possível salvar suas alterações."});
    }
  };
  
  const handleLogout = () => {
    pb.authStore.clear();
    toast({
      title: 'Logout Realizado',
      description: 'Você foi desconectado com sucesso.',
    });
    router.push('/');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.password || !newPassword.confirmPassword) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Preencha ambos os campos de senha.' });
        return;
    }
    if (newPassword.password !== newPassword.confirmPassword) {
        toast({ variant: 'destructive', title: 'Erro', description: 'As senhas não coincidem.' });
        return;
    }
    try {
        await pb.collection('users').update(user.id, {
            password: newPassword.password,
            passwordConfirm: newPassword.confirmPassword,
        });
        toast({ title: 'Senha Alterada!', description: 'Sua senha foi alterada com sucesso.' });
        setNewPassword({ password: '', confirmPassword: '' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao alterar senha', description: 'Tente novamente.' });
    }
  };
  
  const handleCancelEdit = (section: string) => {
      setFormData(user); // Reset form data to original user data
      if (section === 'personal') setIsEditingPersonalInfo(false);
      if (section === 'vehicle') setIsEditingVehicleInfo(false);
      if (section === 'settings') setIsEditingSettings(false);
  }

  return (
    <div className="bg-card rounded-lg">
      <ul>
        {/* Personal Info */}
        <Dialog open={isPersonalInfoOpen} onOpenChange={(open) => { setIsPersonalInfoOpen(open); if(!open) setIsEditingPersonalInfo(false); }}>
            <DialogTrigger asChild>
                 <li className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                        <UserCircle className="h-6 w-6 text-primary" />
                        <span className="font-medium">Informações Pessoais</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </li>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Informações Pessoais</DialogTitle>
                    <DialogDescription>
                        {isEditingPersonalInfo ? 'Edite seus dados pessoais e de pagamento.' : 'Gerencie seus dados pessoais e de pagamento.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Nome Completo</Label>
                        {isEditingPersonalInfo ? (
                            <Input id="name" value={formData.name} onChange={handleInputChange} />
                        ) : (
                            <p className="text-sm font-medium p-2">{formData.name}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="driver_cnpj">CNPJ</Label>
                        {isEditingPersonalInfo ? (
                            <Input id="driver_cnpj" value={formData.driver_cnpj} onChange={handleInputChange} placeholder="00.000.000/0000-00"/>
                        ) : (
                            <p className="text-sm font-medium p-2">{formData.driver_cnpj || 'Não informado'}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <p className="text-sm text-muted-foreground p-2">{formData.email}</p>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="driver_pix_key">Chave PIX</Label>
                        {isEditingPersonalInfo ? (
                            <Input id="driver_pix_key" value={formData.driver_pix_key} onChange={handleInputChange} placeholder="Insira sua chave PIX" />
                        ) : (
                            <p className="text-sm font-medium p-2">{formData.driver_pix_key || 'Não informada'}</p>
                        )}
                    </div>

                    {isEditingPersonalInfo && (
                        <>
                            <Separator />
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <h3 className="font-medium">Alterar Senha</h3>
                                <div className="space-y-1">
                                    <Label htmlFor="new-password">Nova Senha</Label>
                                    <Input id="new-password" type="password" value={newPassword.password} onChange={(e) => setNewPassword(prev => ({...prev, password: e.target.value}))} required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
                                    <Input id="confirm-new-password" type="password" value={newPassword.confirmPassword} onChange={(e) => setNewPassword(prev => ({...prev, confirmPassword: e.target.value}))} required />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full">Confirmar Nova Senha</Button>
                            </form>
                        </>
                    )}
                </div>
                <DialogFooter>
                    {isEditingPersonalInfo ? (
                        <>
                           <Button variant="outline" onClick={() => handleCancelEdit('personal')}>
                                <X className="mr-2" />
                                Cancelar
                            </Button>
                           <Button onClick={() => handleSave('Informações Pessoais')}>Salvar Alterações</Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditingPersonalInfo(true)}>
                            <Edit className="mr-2" />
                            Editar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Separator />
        
        {/* Vehicle and Documents */}
        <Dialog open={isVehicleOpen} onOpenChange={(open) => { setIsVehicleOpen(open); if(!open) setIsEditingVehicleInfo(false); }}>
            <DialogTrigger asChild>
                 <li className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                        <Car className="h-6 w-6 text-primary" />
                        <span className="font-medium">Veículo e Documentos</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </li>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                 <DialogHeader>
                    <DialogTitle>Veículo e Documentos</DialogTitle>
                    <DialogDescription>
                        {isEditingVehicleInfo ? 'Edite as informações do seu veículo e atualize os documentos.' : 'Mantenha as informações e fotos do seu veículo e documentos atualizadas.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-1">
                        <Label htmlFor="driver_vehicle_model">Modelo do Veículo</Label>
                        {isEditingVehicleInfo ? (
                           <Input id="driver_vehicle_model" value={formData.driver_vehicle_model} onChange={handleInputChange} />
                        ) : (
                           <p className="text-sm font-medium p-2">{formData.driver_vehicle_model}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="driver_vehicle_plate">Placa</Label>
                        {isEditingVehicleInfo ? (
                           <Input id="driver_vehicle_plate" value={formData.driver_vehicle_plate} onChange={handleInputChange} />
                        ) : (
                           <p className="text-sm font-medium p-2">{formData.driver_vehicle_plate}</p>
                        )}
                    </div>
                     <DocumentUploader
                        label="Foto do Veículo"
                        docType="CRLV" // Placeholder, maybe create a dedicated type for vehicle photo
                        driverId={user.id}
                        onUpdate={() => onUpdate({...user})} // A bit of a hack to trigger re-render
                    />
                    <Separator />
                    <DocumentUploader
                        label="Carteira de Habilitação (CNH)"
                        docType="CNH"
                        driverId={user.id}
                        onUpdate={() => onUpdate({...user})}
                    />
                    <DocumentUploader
                        label="Documento do Veículo (CRLV)"
                        docType="CRLV"
                        driverId={user.id}
                        onUpdate={() => onUpdate({...user})}
                    />
                </div>
                <DialogFooter>
                    {isEditingVehicleInfo ? (
                        <>
                           <Button variant="outline" onClick={() => handleCancelEdit('vehicle')}>
                               <X className="mr-2" />
                               Cancelar
                           </Button>
                           <Button onClick={() => handleSave('Veículo e Documentos')}>Salvar Alterações</Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditingVehicleInfo(true)}>
                            <Edit className="mr-2" />
                            Editar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Separator />

        {/* Ride Settings */}
        <Dialog open={isSettingsOpen} onOpenChange={(open) => { setIsSettingsOpen(open); if(!open) setIsEditingSettings(false); }}>
            <DialogTrigger asChild>
                <li className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                        <Settings className="h-6 w-6 text-primary" />
                        <span className="font-medium">Configurações de Corrida</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </li>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Configurações de Corrida</DialogTitle>
                    <DialogDescription>
                         {isEditingSettings ? 'Defina suas preferências de tarifa para corridas urbanas.' : 'Gerencie suas preferências de tarifa para corridas.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo de Tarifa (Urbano)</Label>
                        <RadioGroup value={formData.driver_fare_type} onValueChange={handleRadioChange} className="flex items-center gap-4 pt-2" disabled={!isEditingSettings}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fixed" id="r-fixed" />
                                <Label htmlFor="r-fixed">Valor Fixo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="km" id="r-km" />
                                <Label htmlFor="r-km">Tarifa por KM</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {formData.driver_fare_type === 'fixed' ? (
                        <div className="space-y-1">
                            <Label htmlFor="driver_fixed_rate">Tarifa Fixa (R$)</Label>
                            {isEditingSettings ? (
                               <Input id="driver_fixed_rate" type="number" value={formData.driver_fixed_rate} onChange={handleInputChange} placeholder="25.50" />
                            ) : (
                                <p className="text-sm font-medium p-2">R$ {formData.driver_fixed_rate}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <Label htmlFor="driver_km_rate">Tarifa por KM (R$)</Label>
                            {isEditingSettings ? (
                                <Input id="driver_km_rate" type="number" value={formData.driver_km_rate} onChange={handleInputChange} placeholder="3.50" />
                            ) : (
                                <p className="text-sm font-medium p-2">R$ {formData.driver_km_rate} / km</p>
                            )}
                        </div>
                    )}
                    <Separator />
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="negotiate-rural">Aceitar negociação para interior</Label>
                            <p className="text-xs text-muted-foreground">
                                Permite que passageiros negociem valores para fora da cidade.
                            </p>
                        </div>
                        <Switch id="negotiate-rural" checked={formData.driver_accepts_rural} onCheckedChange={handleSwitchChange} disabled={!isEditingSettings} />
                    </div>
                </div>
                 <DialogFooter>
                    {isEditingSettings ? (
                        <>
                           <Button variant="outline" onClick={() => handleCancelEdit('settings')}>
                                <X className="mr-2" />
                               Cancelar
                           </Button>
                           <Button onClick={() => handleSave('Configurações')}>Salvar Alterações</Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditingSettings(true)}>
                            <Edit className="mr-2" />
                            Editar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Separator />
        {/* Logout Button */}
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <li className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 text-destructive">
                    <div className="flex items-center gap-4">
                        <LogOut className="h-6 w-6" />
                        <span className="font-medium">Sair</span>
                    </div>
                </li>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza que quer sair?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você será redirecionado para a tela inicial e precisará fazer login novamente para acessar seu painel.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">Sair</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </ul>
    </div>
  );
}

