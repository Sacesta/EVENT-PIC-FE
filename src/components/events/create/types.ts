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
  // Changed from service-based to category-based
  categories: string[]; // Selected categories (e.g., ['dj', 'catering'])
  // Simplified structure: category -> supplier -> packageIds
  selectedPackages: {
    [category: string]: {
      [supplierId: string]: string[] // Array of package IDs
    }
  };
  packageDetails: { [packageId: string]: SelectedPackageInfo }; // Package details by package ID
  specialRequests: string;
  currentTab: string;
  eventImage?: File | null;
  bankDetails: BankDetails;

  // Legacy fields (for backward compatibility during migration)
  services?: string[];
  selectedSuppliers?: { [service: string]: { [supplierId: string]: string[] } };
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
  isEditMode?: boolean;
}
