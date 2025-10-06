// Types for Step2 Details component
export interface Ticket {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Package details interface matching backend requirements
export interface PackageDetails {
  name: string;
  description: string;
  price: number;
  features: string[];
  duration?: number;
}

// Selected package info: maps serviceId to package data
export interface SelectedPackageInfo {
  packageId: string;
  packageDetails: PackageDetails;
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
  isFree: boolean;
  freeTicketLimit: number;
  tickets: Ticket[];
  services: string[];
  selectedSuppliers: { [service: string]: { [supplierId: string]: string[] } };
  selectedPackages: { [serviceId: string]: SelectedPackageInfo };
  specialRequests: string;
  currentTab: string;
  eventImage?: File | null;
}

export interface Step2_DetailsProps {
  eventData: EventData;
  onUpdate: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
  isEditMode?: boolean;
}
