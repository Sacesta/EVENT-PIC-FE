import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ticket as TicketType } from '../types';

interface TicketItemProps {
  ticket: TicketType;
  onUpdate: (id: string, updates: Partial<TicketType>) => void;
  onRemove: (id: string) => void;
}

export const TicketItem = React.memo<TicketItemProps>(({ 
  ticket, 
  onUpdate, 
  onRemove 
}) => {
  const { t } = useTranslation();
  
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(ticket.id, { name: e.target.value });
  }, [ticket.id, onUpdate]);

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(ticket.id, { quantity: parseInt(e.target.value) || 0 });
  }, [ticket.id, onUpdate]);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(ticket.id, { price: parseFloat(e.target.value) || 0 });
  }, [ticket.id, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(ticket.id);
  }, [ticket.id, onRemove]);

  const totalRevenue = useMemo(() => {
    return ((ticket.quantity || 0) * (ticket.price || 0)).toFixed(2);
  }, [ticket.quantity, ticket.price]);

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="font-medium">{t('createEvent.step2.ticketTypes')}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-gray-500">{t('createEvent.step2.ticketName')}</Label>
            <Input
              placeholder={t('createEvent.step2.ticketNamePlaceholder')}
              value={ticket.name}
              onChange={handleNameChange}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">{t('createEvent.step2.quantity')}</Label>
            <Input
              type="number"
              min="1"
              placeholder="100"
              value={ticket.quantity || ''}
              onChange={handleQuantityChange}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">{t('createEvent.step2.price')}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="50.00"
              value={ticket.price || ''}
              onChange={handlePriceChange}
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          {t('createEvent.step3.totalRevenue')}: ₪{totalRevenue}
        </div>
      </div>
    </Card>
  );
});

TicketItem.displayName = 'TicketItem';
