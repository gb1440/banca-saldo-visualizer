
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Edit, Check, X } from "lucide-react";

interface BalanceEntry {
  id: string;
  date: string;
  casaDeAposta: string;
  saldo: number;
  createdAt: Date;
}

interface BalanceListProps {
  balances: BalanceEntry[];
  onUpdate: (id: string, entry: Partial<BalanceEntry>) => void;
  onDelete: (id: string) => void;
}

export const BalanceList: React.FC<BalanceListProps> = ({ balances, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    casaDeAposta: '',
    saldo: ''
  });

  const startEdit = (entry: BalanceEntry) => {
    setEditingId(entry.id);
    setEditForm({
      date: entry.date,
      casaDeAposta: entry.casaDeAposta,
      saldo: entry.saldo.toString()
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: '', casaDeAposta: '', saldo: '' });
  };

  const saveEdit = () => {
    if (!editingId) return;
    
    const saldo = parseFloat(editForm.saldo);
    if (isNaN(saldo)) return;

    onUpdate(editingId, {
      date: editForm.date,
      casaDeAposta: editForm.casaDeAposta.trim(),
      saldo: saldo
    });
    
    setEditingId(null);
  };

  // Agrupar por data e ordenar
  const groupedBalances = balances.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, BalanceEntry[]>);

  const sortedDates = Object.keys(groupedBalances).sort().reverse();

  if (balances.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum saldo cadastrado ainda. Adicione o primeiro registro!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(date => {
        const dayBalances = groupedBalances[date];
        const dayTotal = dayBalances.reduce((sum, entry) => sum + entry.saldo, 0);
        
        return (
          <div key={date} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {new Date(date).toLocaleDateString('pt-BR', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <span className="font-bold text-blue-600">
                Total: R$ {dayTotal.toFixed(2)}
              </span>
            </div>
            
            <div className="grid gap-2">
              {dayBalances.map(entry => (
                <Card key={entry.id} className="p-4">
                  {editingId === entry.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <Input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                      <Input
                        type="text"
                        value={editForm.casaDeAposta}
                        onChange={(e) => setEditForm(prev => ({ ...prev, casaDeAposta: e.target.value }))}
                        placeholder="Casa de apostas"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.saldo}
                        onChange={(e) => setEditForm(prev => ({ ...prev, saldo: e.target.value }))}
                        placeholder="Saldo"
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">
                            {entry.casaDeAposta}
                          </span>
                          <span className="font-bold text-green-600">
                            R$ {entry.saldo.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Registrado em {entry.createdAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => onDelete(entry.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
