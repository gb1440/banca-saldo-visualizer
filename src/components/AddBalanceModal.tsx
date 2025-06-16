
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface AddBalanceModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: { date: string; casaDeAposta: string; saldo: number }) => void;
}

export const AddBalanceModal: React.FC<AddBalanceModalProps> = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    casaDeAposta: '',
    saldo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.casaDeAposta.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o nome da casa de apostas.",
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
      date: formData.date,
      casaDeAposta: formData.casaDeAposta.trim(),
      saldo: saldo
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      casaDeAposta: '',
      saldo: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Saldo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="casaDeAposta">Casa de Apostas</Label>
            <Input
              id="casaDeAposta"
              type="text"
              placeholder="Ex: Bet365, Betano, etc."
              value={formData.casaDeAposta}
              onChange={(e) => setFormData(prev => ({ ...prev, casaDeAposta: e.target.value }))}
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
