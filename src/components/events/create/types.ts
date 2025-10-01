// Types for Step2 Details component
export interface Ticket {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface EventData {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  eventType: string;
  isPrivate: boolean;
  eventPassword: string;
  isPaid: boolean;
  tickets: Ticket[];
  services: string[];
  selectedSuppliers: { [service: string]: { [supplierId: string]: string[] } };
  specialRequests: string;
  currentTab: string;
}

export interface Step2_DetailsProps {
  eventData: EventData;
  onUpdate: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
  isEditMode?: boolean;
}
