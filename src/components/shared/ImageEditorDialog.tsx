'use client';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Camera as CameraIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ImageEditorDialogProps {
    isOpen: boolean;
    onImageSave: (newImageAsDataUrl: string) => void;
    onDialogClose: () => void;
}

export function ImageEditorDialog({ isOpen, onImageSave, onDialogClose }: ImageEditorDialogProps) {
    const { toast } = useToast();
    const [image, setImage] = useState<string | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isOpen) {
          // Stop video stream when dialog closes
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
          }
          return;
        }

        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
          }
        };

        getCameraPermission();
        
        return () => {
             // Cleanup on unmount
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };

    }, [isOpen]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleTakePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/png');
            setImage(dataUrl);
            toast({ title: "Foto Capturada!", description: "A imagem da câmera foi capturada." });
        }
    };
    
    const handleSave = () => {
        if (image) {
            onImageSave(image);
            onDialogClose();
        } else {
            toast({ variant: 'destructive', title: 'Nenhuma Imagem', description: 'Por favor, capture ou selecione uma imagem para salvar.'});
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Foto</DialogTitle>
                <DialogDescription>
                    Escolha uma nova foto do seu dispositivo ou use a câmera para capturar uma.
                </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="camera">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="camera">
                        <CameraIcon className="mr-2" /> Câmera
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                        <Upload className="mr-2" /> Upload
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="camera" className="mt-4">
                     <div className="space-y-4">
                        <div className="w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        {hasCameraPermission === false && (
                            <Alert variant="destructive">
                                <AlertTitle>Acesso à Câmera Negado</AlertTitle>
                                <AlertDescription>
                                    Para usar esta função, permita o acesso à câmera nas configurações do seu navegador.
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button onClick={handleTakePhoto} disabled={!hasCameraPermission} className="w-full">
                            <CameraIcon className="mr-2"/> Capturar Foto
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                    <div className="space-y-4">
                         <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center h-48">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2"/>
                            <Label htmlFor="file-upload" className="text-primary font-semibold cursor-pointer">
                                Clique para escolher um arquivo
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF até 10MB</p>
                            <Input id="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept="image/*" />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
             {image && (
                <div className="mt-4 text-center">
                    <p className="font-semibold mb-2">Pré-visualização:</p>
                    <img src={image} alt="Pré-visualização" className="rounded-lg max-w-full h-auto max-h-48 mx-auto" />
                </div>
            )}
            <DialogFooter className="mt-4">
                <Button variant="ghost" onClick={onDialogClose}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!image}>Salvar Imagem</Button>
            </DialogFooter>
        </DialogContent>
    );
}
