import config from "../config/environment";

// Type definitions
interface LoginCredentials {
  email: string;
  password: string;
}

interface UserData {
  name: string;
  email: string;
  password: string;
  role?: string;
  [key: string]: unknown;
}

interface EventData {
  name: string;
  description?: string;
  image?: string;
  startDate: string;
  endDate: string;
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  language?: "he" | "en" | "ar";
  category: string;
  requiredServices?: string[]; // Categories required for the event
  suppliers?: Array<{
    supplierId: string;
    packages: Array<{
      packageId: string;
      requestedPrice?: number;
      notes?: string;
      priority?: "low" | "medium" | "high";
    }>;
  }>;
  status?: "draft" | "published" | "cancelled" | "completed";
  isPublic?: boolean;
  password?: string; // Password for private events (when isPublic is false)
  ticketInfo?: {
    availableTickets: number;
    soldTickets?: number;
    reservedTickets?: number;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  budget?: {
    total: number;
    allocated?: Record<string, number>;
    spent?: number;
  };
  tags?: string[];
  featured?: boolean;
  bankDetails?: {
    bankName: string;
    branch: string;
    accountNumber: string;
    accountHolderName: string;
  };
  [key: string]: unknown;
}

interface Event {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  startDate: string;
  endDate: string;
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  language?: "he" | "en" | "ar";
  category: string;
  requiredServices?: string[]; // Categories required for the event
  suppliers?: Array<{
    packageDetails: any;
    supplierId: {
      _id: string;
      name: string;
      companyName?: string;
      profileImage?: string;
      isActive: boolean;
    };
    packageId: string; // Primary reference for packages
    serviceId?: string | { title?: string; packages?: unknown[] }; // DEPRECATED: Backward compatibility
    selectedPackageId?: string; // DEPRECATED: Backward compatibility
    requestedPrice?: number;
    finalPrice?: number; // Final negotiated price
    notes?: string;
    priority?: "low" | "medium" | "high";
    status?: "pending" | "approved" | "rejected";
  }>;
  producerId: {
    _id: string;
    name: string;
    companyName?: string;
    profileImage?: string;
  };
  status: "draft" | "approved" | "rejected" | "completed";
  isPublic: boolean;
  ticketInfo?: {
    availableTickets: number;
    soldTickets?: number;
    reservedTickets?: number;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  budget?: {
    total: number;
    allocated?: Record<string, number>;
    spent?: number;
  };
  tags?: string[];
  featured?: boolean;
  bankDetails?: {
    bankName: string;
    branch: string;
    accountNumber: string;
    accountHolderName: string;
  };
  tickets?: Array<{
    _id: string;
    title: string;
    description?: string;
    type: string;
    price: {
      amount: number;
      currency: string;
    };
    quantity: {
      total: number;
      available: number;
    };
  }>;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Enhanced interfaces for /my-events API endpoint
interface EnhancedSupplier {
  supplierId: {
    _id: string;
    name: string;
    companyName?: string;
    profileImage?: string;
    email: string;
    phone: string;
    isActive: boolean;
  };
  packageId: { // Changed from serviceId
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images?: string[];
    availability: Record<string, unknown>;
    location: Record<string, unknown>;
  };
  status: "pending" | "approved" | "rejected" | "cancelled";
  requestedPrice?: number;
  finalPrice?: number;
  notes?: string;
  priority?: "low" | "medium" | "high";
  requestedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  messages?: Record<string, unknown>[];
}

interface SupplierStats {
  totalSuppliers: number;
  totalPackages: number; // Changed from totalServices
  approvedPackages: number; // Changed from approvedServices
  pendingPackages: number; // Changed from pendingServices
  rejectedPackages: number; // Changed from rejectedServices
  cancelledPackages: number; // Changed from cancelledServices
}

interface FinancialSummary {
  totalRequestedPrice: number;
  totalFinalPrice: number;
  estimatedCost: number;
  budgetUtilization: number;
}

interface GroupedSupplier {
  supplier: {
    _id: string;
    name: string;
    companyName?: string;
    profileImage?: string;
    email: string;
    phone: string;
  };
  packages: Array<{ // Changed from services
    package: { // Changed from service
      _id: string;
      name: string;
      description: string;
      price: number;
      category: string;
      images?: string[];
      availability: Record<string, unknown>;
      location: Record<string, unknown>;
    };
    status: "pending" | "approved" | "rejected" | "cancelled";
    requestedPrice?: number;
    finalPrice?: number;
    notes?: string;
    priority?: "low" | "medium" | "high";
    requestedAt?: string;
    confirmedAt?: string;
    completedAt?: string;
    messages?: Record<string, unknown>[];
  }>;
}

interface StatusIndicators {
  isUpcoming: boolean;
  isPast: boolean;
  isActive: boolean;
  daysUntilEvent: number;
  duration: number;
}

interface EnhancedEvent {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  startDate: string;
  endDate: string;
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  language?: "he" | "en" | "ar";
  category: string;
  requiredServices?: string[];
  producerId: {
    _id: string;
    name: string;
    companyName?: string;
    profileImage?: string;
  };
  status: "draft" | "approved" | "rejected" | "completed";
  isPublic: boolean;
  ticketInfo?: {
    availableTickets: number;
    soldTickets?: number;
    reservedTickets?: number;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  budget?: {
    total: number;
    allocated?: Record<string, number>;
    spent?: number;
  };
  tags?: string[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  supplierStats: SupplierStats;
  financialSummary: FinancialSummary;
  groupedSuppliers: Record<string, GroupedSupplier>;
  groupedSuppliersArray: GroupedSupplier[];
  statusIndicators: StatusIndicators;
  suppliers: EnhancedSupplier[];
  [key: string]: unknown;
}

interface OverallStats {
  totalEvents: number;
  draftEvents: number;
  approvedEvents: number;
  completedEvents: number;
  rejectedEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalUniqueSuppliers: number;
  totalPackages: number; // Changed from totalServices
  totalApprovedPackages: number; // Changed from totalApprovedServices
  totalSpent: number;
}

interface MyEventsResponse {
  success: boolean;
  data: EnhancedEvent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  overallStats: OverallStats;
  message: string;
}

interface MyEventsParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

// Package is now the primary entity (replaces Service)
interface PackageData {
  name: string;
  description: string;
  category: string; // Moved from Service level to Package level
  price: {
    amount: number;
    currency: string;
    pricingType: string;
    minPrice?: number;
    maxPrice?: number;
  };
  features?: string[];
  duration?: number;
  isPopular?: boolean;
  image?: string;
  portfolio?: Array<{
    title?: string;
    description?: string;
    image?: string;
    eventType?: string;
    date?: string;
  }>;
  availability?: {
    // Simple format (for general availability)
    days?: string[];
    hours?: {
      start: string;
      end: string;
    };
    // Advanced format (for complex availability tracking)
    startDate?: string;
    endDate?: string;
    workingHours?: {
      [key: string]: {
        start: string;
        end: string;
        available: boolean;
      };
    };
    leadTime?: number;
  };
  featured?: boolean;
  [key: string]: unknown;
}

interface PackageWithId extends PackageData {
  _id: string;
}

// Legacy ServiceData interface (for backward compatibility during migration)
// @deprecated - Use PackageData instead
interface ServiceData extends PackageData {
  title: string; // Maps to PackageData.name
}

// Package interface (primary entity - replaces Service)
interface Package {
  _id: string;
  name: string;
  description: string;
  category: string; // Category is now at package level
  price: {
    amount: number;
    currency: string;
    pricingType: string;
    minPrice?: number;
    maxPrice?: number;
  };
  features?: string[];
  duration?: number;
  isPopular?: boolean;
  image?: string;
  imageUrl?: string; // Virtual field from backend with full URL
  portfolio?: Array<{
    title?: string;
    description?: string;
    image?: string;
    eventType?: string;
    date?: string;
  }>;
  availability?: {
    startDate?: string;
    endDate?: string;
    workingHours?: {
      [key: string]: {
        start: string;
        end: string;
        available: boolean;
      };
    };
    leadTime?: number;
  };
  featured?: boolean;
  available?: boolean;
  status?: string;
  rating?: {
    average: number;
    count: number;
    reviews: Array<{
      userId: string;
      rating: number;
      comment?: string;
      createdAt: string;
    }>;
  };
  views?: number;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy Service interface (for backward compatibility)
// @deprecated - Use Package instead
interface Service extends Omit<Package, 'name'> {
  title: string; // Maps to Package.name
  packages?: Array<{
    _id: string;
    name: string;
    description?: string;
    price: number;
    features?: string[];
    duration?: number;
    isPopular?: boolean;
  }>;
}

// Package with complete supplier details (primary interface)
interface PackageWithSupplierDetails {
  // Package Details
  packageId: string;
  name: string;
  description: string;
  category: string; // Category is now at package level

  // Package Pricing
  price: {
    amount: number;
    currency: string;
    pricingType: string;
    minPrice?: number;
    maxPrice?: number;
  };

  // Package Features
  features: string[];
  duration?: number;
  isPopular: boolean;

  // Package Rating & Reviews
  rating: {
    average: number;
    count: number;
    totalReviews: number;
  };

  // Package Availability
  availability: {
    startDate?: string;
    endDate?: string;
    workingHours?: {
      [key: string]: {
        start: string;
        end: string;
        available: boolean;
      };
    };
    leadTime?: number;
  };

  // Package Media & Portfolio
  image?: string;
  portfolio: Array<{
    title: string;
    description: string;
    image: string;
    eventType: string;
    date: string;
  }>;

  // Package Status
  available: boolean;
  featured: boolean;
  views: number;

  // Complete Supplier Details
  supplier: {
    // Basic Info
    supplierId: string;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
    isVerified: boolean;
    memberSince: string;

    // Company Details
    companyName?: string;
    description?: string;
    businessLicense?: string;
    experience?: string;
    categories: string[]; // Categories that supplier offers packages in

    // Supplier Rating
    rating: {
      average: number;
      count: number;
    };

    // Location Details
    location: {
      city: string;
      address?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      serviceRadius?: number;
    };

    // Additional Supplier Info
    portfolio: Array<{
      title?: string;
      description?: string;
      image?: string;
      eventType?: string;
      date?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      expiryDate?: string;
    }>;
    languages: string[];
    paymentMethods: string[];

    // Business Hours
    businessHours: {
      [key: string]: {
        start: string;
        end: string;
        available: boolean;
      };
    };
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface PackagesWithSuppliersResponse {
  success: boolean;
  message: string;
  data: PackageWithSupplierDetails[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    category?: string;
    city?: string;
    maxPrice?: number;
    minPrice?: number;
    search?: string;
    minRating?: number;
  };
}

// Legacy interfaces (for backward compatibility)
// @deprecated - Use PackageWithSupplierDetails instead
interface ServiceWithSupplierDetails extends Omit<PackageWithSupplierDetails, 'packageId' | 'name' | 'features'> {
  serviceId: string; // Maps to packageId
  title: string; // Maps to name
  packages: Array<{
    _id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    duration?: number;
    isPopular: boolean;
  }>;
}

// @deprecated - Use PackagesWithSuppliersResponse instead
interface ServicesWithSuppliersResponse {
  success: boolean;
  message: string;
  data: ServiceWithSupplierDetails[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    category?: string;
    city?: string;
    maxPrice?: number;
    minPrice?: number;
    search?: string;
    minRating?: number;
  };
}

interface OrderData {
  eventId: string;
  packageId: string; // Changed from serviceId
  quantity?: number;
  [key: string]: unknown;
}

interface TicketData {
  eventId: string;
  [key: string]: unknown;
}

// Package with supplier information
interface PackageWithSupplier {
  package: {
    _id: string;
    name: string;
    description?: string;
    category: string;
    price: {
      amount: number;
      currency: string;
      pricingType: string;
    };
    features: string[];
    duration?: number;
    isPopular?: boolean;
    image?: string;
  };
  supplier: {
    _id: string;
    name: string;
    profileImage?: string;
    rating: {
      average: number;
      count: number;
    };
    location: {
      city: string;
      state: string;
    };
    isVerified: boolean;
  };
}

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages?: number;
    hasMore?: boolean;
  };
  [key: string]: unknown;
}

// Backend-specific response interface that matches your API exactly
interface BackendEventsResponse {
  success: boolean;
  data: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${config.BACKEND_URL}/api`;
  }

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        // Only set Content-Type if body is not FormData
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      credentials: "omit",
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      console.log("response -> ", response);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        const error = new Error(
          JSON.stringify({
            message:
              errorData.message ||
              `Request failed with status ${response.status}`,
            errorType: errorData.errorType,
            status: response.status,
            statusText: response.statusText,
          })
        );

        throw error;
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: UserData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Supplier registration with services (packages are now optional and created in dashboard)
  async registerSupplier(supplierData: {
    name: string;
    email: string;
    password: string;
    description?: string;
    services: Array<{
      category: string;
      packages?: Array<{
        title: string;
        description: string;
        rate: number;
        currency: string;
        type: string;
      }>;
    }>;
    location: {
      city: string;
      country?: string;
    };
    yearsOfExperience: number;
    phone?: string;
    website?: string;
    portfolio?: string[];
  }) {
    return this.request("/supplier-registration/register", {
      method: "POST",
      body: JSON.stringify(supplierData),
    });
  }

  // Get available service categories
  async getServiceCategories() {
    return this.request("/supplier-registration/service-categories");
  }

  // Get registration status
  async getRegistrationStatus(email: string) {
    return this.request(`/supplier-registration/status/${email}`);
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  // User endpoints
  // Get current user profile
  async getProfile(): Promise<ApiResponse<{ user: unknown }>> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

 
  // Event endpoints
  async getEvents(params?: { limit?: number; sort?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    return this.request(`/events?${queryParams}`);
  }

  async createEvent(formData: FormData) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Creating event with data:", formData);

    return this.request("/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type': 'application/json',
        // 'Content-Type': 'multipart/form-data'
      },
      body: formData,
    });
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`);
  }

  async updateEvent(
    id: string,
    eventData: EventData | Record<string, unknown>
  ) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Updating event with data:", eventData);

    return this.request(`/events/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Deleting event with ID:", id);

    return this.request(`/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }

  async updateTicketTemplate(eventId: string, ticketId: string, template: any) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Updating ticket template:", { eventId, ticketId, template });

    return this.request(`/events/${eventId}/tickets/${ticketId}/template`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pdfTemplate: template }),
    });
  }

