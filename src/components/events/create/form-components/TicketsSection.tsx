import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Ticket as TicketType } from '../types';
import { TicketItem } from './TicketItem';

interface TicketsSectionProps {
  tickets: TicketType[];
  onUpdate: (id: string, updates: Partial<TicketType>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const TicketsSection = React.memo<TicketsSectionProps>(({ 
  tickets, 
  onUpdate, 
  onAdd, 
  onRemove,
  disabled = false
}) => {
  const { t } = useTranslation();
  
  const totalRevenue = useMemo(() => {
    return tickets.reduce((sum, ticket) => sum + (ticket.quantity * ticket.price), 0);
  }, [tickets]);

  const totalTickets = useMemo(() => {
    return tickets.reduce((sum, t) => sum + t.quantity, 0);
  }, [tickets]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{t('createEvent.step2.ticketTypes')}</h4>
        {!disabled && (
          <Button onClick={onAdd} size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('createEvent.step2.addTicket')}
          </Button>
        )}
      </div>
      
      {tickets.length === 0 ? (
        <Card className="p-6 text-center">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-3">{t('createEvent.step2.noTickets')}</p>
          {!disabled && (
            <Button onClick={onAdd} variant="outline">
              {t('createEvent.step2.addTicket')}
            </Button>
          )}
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketItem
                key={ticket.id}
                ticket={ticket}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            ))}
          </div>
          
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('createEvent.step3.totalRevenue')}</p>
                <p className="text-sm text-gray-600">
                  {totalTickets} {t('createEvent.step3.tickets')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₪{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
});

TicketsSection.displayName = 'TicketsSection';
