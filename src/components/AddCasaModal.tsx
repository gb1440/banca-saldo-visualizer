
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CasaDeAposta } from "@/types";

interface AddCasaModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (casa: Omit<CasaDeAposta, 'id' | 'createdAt'>) => void;
  casasExistentes: CasaDeAposta[];
}

export const AddCasaModal: React.FC<AddCasaModalProps> = ({ 
  open, 
  onClose, 
  onAdd, 
  casasExistentes 
}) => {
  const [nome, setNome] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o nome da casa de apostas.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já existe uma casa com o mesmo nome
    const nomeExiste = casasExistentes.some(
      casa => casa.nome.toLowerCase() === nome.trim().toLowerCase()
    );

    if (nomeExiste) {
      toast({
        title: "Erro",
        description: "Já existe uma casa de apostas com este nome.",
        variant: "destructive"
      });
      return;
    }

    onAdd({ nome: nome.trim() });
    setNome('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Casa de Apostas</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Casa de Apostas</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Ex: Bet365, Betano, Pinnacle..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
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