  // Get producer's events
  async getProducerEvents(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    return this.request(`/events/producer/me?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Get producer's events with enhanced data using /my-events endpoint
  async getMyEvents(params?: MyEventsParams): Promise<MyEventsResponse> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();

    // Add pagination parameters
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    // Add filter parameters
    if (
      params?.status &&
      params.status.trim() !== "" &&
      params.status !== "all"
    ) {
      queryParams.append("status", params.status);
    }

    if (
      params?.category &&
      params.category.trim() !== "" &&
      params.category !== "all"
    ) {
      queryParams.append("category", params.category);
    }

    if (params?.search && params.search.trim() !== "") {
      queryParams.append("search", params.search);
    }

    // Add sorting parameters
    if (params?.sortBy && params.sortBy.trim() !== "") {
      queryParams.append("sortBy", params.sortBy);
    }

    if (params?.sortOrder && params.sortOrder.trim() !== "") {
      queryParams.append("sortOrder", params.sortOrder);
    }

    // Add date range filters
    if (params?.startDate && params.startDate.trim() !== "") {
      queryParams.append("startDate", params.startDate);
    }

    if (params?.endDate && params.endDate.trim() !== "") {
      queryParams.append("endDate", params.endDate);
    }

    console.log("🔍 API Call - getMyEvents params:", {
      queryString: queryParams.toString(),
      originalParams: params,
    });

    const response = await fetch(
      `${this.baseURL}/events/my-events?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const error = new Error(
        JSON.stringify({
          message:
            errorData.message ||
            `Request failed with status ${response.status}`,
          errorType: errorData.errorType,
          status: response.status,
          statusText: response.statusText,
        })
      );

      throw error;
    }

    return (await response.json()) as MyEventsResponse;
  }

