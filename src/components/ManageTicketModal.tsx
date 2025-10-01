import React, { useState } from 'react';
import { X, Plus, Pencil, Trash2, Ticket, DollarSign, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TicketType {
  id: string;
  type: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
}

interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  tickets: TicketType[];
}

interface ManageTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onSave: (eventId: string, tickets: TicketType[]) => void;
}

export const ManageTicketModal: React.FC<ManageTicketModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave
}) => {
  const [tickets, setTickets] = useState<TicketType[]>(event?.tickets || []);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTicket, setNewTicket] = useState<Partial<TicketType>>({
    type: '',
    price: 0,
    quantity: 0,
    description: ''
  });

  if (!event) return null;

  const handleAddTicket = () => {
    if (!newTicket.type || !newTicket.price || !newTicket.quantity) return;

    const ticket: TicketType = {
      id: Math.random().toString(36).substr(2, 9),
      type: newTicket.type,
      price: newTicket.price,
      quantity: newTicket.quantity,
      sold: 0,
      description: newTicket.description
    };

    setTickets([...tickets, ticket]);
    setNewTicket({ type: '', price: 0, quantity: 0, description: '' });
    setShowAddForm(false);
  };

  const handleEditTicket = (ticket: TicketType) => {
    setEditingTicket({ ...ticket });
  };

  const handleSaveEdit = () => {
    if (!editingTicket) return;

    setTickets(tickets.map(t => t.id === editingTicket.id ? editingTicket : t));
    setEditingTicket(null);
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(tickets.filter(t => t.id !== ticketId));
  };

  const handleSave = () => {
    onSave(event.id, tickets);
    onClose();
  };

  const calculateStats = () => {
    const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const totalSold = tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
    const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.sold), 0);
    const availableTickets = totalTickets - totalSold;

    return { totalTickets, totalSold, totalRevenue, availableTickets };
  };

  const stats = calculateStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Manage Tickets - {event.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mx-auto mb-2">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold">{stats.totalTickets}</div>
                <div className="text-sm text-muted-foreground">Total Tickets</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 mx-auto mb-2">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{stats.totalSold}</div>
                <div className="text-sm text-muted-foreground">Sold</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{stats.availableTickets}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10 mx-auto mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Types */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ticket Types</CardTitle>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Ticket Type
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{ticket.type}</h4>
                      <Badge variant="outline">${ticket.price}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTicket(ticket)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTicket(ticket.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Sales Progress: {ticket.sold} / {ticket.quantity}
                    </span>
                    <span className="text-sm font-medium">
                      {ticket.quantity > 0 ? Math.round((ticket.sold / ticket.quantity) * 100) : 0}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={ticket.quantity > 0 ? (ticket.sold / ticket.quantity) * 100 : 0}
                    className="h-2"
                  />
                </div>
              ))}

              {tickets.length === 0 && (
                <div className="text-center py-8">
                  <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Ticket Types</h3>
                  <p className="text-muted-foreground">Add ticket types to start selling tickets for your event.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Ticket Form */}
        {showAddForm && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Add New Ticket Type
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ticket-type">Ticket Type</Label>
                  <Input
                    id="ticket-type"
                    placeholder="e.g., General, VIP, Early Bird"
                    value={newTicket.type}
                    onChange={(e) => setNewTicket({...newTicket, type: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="ticket-price">Price ($)</Label>
                  <Input
                    id="ticket-price"
                    type="number"
                    placeholder="0"
                    value={newTicket.price || ''}
                    onChange={(e) => setNewTicket({...newTicket, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="ticket-quantity">Quantity</Label>
                  <Input
                    id="ticket-quantity"
                    type="number"
                    placeholder="0"
                    value={newTicket.quantity || ''}
                    onChange={(e) => setNewTicket({...newTicket, quantity: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ticket-description">Description (Optional)</Label>
                <Input
                  id="ticket-description"
                  placeholder="Brief description of this ticket type"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTicket} disabled={!newTicket.type || !newTicket.price || !newTicket.quantity}>
                  Add Ticket Type
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Ticket Form */}
        {editingTicket && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Edit Ticket Type
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTicket(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-ticket-type">Ticket Type</Label>
                  <Input
                    id="edit-ticket-type"
                    value={editingTicket.type}
                    onChange={(e) => setEditingTicket({...editingTicket, type: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ticket-price">Price ($)</Label>
                  <Input
                    id="edit-ticket-price"
                    type="number"
                    value={editingTicket.price}
                    onChange={(e) => setEditingTicket({...editingTicket, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ticket-quantity">Quantity</Label>
                  <Input
                    id="edit-ticket-quantity"
                    type="number"
                    value={editingTicket.quantity}
                    onChange={(e) => setEditingTicket({...editingTicket, quantity: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-ticket-description">Description (Optional)</Label>
                <Input
                  id="edit-ticket-description"
                  value={editingTicket.description || ''}
                  onChange={(e) => setEditingTicket({...editingTicket, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingTicket(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};