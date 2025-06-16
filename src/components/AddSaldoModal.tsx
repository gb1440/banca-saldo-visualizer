
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CasaDeAposta, RegistroSaldo } from "@/types";

interface AddSaldoModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (registro: Omit<RegistroSaldo, 'id' | 'createdAt'>) => void;
  casas: CasaDeAposta[];
}

export const AddSaldoModal: React.FC<AddSaldoModalProps> = ({ 
  open, 
  onClose, 
  onAdd, 
  casas 
}) => {
  const [formData, setFormData] = useState({
    casaDeApostaId: '',
    data: new Date().toISOString().split('T')[0],
    saldo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.casaDeApostaId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma casa de apostas.",
        variant: "destructive"
      });
      return;
    }

    const saldo = parseFloat(formData.saldo);
    if (isNaN(saldo)) {
      toast({
        title: "Erro",
        description: "Por favor, informe um saldo válido.",
        variant: "destructive"
      });
      return;
    }

    onAdd({
      casaDeApostaId: formData.casaDeApostaId,
      data: formData.data,
      saldo: saldo
    });

    setFormData({
      casaDeApostaId: '',
      data: new Date().toISOString().split('T')[0],
      saldo: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Saldo Diário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="casa">Casa de Apostas</Label>
            <Select value={formData.casaDeApostaId} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, casaDeApostaId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma casa de apostas" />
              </SelectTrigger>
              <SelectContent>
                {casas.map(casa => (
                  <SelectItem key={casa.id} value={casa.id}>
                    {casa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="saldo">Saldo Atual (R$)</Label>
            <Input
              id="saldo"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.saldo}
              onChange={(e) => setFormData(prev => ({ ...prev, saldo: e.target.value }))}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Adicionar Saldo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