  // Get all events with comprehensive filtering (updated to handle backend response properly)
  async getAllEvents(params?: {
    page?: number;
    limit?: number;
    category?: string;
    city?: string;
    language?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    isPublic?: boolean;
    featured?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    hasAvailableTickets?: boolean;
    supplierId?: string | string[]; // Support both single and multiple supplier IDs
    includePastEvents?: boolean; // Include past events (for admin dashboard)
  }): Promise<BackendEventsResponse> {
    const queryParams = new URLSearchParams();

    // Build query parameters based on the provided API logic
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.city) queryParams.append("city", params.city);
    if (params?.language) queryParams.append("language", params.language);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    // Remove default status filter - let backend show all events by default
    if (params?.status) queryParams.append("status", params.status);
    if (params?.isPublic !== undefined)
      queryParams.append("isPublic", params.isPublic.toString());
    if (params?.featured !== undefined)
      queryParams.append("featured", params.featured.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.hasAvailableTickets !== undefined)
      queryParams.append(
        "hasAvailableTickets",
        params.hasAvailableTickets.toString()
      );
    if (params?.includePastEvents !== undefined)
      queryParams.append("includePastEvents", params.includePastEvents.toString());

    // Handle supplierId parameter - support both single string and array of strings
    if (params?.supplierId) {
      if (Array.isArray(params.supplierId)) {
        // If it's an array, add each supplierId as a separate parameter
        params.supplierId.forEach((id) => {
          if (id && id.trim()) {
            queryParams.append("supplierId", id);
          }
        });
      } else {
        // If it's a single string, add it directly
        if (params.supplierId.trim()) {
          queryParams.append("supplierId", params.supplierId);
        }
      }
    }

