// Types for Step2 Details component
export interface Ticket {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
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

export interface BankDetails {
  bankName: string;
  branch: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface EventData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
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
  bankDetails: BankDetails;
}

export interface Step2_DetailsProps {
  eventData: EventData;
  onUpdate: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
  isEditMode?: boolean;
}

export interface Step_BankDetailsProps {
  eventData: EventData;
  onUpdate: (field: string, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}
