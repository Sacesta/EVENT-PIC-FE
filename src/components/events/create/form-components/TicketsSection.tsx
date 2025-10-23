import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Ticket as TicketType } from '../types';
import { TicketItem } from './TicketItem';

interface TicketsSectionProps {
  tickets: TicketType[];
  onUpdate: (id: string, updates: Partial<TicketType>) => void;
  onAdd: (newTickets?: TicketType[] | TicketType) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
  isPaid?: boolean;
}

export const TicketsSection = React.memo<TicketsSectionProps>(
  ({ tickets, onUpdate, onAdd, onRemove, disabled = false, isPaid = true }) => {
    const { t, i18n } = useTranslation();

    // Define the 3 default ticket names
    const defaultTicketNames =
      i18n.language === 'he'
        ? ['מחיר מוקדם', 'מחיר רגיל', 'מחיר אחרון']
        : ['Early Bird Price', 'Regular Price', 'Last Minute Price'];

    // Auto-create 1 ticket on mount if none exist (only for paid events)
    useEffect(() => {
      if (tickets.length === 0 && isPaid) {
        const defaultTicket: TicketType = {
          id: 'auto-1',
          name: defaultTicketNames[0], // Use only the first ticket name (Early Bird)
          quantity: 0,
          price: 0,
          currency: 'ILS',
        };
        onAdd(defaultTicket);
      }
    }, [tickets.length, i18n.language, isPaid]);

    const totalRevenue = useMemo(() => {
      return tickets.reduce(
        (sum, ticket) => sum + (ticket.quantity * ticket.price || 0),
        0
      );
    }, [tickets]);

    const totalTickets = useMemo(() => {
      return tickets.reduce((sum, t) => sum + (t.quantity || 0), 0);
    }, [tickets]);

    const handleAddClick = () => {
      const newTicket: TicketType = {
        id: `manual-${Date.now()}`,
        name: '',
        quantity: 0,
        price: 0,
        currency: 'ILS',
      };
      onAdd(newTicket);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{t('createEvent.step2.ticketTypes')}</h4>
          {!disabled && (
            <Button
              onClick={handleAddClick}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('createEvent.step2.addTicket')}
            </Button>
          )}
        </div>

        {tickets.length === 0 ? (
          <Card className="p-6 text-center">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-3">
              {t('createEvent.step2.noTickets')}
            </p>
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
                  isPaid={isPaid}
                />
              ))}
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {isPaid ? t('createEvent.step3.totalRevenue') : t('createEvent.step3.totalAttendees')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {totalTickets} {isPaid ? t('createEvent.step3.tickets') : t('createEvent.step3.attendees')}
                  </p>
                </div>
                {isPaid && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {tickets.length > 0 && tickets.every(t => t.currency === tickets[0].currency)
                        ? `${tickets[0].currency === 'USD' ? '$' : tickets[0].currency === 'EUR' ? '€' : '₪'}${totalRevenue.toFixed(2)}`
                        : 'Multiple currencies'
                      }
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    );
  }
);

TicketsSection.displayName = 'TicketsSection';