    console.log("🔍 API Call - getAllEvents params:", {
      queryString: queryParams.toString(),
      originalParams: params,
    });

    try {
      const url = `${this.baseURL}/events?${queryParams}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "omit",
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        // Create a more detailed error
        const error = new Error(
          JSON.stringify({
            message:
              errorData.message ||
              `Request failed with status ${response.status}`,
            errorType: errorData.errorType,
            status: response.status,
            statusText: response.statusText,
          })
        );

        throw error;
      }

      const responseData = (await response.json()) as BackendEventsResponse;

      console.log("✅ API Response - getAllEvents:", {
        success: responseData.success,
        dataLength: responseData.data?.length || 0,
        pagination: responseData.pagination,
      });

      return responseData;
    } catch (error) {
      console.error("❌ API Error - getAllEvents:", error);
      throw error;
    }
  }

  // Get events filtered by supplier's service IDs using dedicated backend endpoint
  async getEventsForSupplier(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      category?: string;
      city?: string;
      status?: string; // Event status
      search?: string;
      sortBy?: string;
      includePastEvents?: boolean; // Include past events
    }
  ) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();

    // Add pagination parameters
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    // Add filter parameters - only include non-empty values
    if (
      params?.category &&
      params.category.trim() !== "" &&
      params.category !== "all"
    ) {
      queryParams.append("category", params.category);
    }

    if (params?.city && params.city.trim() !== "") {
      queryParams.append("city", params.city);
    }

    // Event status filter
    if (
      params?.status &&
      params.status.trim() !== "" &&
      params.status !== "all"
    ) {
      queryParams.append("status", params.status);
    }

    // Search parameter
    if (params?.search && params.search.trim() !== "") {
      queryParams.append("search", params.search);
    }

    // Sort parameter
    if (params?.sortBy && params.sortBy.trim() !== "") {
      queryParams.append("sortBy", params.sortBy);
    }

    // Include past events parameter
    if (params?.includePastEvents !== undefined) {
      queryParams.append("includePastEvents", params.includePastEvents.toString());
    }

    console.log("🔍 API Call - getEventsForSupplier params:", {
      userId,
      queryString: queryParams.toString(),
      originalParams: params,
    });

    return this.request(`/events/supplier/${userId}?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Get supplier's orders using the new backend endpoint
  async getSupplierOrders() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/orders", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Service endpoints - Using existing backend /services routes
  async getServices(params?: {
    page?: number;
    limit?: number;
    category?: string;
    city?: string;
    maxPrice?: number;
    minPrice?: number;
    search?: string;
    tags?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.city) queryParams.append("city", params.city);
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.tags) queryParams.append("tags", params.tags);

    return this.request(`/services?${queryParams}`);
  }

