import React, { useState } from 'react';
import { X, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Ticket {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  type?: string;
  price: number | { amount: number; currency?: string };
  quantity: number | { total: number; available: number; sold?: number; reserved?: number };
  remainingQuantity?: number;
  description?: string;
}

interface AttendeeInfo {
  fullName: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
}

interface BookTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  eventName: string;
  onBookingComplete: (selectedTickets: any[], attendeeInfo: AttendeeInfo) => void;
}

export const BookTicketModal: React.FC<BookTicketModalProps> = ({
  isOpen,
  onClose,
  tickets,
  eventName,
  onBookingComplete
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo>({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const handleTicketQuantityChange = (ticketId: string, change: number) => {
    setSelectedTickets(prev => {
      const currentQty = prev[ticketId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [ticketId]: newQty };
    });
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const getTicketPrice = (ticket: Ticket) => {
    return typeof ticket.price === 'number' ? ticket.price : ticket.price?.amount || 0;
  };

  const getTicketQuantity = (ticket: Ticket) => {
    // Use remainingQuantity if available (this is the actual available tickets after sales)
    if (ticket.remainingQuantity !== undefined) {
      return ticket.remainingQuantity;
    }
    // Fallback to calculating from quantity object
    if (typeof ticket.quantity === 'object') {
      const sold = ticket.quantity.sold || 0;
      const reserved = ticket.quantity.reserved || 0;
      const available = ticket.quantity.available || ticket.quantity.total || 0;
      return available - sold - reserved;
    }
    // Fallback to simple number
    return typeof ticket.quantity === 'number' ? ticket.quantity : 0;
  };

  const getTicketName = (ticket: Ticket) => {
    return ticket.title || ticket.name || ticket.type || 'Ticket';
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((sum, [ticketId, qty]) => {
      const ticket = tickets.find(t => (t._id || t.id || t.type) === ticketId);
      return sum + getTicketPrice(ticket!) * qty;
    }, 0);
  };

  const handleNextStep = () => {
    if (getTotalTickets() === 0) {
      alert('Please select at least one ticket');
      return;
    }
    setStep(2);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!attendeeInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!attendeeInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeInfo.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!attendeeInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!attendeeInfo.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(attendeeInfo.age)) || Number(attendeeInfo.age) < 1) {
      newErrors.age = 'Invalid age';
    }

    if (!attendeeInfo.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const bookingData = Object.entries(selectedTickets).map(([ticketId, quantity]) => {
      const ticket = tickets.find(t => (t._id || t.id || t.type) === ticketId);
      return {
        ticketId,
        ticketName: getTicketName(ticket!),
        quantity,
        price: getTicketPrice(ticket!)
      };
    });

    onBookingComplete(bookingData, attendeeInfo);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedTickets({});
    setAttendeeInfo({
      fullName: '',
      email: '',
      phone: '',
      age: '',
      gender: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Book Tickets</h2>
            <p className="text-sm text-muted-foreground mt-1">{eventName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${step === 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Select Tickets</span>
            <span>Attendee Info</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            // Step 1: Ticket Selection
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Select Your Tickets</h3>
              
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tickets available for this event
                </div>
              ) : (
                tickets.map((ticket) => {
                  const ticketId = ticket._id || ticket.id || ticket.type || '';
                  const selectedQty = selectedTickets[ticketId] || 0;
                  const availableQty = getTicketQuantity(ticket);
                  const isAvailable = availableQty > 0;
                  const ticketPrice = getTicketPrice(ticket);
                  const ticketName = getTicketName(ticket);
                  const currency = typeof ticket.price === 'object' ? ticket.price.currency || 'ILS' : 'ILS';

                  return (
                    <Card key={ticketId} className={!isAvailable ? 'opacity-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{ticketName}</h4>
                              {!isAvailable && (
                                <Badge variant="destructive">Sold Out</Badge>
                              )}
                            </div>
                            {ticket.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {ticket.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4">
                              <p className="text-lg font-bold text-primary">
                                ₪{ticketPrice}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {availableQty} available
                              </p>
                            </div>
                          </div>

                          {isAvailable && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleTicketQuantityChange(ticketId, -1)}
                                disabled={selectedQty === 0}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">
                                {selectedQty}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleTicketQuantityChange(ticketId, 1)}
                                disabled={selectedQty >= availableQty}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}

              {/* Summary */}
              {getTotalTickets() > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Tickets</p>
                        <p className="text-2xl font-bold">{getTotalTickets()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="text-2xl font-bold text-primary">₪{getTotalPrice()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Step 2: Attendee Registration
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Attendee Registration</h3>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={attendeeInfo.fullName}
                    onChange={(e) => {
                      setAttendeeInfo({ ...attendeeInfo, fullName: e.target.value });
                      setErrors({ ...errors, fullName: '' });
                    }}
                    placeholder="Enter your full name"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={attendeeInfo.email}
                    onChange={(e) => {
                      setAttendeeInfo({ ...attendeeInfo, email: e.target.value });
                      setErrors({ ...errors, email: '' });
                    }}
                    placeholder="Enter your email"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={attendeeInfo.phone}
                    onChange={(e) => {
                      setAttendeeInfo({ ...attendeeInfo, phone: e.target.value });
                      setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="Enter your phone number"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={attendeeInfo.age}
                    onChange={(e) => {
                      setAttendeeInfo({ ...attendeeInfo, age: e.target.value });
                      setErrors({ ...errors, age: '' });
                    }}
                    placeholder="Enter your age"
                    min="1"
                    className={errors.age ? 'border-red-500' : ''}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-500 mt-1">{errors.age}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={attendeeInfo.gender}
                    onValueChange={(value) => {
                      setAttendeeInfo({ ...attendeeInfo, gender: value });
                      setErrors({ ...errors, gender: '' });
                    }}
                  >
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>

              {/* Booking Summary */}
              <Card className="bg-muted/50 mt-6">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(selectedTickets).map(([ticketId, qty]) => {
                      const ticket = tickets.find(t => (t._id || t.id || t.type) === ticketId);
                      return (
                        <div key={ticketId} className="flex justify-between">
                          <span>{getTicketName(ticket!)} x {qty}</span>
                          <span className="font-medium">₪{getTicketPrice(ticket!) * qty}</span>
                        </div>
                      );
                    })}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">₪{getTotalPrice()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNextStep} disabled={getTotalTickets() === 0}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Complete Booking
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
