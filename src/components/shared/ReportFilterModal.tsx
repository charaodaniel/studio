'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { addDays, format, startOfMonth, endOfMonth, subMonths, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, FileText } from 'lucide-react';
import { DateRange as ReactDateRange } from 'react-day-picker';

export interface DateRange {
    from: Date;
    to: Date;
}

interface ReportFilterModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onGenerateReport: (dateRange: DateRange) => void;
    userName: string;
}

const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const date = subMonths(now, i);
        options.push({
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM/yyyy', { locale: ptBR }),
        });
    }
    return options;
};

export default function ReportFilterModal({ isOpen, onOpenChange, onGenerateReport, userName }: ReportFilterModalProps) {
    const [activeTab, setActiveTab] = useState('month');
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [date, setDate] = useState<ReactDateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const monthOptions = getMonthOptions();
    
    const handleGenerate = () => {
        let finalDateRange: DateRange | null = null;
        
        if (activeTab === 'month') {
            const [year, month] = selectedMonth.split('-').map(Number);
            const startDate = startOfMonth(new Date(year, month - 1));
            const endDate = endOfMonth(new Date(year, month - 1));
            finalDateRange = { from: startDate, to: endDate };
        } else if (date?.from && date?.to) {
             // Ensure the 'to' date includes the entire day
            finalDateRange = { from: date.from, to: endOfDay(date.to) };
        }

        if (finalDateRange) {
            onGenerateReport(finalDateRange);
            onOpenChange(false); // Close modal after generating
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-headline">
                        <FileText />
                        Gerar Relatório de Corridas
                    </DialogTitle>
                    <DialogDescription>
                        Selecione o período do relatório para {userName}.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="month">Por Mês</TabsTrigger>
                        <TabsTrigger value="custom">Personalizado</TabsTrigger>
                    </TabsList>
                    <TabsContent value="month" className="pt-4">
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um mês" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TabsContent>
                    <TabsContent value="custom" className="pt-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                                                {format(date.to, "LLL dd, y", { locale: ptBR })}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y", { locale: ptBR })
                                        )
                                    ) : (
                                        <span>Escolha um intervalo</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleGenerate}>Gerar Relatório</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