  async getServicesWithSuppliers(params?: {
    page?: number;
    limit?: number;
    category?: string;
    city?: string;
    maxPrice?: number;
    minPrice?: number;
    search?: string;
    minRating?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.city) queryParams.append("city", params.city);
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.minRating)
      queryParams.append("minRating", params.minRating.toString());

    return this.request(`/services/with-suppliers?${queryParams}`);
  }

  // New Package API methods
  async getMyPackages(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    return this.request(`/packages/supplier/me?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createPackage(packageData: PackageData & { image?: File }) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Creating package with data:", packageData);

    // Use FormData if image is provided
    if (packageData.image) {
      const formData = new FormData();
      formData.append("name", packageData.name);
      formData.append("description", packageData.description || "");
      formData.append("category", packageData.category);
      formData.append("price", JSON.stringify(packageData.price));
      if (packageData.features) {
        formData.append("features", JSON.stringify(packageData.features));
      }
      if (packageData.duration !== undefined) {
        formData.append("duration", packageData.duration.toString());
      }
      formData.append("isPopular", packageData.isPopular ? "true" : "false");
      if (packageData.featured !== undefined) {
        formData.append("featured", packageData.featured ? "true" : "false");
      }
      if (packageData.availability) {
        formData.append("availability", JSON.stringify(packageData.availability));
      }
      formData.append("image", packageData.image);

      return this.request("/packages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    }

    return this.request("/packages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packageData),
    });
  }

  async updatePackage(id: string, packageData: Partial<PackageData> & { image?: File | null }) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Updating package with data:", packageData);

    // Use FormData if image is provided or being removed
    if (packageData.image !== undefined) {
      const formData = new FormData();
      if (packageData.name) formData.append("name", packageData.name);
      if (packageData.description) formData.append("description", packageData.description);
      if (packageData.category) formData.append("category", packageData.category);
      if (packageData.price) formData.append("price", JSON.stringify(packageData.price));
      if (packageData.duration !== undefined) {
        formData.append("duration", packageData.duration.toString());
      }
      if (packageData.isPopular !== undefined) {
        formData.append("isPopular", packageData.isPopular ? "true" : "false");
      }
      if (packageData.featured !== undefined) {
        formData.append("featured", packageData.featured ? "true" : "false");
      }
      if (packageData.availability) {
        formData.append("availability", JSON.stringify(packageData.availability));
      }

      // Handle image: File for new image, null/empty string for removal
      if (packageData.image === null) {
        formData.append("image", ""); // Empty string signals removal
      } else if (packageData.image) {
        formData.append("image", packageData.image);
      }

      return this.request(`/packages/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    }

    return this.request(`/packages/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packageData),
    });
  }

  async deletePackage(id: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/packages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }

  async togglePackageAvailability(id: string, isAvailable: boolean) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Toggling package availability:", { id, isAvailable });

    return this.request(`/packages/${id}/availability`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isAvailable }),
    });
  }

  async addPackageReview(packageId: string, rating: number, comment?: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/packages/${packageId}/reviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, comment }),
    });
  }

  async getPackagesWithSuppliers(params?: {
    category?: string;
    city?: string;
    maxPrice?: number;
    minPrice?: number;
    search?: string;
    limit?: number;
    page?: number;
    minRating?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.city) queryParams.append("city", params.city);
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.minRating)
      queryParams.append("minRating", params.minRating.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    return this.request(`/packages/with-suppliers?${queryParams}`);
  }

  // Legacy service methods (backward compatibility)
  async getMyServices(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) {
    console.warn("getMyServices is deprecated. Use getMyPackages() instead.");
    return this.getMyPackages(params);
  }

  async getService(id: string) {
    console.warn("getService is deprecated. Use getPackage() instead.");
    return this.request(`/packages/${id}`);
  }

  async createService(serviceData: ServiceData) {
    console.warn("createService is deprecated. Use createPackage() instead.");
    // Map service fields to package fields
    const packageData = {
      name: serviceData.title || '',
      description: serviceData.description || '',
      category: serviceData.category || '',
      price: serviceData.price || { amount: 0, currency: 'ILS', pricingType: 'fixed' },
      features: serviceData.features || [],
      duration: serviceData.duration,
      isPopular: serviceData.isPopular || false,
      featured: serviceData.featured
    };
    return this.createPackage(packageData as PackageData & { image?: File });
  }

  async updateService(id: string, serviceData: Partial<ServiceData>) {
    console.warn("updateService is deprecated. Use updatePackage() instead.");
    // Map service fields to package fields
    const packageData: Record<string, unknown> = {};
    if (serviceData.title) packageData.name = serviceData.title;
    if (serviceData.description) packageData.description = serviceData.description;
    if (serviceData.category) packageData.category = serviceData.category;
    if (serviceData.price) packageData.price = serviceData.price;
    if (serviceData.features) packageData.features = serviceData.features;
    if (serviceData.duration !== undefined) packageData.duration = serviceData.duration;
    if (serviceData.isPopular !== undefined) packageData.isPopular = serviceData.isPopular;
    if (serviceData.featured !== undefined) packageData.featured = serviceData.featured;

    return this.updatePackage(id, packageData as Partial<PackageData> & { image?: File });
  }

  async deleteService(id: string) {
    console.warn("deleteService is deprecated. Use deletePackage() instead.");
    return this.deletePackage(id);
  }

  async toggleServiceAvailability(id: string, isAvailable: boolean) {
    console.warn("toggleServiceAvailability is deprecated. Use togglePackageAvailability() instead.");
    return this.togglePackageAvailability(id, isAvailable);
  }

  // Legacy nested package management endpoints (DEPRECATED - packages are now top-level)
  // @deprecated - These were for managing packages within services. Now packages are standalone.
  async getServicePackages(serviceId: string) {
    // This endpoint is deprecated - packages are no longer nested under services
    console.warn("getServicePackages is deprecated. Use getMyPackages() instead.");
    return this.request(`/services/${serviceId}/packages`);
  }

  // @deprecated
  async addPackageToService(
    serviceId: string,
    packageData: PackageData & { image?: File }
  ) {
    console.warn("addPackageToService is deprecated. Use createPackage() instead.");
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const formData = new FormData();
    formData.append("name", packageData.name);
    formData.append("description", packageData.description || "");
    formData.append("price", JSON.stringify(packageData.price));
    formData.append("category", packageData.category);
    formData.append("duration", (packageData.duration ?? 0).toString());
    formData.append("isPopular", packageData.isPopular ? "true" : "false");

    packageData.features?.forEach((f) => formData.append("features[]", f));

    if (packageData.image) {
      formData.append("image", packageData.image);
    }

    return this.request(`/services/${serviceId}/packages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  }

  // @deprecated
  async updateServicePackage(
    serviceId: string,
    packageId: string,
    packageData: PackageData & { image?: File }
  ) {
    console.warn("updateServicePackage is deprecated. Use updatePackage() instead.");
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const formData = new FormData();
    formData.append("name", packageData.name);
    formData.append("description", packageData.description || "");
    formData.append("price", JSON.stringify(packageData.price));
    formData.append("category", packageData.category);
    formData.append("duration", (packageData.duration ?? 0).toString());
    formData.append("isPopular", packageData.isPopular ? "true" : "false");

    packageData.features?.forEach((f) => formData.append("features[]", f));
    if (packageData.image) {
      formData.append("image", packageData.image);
    }

    return this.request(`/services/${serviceId}/packages/${packageId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  }

  // @deprecated
  async deleteServicePackage(serviceId: string, packageId: string) {
    console.warn("deleteServicePackage is deprecated. Use deletePackage() instead.");
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/services/${serviceId}/packages/${packageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }

  // @deprecated - Use addPackageReview instead
  async addServiceReview(serviceId: string, rating: number, comment?: string) {
    console.warn("addServiceReview is deprecated. Use addPackageReview() instead.");
    return this.addPackageReview(serviceId, rating, comment);
  }

  // Order endpoints
  async getOrders() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/orders", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getMyOrderStats() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/orders/stats/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createOrder(orderData: OrderData) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/orders/${orderId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  }

  // Admin order management
  async getAllOrders(params?: { limit?: number; sort?: string }) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    return this.request(`/admin/orders?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Ticket endpoints
  async getTickets() {
    return this.request("/tickets");
  }

  async createTicket(ticketData: TicketData) {
    return this.request("/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
  }

  // Admin endpoints
  async getAdminStats() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/admin/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUserStats(params?: { startDate?: string; endDate?: string }) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    return this.request(`/admin/users/stats?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUsers(params?: {
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
    role?: string;
  }) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.role) queryParams.append("role", params.role);

    return this.request(`/admin/users?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUserVerification(
    userId: string,
    status: "approved" | "rejected"
  ) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const bodyData = {
      isVerified: status === "approved",
      verificationStatus: status === "approved" ? "approved" : "rejected",
    };

    console.log("Sending request with body:", bodyData); // Add this for debugging

    return this.request(`/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Make sure this is set correctly
      },
      body: JSON.stringify(bodyData),
    });
  }

  async getPendingVerifications() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/admin/users?status=unverified&limit=1000", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUser(userId: string, userData: Partial<UserData>) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  }

  async createUser(userData: UserData) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/admin/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Chat endpoints
  async getChats(eventId?: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (eventId) queryParams.append("eventId", eventId);

    return this.request(`/chats?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getEventChats(eventId: string, page = 1, limit = 50) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/chats/event/${eventId}?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getChatDetails(chatId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/chats/${chatId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createChat(
    participants: Array<{ userId: string; role: string }>,
    eventId?: string,
    title?: string
  ) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const requestBody = {
      participants,
      eventId,
      title,
    };

    console.log(
      "🔵 createChat API - Request body:",
      JSON.stringify(requestBody, null, 2)
    );
    console.log("🔵 createChat API - Participants array:", participants);
    console.log(
      "🔵 createChat API - Participants length:",
      participants?.length
    );

    return this.request("/chats", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  }

  async updateChatSettings(
    chatId: string,
    settings: {
      allowFileSharing?: boolean;
      notifications?: boolean;
      title?: string;
    }
  ) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/chats/${chatId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
  }

  async getChatMessages(chatId: string, page = 1, limit = 25) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(
      `/chats/${chatId}/messages?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async sendChatMessage(
    chatId: string,
    messageData: {
      content: string;
      type?: "text" | "image" | "file" | "system";
      replyTo?: string;
      attachments?: Array<{
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
        thumbnailUrl?: string;
      }>;
    }
  ) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });
  }

  async editChatMessage(messageId: string, content: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/messages/${messageId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
  }

  async deleteChatMessage(messageId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async addMessageReaction(messageId: string, emoji: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/messages/${messageId}/reactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ emoji }),
    });
  }

  async removeMessageReaction(messageId: string, emoji: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/messages/${messageId}/reactions`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ emoji }),
    });
  }

  async markChatAsRead(chatId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/chats/${chatId}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async addParticipant(chatId: string, userId: string, role: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/chats/${chatId}/participants`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, role }),
    });
  }

  async removeParticipant(chatId: string, userId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/chats/${chatId}/participants/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async archiveChat(chatId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/chats/${chatId}/archive`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async uploadChatFile(file: File, onProgress?: (progress: number) => void) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("file", file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", `${this.baseURL}/upload/chat-file`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  async getInitialUsers(limit = 25) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/users/search?limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async searchUsers(searchTerm: string, limit = 20) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(
      `/users/search?search=${encodeURIComponent(searchTerm)}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async getAllChatsForAdmin(page = 1, limit = 100) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/chats/admin/all?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Supplier event status update
  async updateSupplierEventStatus(
    eventId: string,
    supplierId: string,
    packageId: string, // Changed from serviceId
    status: "approved" | "rejected"
  ) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/events/${eventId}/supplier-status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supplierId,
        packageId, // Changed from serviceId
        status,
      }),
    });
  }

  // Get user by ID (for supplier details)
  async getUserById(userId: string) {
    return this.request(`/users/${userId}`);
  }

  // Get supplier by ID with packages
  async getSupplierById(supplierId: string) {
    return this.request(`/suppliers/${supplierId}`);
  }

  // Review methods
  async submitSupplierReview(supplierId: string, reviewData: {
    rating: number;
    feedback?: string;
    orderId?: string;
  }) {
    return this.request(`/suppliers/${supplierId}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }

  async getSupplierReviews(supplierId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    return this.request(`/suppliers/${supplierId}/reviews${queryString ? `?${queryString}` : ""}`);
  }

  async updateSupplierReview(supplierId: string, reviewId: string, reviewData: {
    rating?: number;
    feedback?: string;
  }) {
    return this.request(`/suppliers/${supplierId}/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  }

  async deleteSupplierReview(supplierId: string, reviewId: string) {
    return this.request(`/suppliers/${supplierId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
  }

  // Attendee registration (Public - No auth required)
  async registerAttendee(registrationData: {
    eventId: string;
    tickets: Array<{
      ticketId: string;
      quantity: number;
    }>;
    attendeeInfo: {
      fullName: string;
      email: string;
      phone: string;
      age: number;
      gender: string;
    };
    specialRequirements?: string;
  }) {
    return this.request("/attendees/register", {
      method: "POST",
      body: JSON.stringify(registrationData),
    });
  }

  // Payment methods
  async initiatePayment(paymentData: {
    eventId: string;
    tickets: Array<{
      ticketId: string;
      quantity: number;
    }>;
    attendeeInfo: {
      fullName: string;
      email: string;
      phone: string;
    };
    bookingReference: string;
  }) {
    return this.request("/payments/initiate", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(transactionId: string) {
    return this.request(`/payments/verify/${transactionId}`, {
      method: "GET",
    });
  }

  async refundPayment(refundData: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }) {
    return this.request("/payments/refund", {
      method: "POST",
      body: JSON.stringify(refundData),
    });
  }

  async uploadProfileImage(file: File) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    return this.request("/users/me/profile-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // No Content-Type header - browser will set it with boundary for multipart/form-data
      },
      body: formData,
    });
  }


  async updateProfile(profileData: {
  name?: string;
  phone?: string;
  language?: string;
  producerDetails?: any;
  supplierDetails?: any;
  profileImage?: string;
}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return this.request('/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData),
  });
}

  // Get attendees for an event (Producer only)
  async getEventAttendees(
    eventId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      ticketType?: string;
      checkedIn?: boolean;
    }
  ) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.ticketType) queryParams.append("ticketType", params.ticketType);
    if (params?.checkedIn !== undefined)
      queryParams.append("checkedIn", params.checkedIn.toString());

    const queryString = queryParams.toString();
    const url = `/attendees/event/${eventId}${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Verify event password for private events
  async verifyEventPassword(eventId: string, password: string) {
    return this.request(`/events/${eventId}/verify-password`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }

  // QR Code scanning methods
  async verifyQR(qrCode: string): Promise<ApiResponse<any>> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request('/attendees/verify-qr', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrCode: qrCode.trim() })
    });
  }

  async checkInTicket(attendeeId: string, ticketId: string): Promise<ApiResponse<any>> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/attendees/${attendeeId}/tickets/${ticketId}/check-in`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async checkInAllTickets(attendeeId: string): Promise<ApiResponse<any>> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/attendees/${attendeeId}/check-in-remaining`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getEventStatistics(eventId: string): Promise<ApiResponse<any>> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request(`/attendees/event/${eventId}/statistics`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

const apiService = new ApiService();
export { apiService };
export default apiService;
export type {
  // Primary Package types
  Package,
  PackageData,
  PackageWithId,
  PackageWithSupplier,
  PackageWithSupplierDetails,
  PackagesWithSuppliersResponse,
  // Legacy Service types (deprecated)
  Service,
  ServiceData,
  ServiceWithSupplierDetails,
  ServicesWithSuppliersResponse,
  // Event types
  Event,
  EventData,
  EnhancedEvent,
  MyEventsResponse,
  MyEventsParams,
  // Stats types
  OverallStats,
  SupplierStats,
  FinancialSummary,
  StatusIndicators,
  GroupedSupplier,
  EnhancedSupplier,
  // Order types
  OrderData,
};
