'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

type PricingStrategy = 'fixed' | 'per_km';

export default function ProfileForm() {
    const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>('fixed');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" defaultValue="Roberto Andrade" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pix">Chave PIX (Email ou Telefone)</Label>
                        <Input id="pix" defaultValue="roberto.andrade@email.com" />
                    </div>
                    <Button>Salvar Alterações</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Informações do Veículo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Input id="model" defaultValue="Chevrolet Onix" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="plate">Placa</Label>
                        <Input id="plate" defaultValue="BRA2E19" />
                    </div>
                    <Button>Salvar Alterações</Button>
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="font-headline">Documentos e Tarifas</CardTitle>
                    <CardDescription>Faça upload dos seus documentos e configure sua estratégia de preços.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Documentos</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> CNH</Button>
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> CRLV</Button>
                        </div>
                    </div>
                    
                    <div className="space-y-4 rounded-lg border p-4">
                        <Label className="font-semibold">Estratégia de Preço</Label>
                        <RadioGroup 
                            defaultValue="fixed"
                            onValueChange={(value: PricingStrategy) => setPricingStrategy(value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fixed" id="r1" />
                                <Label htmlFor="r1">Tarifa Fixa / Negociada</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="per_km" id="r2" />
                                <Label htmlFor="r2">Calcular por Quilometragem</Label>
                            </div>
                        </RadioGroup>

                        {pricingStrategy === 'fixed' && (
                            <div className="space-y-2 pt-2">
                                <Label htmlFor="fixed-fare">Tarifa Fixa Urbana (valor mínimo)</Label>
                                <Input id="fixed-fare" type="number" placeholder="Ex: 10.00" />
                                <p className="text-xs text-muted-foreground">Para viagens ao interior/outras cidades, o valor será negociado.</p>
                            </div>
                        )}

                        {pricingStrategy === 'per_km' && (
                            <div className="space-y-2 pt-2">
                                <Label htmlFor="km-fare">Tarifa por KM</Label>
                                <Input id="km-fare" type="number" placeholder="Ex: 2.50" />
                                <p className="text-xs text-muted-foreground">O valor da corrida será calculado com base na distância.</p>
                            </div>
                        )}
                    </div>

                    <Button>Salvar Configurações</Button>
                </CardContent>
            </Card>
        </div>
    )
}
