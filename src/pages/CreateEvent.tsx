import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Home } from 'lucide-react';
import Step1_ServicesAndSuppliers from '@/components/events/create/Step1_ServicesAndSuppliers_Fixed';
import Step2_Details from '@/components/events/create/Step2_Details_Refactored';
import Step3_Summary from '@/components/events/create/Step3_Summary';
import { EventData, Ticket } from '@/components/events/create/types';

const CreateEvent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { user, isLoadingUser } = useAuth();

  // Get current step from URL params, default to 1
  const currentStep = params.step ? parseInt(params.step) : 1;

  // Form state - using refs for stable references
  const [services, setServices] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<{ [service: string]: { [supplierId: string]: string[] } }>({});
  const [currentTab, setCurrentTab] = useState('services');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [eventPassword, setEventPassword] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [freeTicketLimit, setFreeTicketLimit] = useState(0);
  const [tickets, setTickets] = useState<Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>>([
    {
      id: Date.now().toString(),
      name: 'General Admission',
      quantity: 100,
      price: 0
    }
  ]);
  const [selectedPackages, setSelectedPackages] = useState<{ [serviceId: string]: { packageId: string; packageDetails: any } }>({});
  const [specialRequests, setSpecialRequests] = useState('');
  const [eventImage, setEventImage] = useState<File | null>(null);

  // Create eventData object with stable reference but updated values
  const eventDataRef = useRef<EventData>({} as EventData);
  eventDataRef.current = {
    name, description, date, time, location: eventLocation, eventType,
    isPrivate, eventPassword, isPaid, isFree, freeTicketLimit, tickets, services,
    selectedSuppliers, selectedPackages, specialRequests, currentTab, eventImage
  };

  const steps = useMemo(() => [
    { 
      number: 1, 
      title: t('createEvent.steps.servicesSuppliers'),
      path: '/create-event/step/1'
    },
    { 
      number: 2, 
      title: t('createEvent.steps.eventDetails'),
      path: '/create-event/step/2'
    },
    { 
      number: 3, 
      title: t('createEvent.steps.summary'),
      path: '/create-event/step/3'
    }
  ], [t]);

  // Load saved data from sessionStorage on component mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('createEventData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setServices(parsedData.services || []);
        setSelectedSuppliers(parsedData.selectedSuppliers || {});
        setSelectedPackages(parsedData.selectedPackages || {});
        setCurrentTab(parsedData.currentTab || 'services');
        setName(parsedData.name || '');
        setDescription(parsedData.description || '');
        setDate(parsedData.date || '');
        setTime(parsedData.time || '');
        setEventLocation(parsedData.location || '');
        setEventType(parsedData.eventType || '');
        setIsPrivate(parsedData.isPrivate || false);
        setEventPassword(parsedData.eventPassword || '');
        setIsPaid(parsedData.isPaid || false);
        setIsFree(parsedData.isFree || false);
        setFreeTicketLimit(parsedData.freeTicketLimit || 0);
        // If no saved tickets, use default ticket
        setTickets(parsedData.tickets && parsedData.tickets.length > 0 ? parsedData.tickets : [
          {
            id: Date.now().toString(),
            name: 'General Admission',
            quantity: 100,
            price: 0
          }
        ]);
        setSpecialRequests(parsedData.specialRequests || '');
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to sessionStorage whenever form data changes
  useEffect(() => {
    const dataToSave = {
      services, selectedSuppliers, selectedPackages, currentTab, name, description,
      date, time, location: eventLocation, eventType, isPrivate,
      eventPassword, isPaid, isFree, freeTicketLimit, tickets, specialRequests
    };
    sessionStorage.setItem('createEventData', JSON.stringify(dataToSave));
  }, [services, selectedSuppliers, selectedPackages, currentTab, name, description, date, time, eventLocation, eventType, isPrivate, eventPassword, isPaid, isFree, freeTicketLimit, tickets, specialRequests]);

  const handleInputChange = useCallback((field: string, value: unknown) => {
    switch (field) {
      case 'name': setName(value as string); break;
      case 'description': setDescription(value as string); break;
      case 'date': setDate(value as string); break;
      case 'time': setTime(value as string); break;
      case 'location': setEventLocation(value as string); break;
      case 'eventType': setEventType(value as string); break;
      case 'isPrivate': setIsPrivate(value as boolean); break;
      case 'eventPassword': setEventPassword(value as string); break;
      case 'isPaid': setIsPaid(value as boolean); break;
      case 'isFree': setIsFree(value as boolean); break;
      case 'freeTicketLimit': setFreeTicketLimit(value as number); break;
      case 'tickets': setTickets(value as Ticket[]); break;
      case 'selectedPackages': setSelectedPackages(value as { [serviceId: string]: { packageId: string; packageDetails: any } }); break;
      case 'specialRequests': setSpecialRequests(value as string); break;
      case 'services': setServices(value as string[]); break;
      case 'selectedSuppliers': setSelectedSuppliers(value as { [service: string]: { [supplierId: string]: string[] } }); break;
      case 'currentTab': setCurrentTab(value as string); break;
      case 'eventImage': setEventImage(value as File | null); break;
    }
  }, []);

  const nextStep = useCallback(() => {
    const next = Math.min(currentStep + 1, steps.length);
    navigate(`/create-event/step/${next}`);
  }, [currentStep, steps.length, navigate]);

  const prevStep = useCallback(() => {
    const prev = Math.max(currentStep - 1, 1);
    navigate(`/create-event/step/${prev}`);
  }, [currentStep, navigate]);

  const handleCreateEvent = useCallback(() => {
    // Clear saved data after successful creation
    sessionStorage.removeItem('createEventData');
    
    // Navigate back to dashboard or home
    navigate('/producer-dashboard');
    
    toast({
      title: "Event Created Successfully!",
      description: "Your event has been created and is now live.",
    });
  }, [navigate, toast]);

  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      // Go back to dashboard or previous page
      navigate(-1);
    } else {
      prevStep();
    }
  }, [currentStep, navigate, prevStep]);

  // Redirect to step 1 if no step is specified
  useEffect(() => {
    if (location.pathname === '/create-event') {
      navigate('/create-event/step/1', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Validate step number
  if (currentStep < 1 || currentStep > steps.length) {
    navigate('/create-event/step/1', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-4xl">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{t('dashboard.producer.backToHome')}</span>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t('createEvent.modalTitle')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Create your perfect event in just a few simple steps
          </p>
        </div>

        {/* Step Indicator */}
        <Card className="mb-4 sm:mb-8">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation select-none ${
                      currentStep > step.number ? 'bg-green-500 text-white border-green-500 dark:bg-green-600' :
                      currentStep === step.number ? 'border-primary text-primary bg-primary/10' :
                      'border-border text-muted-foreground'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <p className={`mt-1 sm:mt-2 text-xs sm:text-sm font-medium transition-all duration-300 max-w-[80px] sm:max-w-[100px] leading-tight ${
                      currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-4 rounded transition-all duration-300 ${
                      currentStep > step.number ? 'bg-green-500 dark:bg-green-600' : 'bg-border'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-2">
          <CardContent className="p-3 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="min-h-[400px] sm:min-h-[500px]"
              >
                {currentStep === 1 && (
                  <Step1_ServicesAndSuppliers
                    eventData={eventDataRef}
                    onUpdate={handleInputChange}
                    selectedServices={services}
                    onServicesChange={(newServices) => handleInputChange('services', newServices)}
                    selectedSuppliers={selectedSuppliers}
                    onSuppliersChange={(newSuppliers) => handleInputChange('selectedSuppliers', newSuppliers)}
                    selectedPackages={selectedPackages}
                    onPackagesChange={(newPackages) => handleInputChange('selectedPackages', newPackages)}
                    onNext={nextStep}
                  />
                )}
                {currentStep === 2 && (
                  <Step2_Details
                    eventData={eventDataRef.current}
                    onUpdate={handleInputChange}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                {currentStep === 3 && (
                  <Step3_Summary
                    eventData={eventDataRef.current}
                    onBack={prevStep}
                    onCreateEvent={handleCreateEvent}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;
