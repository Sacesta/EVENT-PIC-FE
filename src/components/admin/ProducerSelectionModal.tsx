import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, User, Building, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';

interface Producer {
  _id: string;
  name: string;
  email: string;
  role: string;
  producerDetails?: {
    companyName?: string;
    specializations: string[];
  };
}

interface ProducerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProducerSelect: (producer: Producer) => void;
}

const ProducerSelectionModal: React.FC<ProducerSelectionModalProps> = ({
  isOpen,
  onClose,
  onProducerSelect
}) => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [filteredProducers, setFilteredProducers] = useState<Producer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const { toast } = useToast();

  // Fetch producers
  useEffect(() => {
    if (isOpen) {
      fetchProducers();
    }
  }, [isOpen]);

  // Filter producers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducers(producers);
    } else {
      const filtered = producers.filter(producer =>
        producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producer.producerDetails?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducers(filtered);
    }
  }, [searchTerm, producers]);

  const fetchProducers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers({ role: 'producer', limit: 100 });
      
      if (response?.data) {
        const users = response.data as Producer[];
        setProducers(users);
        setFilteredProducers(users);
      }
    } catch (error) {
      console.error('Error fetching producers:', error);
      toast({
        title: "Error",
        description: "Failed to load producers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
  };

  const handleConfirm = () => {
    if (selectedProducer) {
      onProducerSelect(selectedProducer);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedProducer(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Select Producer for Event
          </DialogTitle>
          <DialogDescription>
            Choose which producer this event will be associated with. The event will appear as if it was created by the selected producer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search producers by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Producer */}
          {selectedProducer && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {selectedProducer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedProducer.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedProducer.email}</p>
                  {selectedProducer.producerDetails?.companyName && (
                    <p className="text-xs text-muted-foreground">
                      {selectedProducer.producerDetails.companyName}
                    </p>
                  )}
                </div>
                <Badge variant="default">Selected</Badge>
              </div>
            </div>
          )}

          {/* Producers List */}
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducers.length > 0 ? (
              <div className="space-y-2">
                {filteredProducers.map((producer) => (
                  <div
                    key={producer._id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedProducer?._id === producer._id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                    onClick={() => handleProducerSelect(producer)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {producer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{producer.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            Producer
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{producer.email}</p>
                        {producer.producerDetails?.companyName && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {producer.producerDetails.companyName}
                            </span>
                          </div>
                        )}
                        {producer.producerDetails?.specializations && producer.producerDetails.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {producer.producerDetails.specializations.slice(0, 3).map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {producer.producerDetails.specializations.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{producer.producerDetails.specializations.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Producers Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No producers match your search criteria.' : 'No producers are available.'}
                </p>
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedProducer}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event as {selectedProducer?.name}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProducerSelectionModal;
