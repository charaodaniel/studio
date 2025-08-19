'use client';
import { Button } from '@/components/ui/button';
import { KeyRound, Car, Settings, UserCircle, ChevronRight, Upload, Camera, Eye, Edit, X, LogOut, FileText as FileTextIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { ImageEditorDialog } from '../shared/ImageEditorDialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Switch } from '../ui/switch';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


const DocumentUploader = ({ label, docId, value, onFileChange, isEditing }: { label: string, docId: string, value: string | null, onFileChange: (file: string | null) => void, isEditing: boolean }) => {
    const { toast } = useToast();
    const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);

    return (
        <div className="space-y-2">
            <Label htmlFor={docId}>{label}</Label>
            <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
                {value ? (
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="relative cursor-pointer group">
                                <Image src={value} alt={`Pré-visualização de ${label}`} width={128} height={96} className="rounded-lg object-cover" />
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
                                <Image src={value} alt={`Visualização de ${label}`} width={800} height={600} className="rounded-lg object-contain max-h-[80vh]" />
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <div className="h-24 w-32 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">Sem imagem</p>
                    </div>
                )}
                {isEditing && (
                    <div className="flex flex-col sm:flex-row w-full gap-2">
                        <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <Camera className="mr-2" />
                              Câmera ou Upload
                            </Button>
                          </DialogTrigger>
                          <ImageEditorDialog 
                            isOpen={isCameraDialogOpen}
                            currentImage={value || ''}
                            onImageSave={(image) => onFileChange(image)}
                            onDialogClose={() => setIsCameraDialogOpen(false)}
                          />
                        </Dialog>
                    </div>
                )}
            </div>
        </div>
    );
};


export function ProfileForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingVehicleInfo, setIsEditingVehicleInfo] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  
  // States for Personal Info
  const [name, setName] = useState('Carlos Motorista');
  const [pixKey, setPixKey] = useState('carlos.motorista@email.com');
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [newPassword, setNewPassword] = useState({ password: '', confirmPassword: '' });

  // States for Vehicle & Docs
  const [vehicleModel, setVehicleModel] = useState('Toyota Corolla');
  const [licensePlate, setLicensePlate] = useState('BRA2E19');
  const [cnhDocument, setCnhDocument] = useState<string | null>(null);
  const [crlvDocument, setCrlvDocument] = useState<string | null>(null);
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);
  
  // States for Settings
  const [fareType, setFareType] = useState('fixed');
  const [fixedRate, setFixedRate] = useState('25.50');
  const [kmRate, setKmRate] = useState('3.50');
  const [acceptsRural, setAcceptsRural] = useState(true);

  const handleSave = (section: string) => {
    toast({
      title: 'Sucesso!',
      description: `Suas alterações na seção de ${section} foram salvas.`,
    });
    setIsEditingPersonalInfo(false);
    setIsEditingVehicleInfo(false);
    setIsEditingSettings(false);
  };
  
  const handleLogout = () => {
    toast({
      title: 'Logout Realizado',
      description: 'Você foi desconectado com sucesso.',
    });
    router.push('/');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.password || !newPassword.confirmPassword) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Preencha ambos os campos de senha.' });
        return;
    }
    if (newPassword.password !== newPassword.confirmPassword) {
        toast({ variant: 'destructive', title: 'Erro', description: 'As senhas não coincidem.' });
        return;
    }
    toast({ title: 'Senha Alterada!', description: 'Sua senha foi alterada com sucesso.' });
    setNewPassword({ password: '', confirmPassword: '' });
  };
  
  const handleCancelEdit = (section: string) => {
      // Here you would typically reset the state to its original values
      // For this prototype, we just switch back to view mode
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
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                        ) : (
                            <p className="text-sm font-medium p-2">{name}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        {isEditingPersonalInfo ? (
                            <Input id="cnpj" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0000-00"/>
                        ) : (
                            <p className="text-sm font-medium p-2">{cnpj || 'Não informado'}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <p className="text-sm text-muted-foreground p-2">carlos@email.com</p>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="pix-key">Chave PIX</Label>
                        {isEditingPersonalInfo ? (
                            <Input id="pix-key" value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="Insira sua chave PIX" />
                        ) : (
                            <p className="text-sm font-medium p-2">{pixKey || 'Não informada'}</p>
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
                        <Label htmlFor="vehicle-model">Modelo do Veículo</Label>
                        {isEditingVehicleInfo ? (
                           <Input id="vehicle-model" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} />
                        ) : (
                           <p className="text-sm font-medium p-2">{vehicleModel}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="license-plate">Placa</Label>
                        {isEditingVehicleInfo ? (
                           <Input id="license-plate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} />
                        ) : (
                           <p className="text-sm font-medium p-2">{licensePlate}</p>
                        )}
                    </div>
                    <DocumentUploader
                        label="Foto do Veículo"
                        docId="vehicle-photo"
                        value={vehiclePhoto}
                        onFileChange={setVehiclePhoto}
                        isEditing={isEditingVehicleInfo}
                    />
                    <Separator />
                    <DocumentUploader
                        label="Carteira de Habilitação (CNH)"
                        docId="cnh-doc"
                        value={cnhDocument}
                        onFileChange={setCnhDocument}
                        isEditing={isEditingVehicleInfo}
                    />
                    <DocumentUploader
                        label="Documento do Veículo (CRLV)"
                        docId="crlv-doc"
                        value={crlvDocument}
                        onFileChange={setCrlvDocument}
                        isEditing={isEditingVehicleInfo}
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
                        <RadioGroup value={fareType} onValueChange={setFareType} className="flex items-center gap-4 pt-2" disabled={!isEditingSettings}>
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
                    {fareType === 'fixed' ? (
                        <div className="space-y-1">
                            <Label htmlFor="fixed-rate">Tarifa Fixa (R$)</Label>
                            {isEditingSettings ? (
                               <Input id="fixed-rate" type="number" value={fixedRate} onChange={e => setFixedRate(e.target.value)} placeholder="25,50" />
                            ) : (
                                <p className="text-sm font-medium p-2">R$ {fixedRate}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <Label htmlFor="km-rate">Tarifa por KM (R$)</Label>
                            {isEditingSettings ? (
                                <Input id="km-rate" type="number" value={kmRate} onChange={e => setKmRate(e.target.value)} placeholder="3,50" />
                            ) : (
                                <p className="text-sm font-medium p-2">R$ {kmRate} / km</p>
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
                        <Switch id="negotiate-rural" checked={acceptsRural} onCheckedChange={setAcceptsRural} disabled={!isEditingSettings} />
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
