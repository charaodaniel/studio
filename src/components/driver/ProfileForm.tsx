
'use client';
import { Button } from '@/components/ui/button';
import { KeyRound, Car, Settings, UserCircle, ChevronRight, Upload, Camera, Eye, Edit, X, LogOut, FileText as FileTextIcon, EyeOff, Loader2 } from 'lucide-react';
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
import type { User } from '../admin/UserList';
import { useAuth } from '@/hooks/useAuth';
import { useDatabaseManager } from '@/hooks/use-database-manager';

const getFileUrl = (filePath: string) => {
    if (!filePath) return '';
    return filePath;
}

interface DocumentRecord {
    id: string;
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string; 
    is_verified: boolean;
}

interface DatabaseContent {
  users: User[];
  documents: DocumentRecord[];
  rides: any[];
  chats: any[];
  messages: any[];
  institutional_info: any;
}

const DocumentUploader = ({ label, docType, driverId, onUpdate }: { label: string, docType: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO', driverId: string, onUpdate: () => void }) => {
    const { toast } = useToast();
    const { data: db, saveData } = useDatabaseManager<DatabaseContent>();
    const [document, setDocument] = useState<DocumentRecord | null>(null);
    const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (db?.documents) {
            const userDoc = db.documents.find(
                d => d.driver === driverId && d.document_type === docType
            );
            setDocument(userDoc || null);
        }
    }, [driverId, docType, db, onUpdate]);

    const handleFileSave = async (newImageAsDataUrl: string) => {
        if (!db) return;
        setIsSaving(true);
        try {
            await saveData(currentDb => {
                const existingDocIndex = currentDb.documents.findIndex(d => d.driver === driverId && d.document_type === docType);
                const newDoc: DocumentRecord = {
                    id: document?.id || `doc_${Date.now()}`,
                    driver: driverId,
                    document_type: docType,
                    file: newImageAsDataUrl,
                    is_verified: false,
                };
                
                if (existingDocIndex > -1) {
                    currentDb.documents[existingDocIndex] = newDoc;
                } else {
                    currentDb.documents.push(newDoc);
                }
                return currentDb;
            });
            toast({ title: "Documento Salvo!", description: "Seu documento foi enviado para verificação." });
            onUpdate();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o documento.' });
        } finally {
            setIsSaving(false);
            setIsCameraDialogOpen(false);
        }
    }
    
    const docUrl = document ? getFileUrl(document.file) : null;

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
                        {docUrl ? 'Alterar Foto' : 'Câmera ou Upload'}
                    </Button>
                    </DialogTrigger>
                    <ImageEditorDialog 
                        isOpen={isCameraDialogOpen}
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
  const { logout } = useAuth();
  const { saveData } = useDatabaseManager<DatabaseContent>();
  const [isSaving, setIsSaving] = useState(false);

  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingVehicleInfo, setIsEditingVehicleInfo] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  
  const [formData, setFormData] = useState<Partial<User>>(user);
  
  useEffect(() => {
    setFormData(user);
  }, [user]);

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
    setIsSaving(true);
    try {
        const updatedUser = { ...user, ...formData };

        await saveData((currentData) => {
            const db = currentData || { users: [], rides: [], documents: [], chats: [], messages: [], institutional_info: {} };
            const userIndex = db.users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                db.users[userIndex] = updatedUser as User;
            }
            return db;
        });

        onUpdate(updatedUser as User);

        toast({
            title: 'Salvo com Sucesso!',
            description: `Suas alterações na seção de ${section} foram salvas.`,
        });

        setIsEditingPersonalInfo(false);
        setIsEditingVehicleInfo(false);
        setIsEditingSettings(false);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erro ao Salvar',
            description: 'Não foi possível salvar suas alterações. Tente novamente.',
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: 'Logout Realizado',
      description: 'Você foi desconectado com sucesso.',
    });
    router.push('/');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Simulação', description: 'Em um app real, sua senha seria alterada agora.' });
  };
  
  const handleCancelEdit = (section: string) => {
      setFormData(user); 
      if (section === 'personal') setIsEditingPersonalInfo(false);
      if (section === 'vehicle') setIsEditingVehicleInfo(false);
      if (section === 'settings') setIsEditingSettings(false);
  }

  return (
    <div className="bg-card rounded-lg">
      <ul>
        {/* Personal Info */}
        <Dialog open={isPersonalInfoOpen} onOpenChange={(open) => { setIsPersonalInfoOpen(open); if(!open) handleCancelEdit('personal'); }}>
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
                            <Input id="name" value={formData.name} onChange={handleInputChange} disabled={isSaving} />
                        ) : (
                            <p className="text-sm font-medium p-2">{formData.name}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="driver_cnpj">CNPJ</Label>
                        {isEditingPersonalInfo ? (
                            <Input id="driver_cnpj" value={formData.driver_cnpj || ''} onChange={handleInputChange} placeholder="00.000.000/0000-00" disabled={isSaving}/>
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
                            <Input id="driver_pix_key" value={formData.driver_pix_key || ''} onChange={handleInputChange} placeholder="Insira sua chave PIX" disabled={isSaving} />
                        ) : (
                            <p className="text-sm font-medium p-2">{formData.driver_pix_key || 'Não informada'}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    {isEditingPersonalInfo ? (
                        <>
                           <Button variant="outline" onClick={() => handleCancelEdit('personal')} disabled={isSaving}>
                                <X className="mr-2" />
                                Cancelar
                            </Button>
                           <Button onClick={() => handleSave('Informações Pessoais')} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Salvar Alterações
                           </Button>
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
        <Dialog open={isVehicleOpen} onOpenChange={(open) => { setIsVehicleOpen(open); if(!open) handleCancelEdit('vehicle'); }}>
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
                           <Input id="driver_vehicle_model" value={formData.driver_vehicle_model || ''} onChange={handleInputChange} disabled={isSaving} />
                        ) : (
                           <p className="text-sm font-medium p-2">{formData.driver_vehicle_model}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="driver_vehicle_plate">Placa</Label>
                        {isEditingVehicleInfo ? (
                           <Input id="driver_vehicle_plate" value={formData.driver_vehicle_plate || ''} onChange={handleInputChange} disabled={isSaving} />
                        ) : (
                           <p className="text-sm font-medium p-2">{formData.driver_vehicle_plate}</p>
                        )}
                    </div>
                     <DocumentUploader
                        label="Foto do Veículo"
                        docType="VEHICLE_PHOTO"
                        driverId={user.id}
                        onUpdate={() => onUpdate({...user})} 
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
                           <Button variant="outline" onClick={() => handleCancelEdit('vehicle')} disabled={isSaving}>
                               <X className="mr-2" />
                               Cancelar
                           </Button>
                           <Button onClick={() => handleSave('Veículo e Documentos')} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Salvar Alterações
                           </Button>
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
        <Dialog open={isSettingsOpen} onOpenChange={(open) => { setIsSettingsOpen(open); if(!open) handleCancelEdit('settings'); }}>
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
                        <RadioGroup onValueChange={handleRadioChange} value={formData.driver_fare_type} className="flex items-center gap-4 pt-2" disabled={!isEditingSettings || isSaving}>
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
                               <Input id="driver_fixed_rate" type="number" value={formData.driver_fixed_rate || ''} onChange={handleInputChange} placeholder="25.50" disabled={isSaving} />
                            ) : (
                                <p className="text-sm font-medium p-2">R$ {formData.driver_fixed_rate}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <Label htmlFor="driver_km_rate">Tarifa por KM (R$)</Label>
                            {isEditingSettings ? (
                                <Input id="driver_km_rate" type="number" value={formData.driver_km_rate || ''} onChange={handleInputChange} placeholder="3.50" disabled={isSaving} />
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
                        <Switch id="negotiate-rural" checked={formData.driver_accepts_rural} onCheckedChange={handleSwitchChange} disabled={!isEditingSettings || isSaving} />
                    </div>
                </div>
                 <DialogFooter>
                    {isEditingSettings ? (
                        <>
                           <Button variant="outline" onClick={() => handleCancelEdit('settings')} disabled={isSaving}>
                                <X className="mr-2" />
                               Cancelar
                           </Button>
                           <Button onClick={() => handleSave('Configurações')} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Salvar Alterações
                           </Button>
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
