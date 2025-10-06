import config from '../config/environment';

// Type definitions
interface LoginCredentials {
  email: string;
  password: string;
}

interface UserData {
  name?: string;
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
  language?: 'he' | 'en' | 'ar';
  category: string;
  requiredServices?: string[];
  suppliers?: Array<{
    supplierId: string;
    services: Array<{
      serviceId: string;
      requestedPrice?: number;
      notes?: string;
      priority?: 'low' | 'medium' | 'high';
    }>;
  }>;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
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
  language?: 'he' | 'en' | 'ar';
  category: string;
  requiredServices?: string[];
  suppliers?: Array<{
    supplierId: {
      _id: string;
      name: string;
      companyName?: string;
      profileImage?: string;
      isActive: boolean;
    };
    serviceId: string;
    requestedPrice?: number;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'approved' | 'rejected';
  }>;
  producerId: {
    _id: string;
    name: string;
    companyName?: string;
    profileImage?: string;
  };
  status: 'draft' | 'approved' | 'rejected' | 'completed';
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
  serviceId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images?: string[];
    availability: Record<string, unknown>;
    location: Record<string, unknown>;
  };
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedPrice?: number;
  finalPrice?: number;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  requestedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  messages?: Record<string, unknown>[];
}

interface SupplierStats {
  totalSuppliers: number;
  totalServices: number;
  approvedServices: number;
  pendingServices: number;
  rejectedServices: number;
  cancelledServices: number;
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
  services: Array<{
    service: {
      _id: string;
      name: string;
      description: string;
      price: number;
      category: string;
      images?: string[];
      availability: Record<string, unknown>;
      location: Record<string, unknown>;
    };
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    requestedPrice?: number;
    finalPrice?: number;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
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
  language?: 'he' | 'en' | 'ar';
  category: string;
  requiredServices?: string[];
  producerId: {
    _id: string;
    name: string;
    companyName?: string;
    profileImage?: string;
  };
  status: 'draft' | 'approved' | 'rejected' | 'completed';
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
  totalServices: number;
  totalApprovedServices: number;
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
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

interface ServiceData {
  title: string;
  description: string;
  category: string;
  subcategories?: string[];
  price: {
    amount: number;
    currency: string;
    pricingType: string;
    minPrice?: number;
    maxPrice?: number;
  };
  packages?: Array<{
    name: string;
    description?: string;
    price: number;
    features?: string[];
    duration?: number;
    isPopular?: boolean;
  }>;
  image?: string;
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
  location: {
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    serviceRadius?: number;
  };
  experience?: string;
  tags?: string[];
  featured?: boolean;
  [key: string]: unknown;
}

interface PackageData {
  name: string;
  description?: string;
  price: number;
  features?: string[];
  duration?: number;
  isPopular?: boolean;
}

interface PackageWithId extends PackageData {
  _id: string;
}

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategories?: string[];
  price: {
    amount: number;
    currency: string;
    pricingType: string;
    minPrice?: number;
    maxPrice?: number;
  };
  packages?: Array<{
    _id: string;
    name: string;
    description?: string;
    price: number;
    features?: string[];
    duration?: number;
    isPopular?: boolean;
  }>;
  image?: string;
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
  location: {
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    serviceRadius?: number;
  };
  experience?: string;
  tags?: string[];
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

// Comprehensive interfaces for the new /with-suppliers API endpoint
interface ServiceWithSupplierDetails {
  // Service Details
  serviceId: string;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  tags: string[];
  
  // Service Pricing
  price: {
    amount: number;
    currency: string;
    pricingType: string;
    minPrice?: number;
    maxPrice?: number;
  };
  
  // Service Packages (Complete Details)
  packages: Array<{
    _id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    duration?: number;
    isPopular: boolean;
  }>;
  
  // Service Rating & Reviews
  rating: {
    average: number;
    count: number;
    totalReviews: number;
  };
  
  // Service Location & Availability
  location: {
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    serviceRadius?: number;
  };
  
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
  
  // Service Media & Portfolio
  image?: string;
  portfolio: Array<{
    title: string;
    description: string;
    image: string;
    eventType: string;
    date: string;
  }>;
  
  // Service Status
  available: boolean;
  featured: boolean;
  views: number;
  experience?: string;
  
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
    categories: string[];
    
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
  serviceId: string;
  quantity?: number;
  [key: string]: unknown;
}

interface TicketData {
  eventId: string;
  [key: string]: unknown;
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

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'omit',
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      console.log("response -> ",response);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        // Create a more detailed error
        const error = new Error(JSON.stringify({
          message: errorData.message || `Request failed with status ${response.status}`,
          errorType: errorData.errorType,
          status: response.status,
          statusText: response.statusText
        }));
        
        throw error;
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: UserData) {
    return this.request('/auth/register', {
      method: 'POST',
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
    return this.request('/supplier-registration/register', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  // Get available service categories
  async getServiceCategories() {
    return this.request('/supplier-registration/service-categories');
  }

  // Get registration status
  async getRegistrationStatus(email: string) {
    return this.request(`/supplier-registration/status/${email}`);
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // User endpoints
  // Get current user profile
  async getProfile(): Promise<ApiResponse<{ user: unknown }>> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async updateProfile(userData: UserData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Event endpoints
  async getEvents(params?: { limit?: number; sort?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    return this.request(`/events?${queryParams}`);
  }

  async createEvent(eventData: EventData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Creating event with data:', eventData);
    
    return this.request('/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData),
    });
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`);
  }

  async updateEvent(id: string, eventData: EventData | Record<string, unknown>) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Updating event with data:', eventData);
    
    return this.request(`/events/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Deleting event with ID:', id);
    
    return this.request(`/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Get producer's events
  async getProducerEvents(params?: { page?: number; limit?: number; status?: string }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    return this.request(`/events/producer/me?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Get producer's events with enhanced data using /my-events endpoint
  async getMyEvents(params?: MyEventsParams): Promise<MyEventsResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    // Add filter parameters
    if (params?.status && params.status.trim() !== '' && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    
    if (params?.category && params.category.trim() !== '' && params.category !== 'all') {
      queryParams.append('category', params.category);
    }
    
    if (params?.search && params.search.trim() !== '') {
      queryParams.append('search', params.search);
    }
    
    // Add sorting parameters
    if (params?.sortBy && params.sortBy.trim() !== '') {
      queryParams.append('sortBy', params.sortBy);
    }
    
    if (params?.sortOrder && params.sortOrder.trim() !== '') {
      queryParams.append('sortOrder', params.sortOrder);
    }
    
    // Add date range filters
    if (params?.startDate && params.startDate.trim() !== '') {
      queryParams.append('startDate', params.startDate);
    }
    
    if (params?.endDate && params.endDate.trim() !== '') {
      queryParams.append('endDate', params.endDate);
    }

    console.log('🔍 API Call - getMyEvents params:', {
      queryString: queryParams.toString(),
      originalParams: params
    });
    
    const response = await fetch(`${this.baseURL}/events/my-events?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const error = new Error(JSON.stringify({
        message: errorData.message || `Request failed with status ${response.status}`,
        errorType: errorData.errorType,
        status: response.status,
        statusText: response.statusText
      }));
      
      throw error;
    }

    return await response.json() as MyEventsResponse;
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
    supplierId?: string | string[];   // Support both single and multiple supplier IDs
  }): Promise<BackendEventsResponse> {
    const queryParams = new URLSearchParams();
    
    // Build query parameters based on the provided API logic
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.language) queryParams.append('language', params.language);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    // Remove default status filter - let backend show all events by default
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isPublic !== undefined) queryParams.append('isPublic', params.isPublic.toString());
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.hasAvailableTickets !== undefined) queryParams.append('hasAvailableTickets', params.hasAvailableTickets.toString());
    
    // Handle supplierId parameter - support both single string and array of strings
    if (params?.supplierId) {
      if (Array.isArray(params.supplierId)) {
        // If it's an array, add each supplierId as a separate parameter
        params.supplierId.forEach(id => {
          if (id && id.trim()) {
            queryParams.append('supplierId', id);
          }
        });
      } else {
        // If it's a single string, add it directly
        if (params.supplierId.trim()) {
          queryParams.append('supplierId', params.supplierId);
        }
      }
    }

    console.log('🔍 API Call - getAllEvents params:', {
      queryString: queryParams.toString(),
      originalParams: params
    });

    try {
      const url = `${this.baseURL}/events?${queryParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
      });
      
      if (!response.ok) {
        // Try to get error details from response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        // Create a more detailed error
        const error = new Error(JSON.stringify({
          message: errorData.message || `Request failed with status ${response.status}`,
          errorType: errorData.errorType,
          status: response.status,
          statusText: response.statusText
        }));
        
        throw error;
      }
      
      const responseData = await response.json() as BackendEventsResponse;
      
      console.log('✅ API Response - getAllEvents:', {
        success: responseData.success,
        dataLength: responseData.data?.length || 0,
        pagination: responseData.pagination
      });
      
      return responseData;
    } catch (error) {
      console.error('❌ API Error - getAllEvents:', error);
      throw error;
    }
  }

  // Get events filtered by supplier's service IDs using dedicated backend endpoint
  async getEventsForSupplier(userId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    city?: string;
    status?: string; // Event status
    search?: string;
    sortBy?: string;
  }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    // Add filter parameters - only include non-empty values
    if (params?.category && params.category.trim() !== '' && params.category !== 'all') {
      queryParams.append('category', params.category);
    }
    
    if (params?.city && params.city.trim() !== '') {
      queryParams.append('city', params.city);
    }
    
    // Event status filter
    if (params?.status && params.status.trim() !== '' && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    
    // Search parameter
    if (params?.search && params.search.trim() !== '') {
      queryParams.append('search', params.search);
    }
    
    // Sort parameter
    if (params?.sortBy && params.sortBy.trim() !== '') {
      queryParams.append('sortBy', params.sortBy);
    }

    console.log('🔍 API Call - getEventsForSupplier params:', {
      userId,
      queryString: queryParams.toString(),
      originalParams: params
    });
    
    return this.request(`/events/supplier/${userId}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Get supplier's orders using the new backend endpoint
  async getSupplierOrders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request('/orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Service endpoints
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
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) queryParams.append('tags', params.tags);
    
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
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
    
    return this.request(`/services/with-suppliers?${queryParams}`);
  }

  async getMyServices(params?: { page?: number; limit?: number; isActive?: boolean }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    return this.request(`/services/supplier/me?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getService(id: string) {
    return this.request(`/services/${id}`);
  }

  async createService(serviceData: ServiceData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Creating service with data:', serviceData);
    
    return this.request('/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(id: string, serviceData: Partial<ServiceData>) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Updating service with data:', serviceData);
    
    return this.request(`/services/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(id: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async toggleServiceAvailability(id: string, isAvailable: boolean) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Toggling service availability:', { id, isAvailable });
    
    return this.request(`/services/${id}/availability`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isAvailable }),
    });
  }

  // Package management endpoints
  async getServicePackages(serviceId: string) {
    return this.request(`/services/${serviceId}/packages`);
  }

  async addPackageToService(serviceId: string, packageData: PackageData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Adding package with data:', packageData);
    
    return this.request(`/services/${serviceId}/packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(packageData),
    });
  }

  async updateServicePackage(serviceId: string, packageId: string, packageData: PackageData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Updating package with data:', packageData);
    
    return this.request(`/services/${serviceId}/packages/${packageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(packageData),
    });
  }

  async deleteServicePackage(serviceId: string, packageId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/services/${serviceId}/packages/${packageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Service reviews
  async addServiceReview(serviceId: string, rating: number, comment?: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/services/${serviceId}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating, comment }),
    });
  }

  // Order endpoints
  async getOrders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request('/orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getMyOrderStats() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request('/orders/stats/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async createOrder(orderData: OrderData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request('/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    });
  }

  // Admin order management
  async getAllOrders(params?: { limit?: number; sort?: string }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    return this.request(`/admin/orders?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Ticket endpoints
  async getTickets() {
    return this.request('/tickets');
  }

  async createTicket(ticketData: TicketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  // Admin endpoints
  async getAdminStats() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request('/admin/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getUserStats(params?: { startDate?: string; endDate?: string }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    return this.request(`/admin/users/stats?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getUsers(params?: { limit?: number; sortBy?: string; sortOrder?: string; status?: string }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status) queryParams.append('status', params.status);
    
    return this.request(`/admin/users?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async updateUserVerification(userId: string, status: 'approved' | 'rejected') {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const bodyData = { 
      isVerified: status === 'approved',
      verificationStatus: status === 'approved' ? 'approved' : 'rejected'
    };

    console.log('Sending request with body:', bodyData); // Add this for debugging
    
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' // Make sure this is set correctly
      },
      body: JSON.stringify(bodyData)
    });
  }

  async getPendingVerifications() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request('/admin/users?status=unverified&limit=1000', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async updateUser(userId: string, userData: Partial<UserData>) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
  }

  async createUser(userData: UserData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request('/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(userId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Chat endpoints
  async getChats(eventId?: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams();
    if (eventId) queryParams.append('eventId', eventId);
    
    return this.request(`/chats?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async createChat(participants: Array<{ userId: string; role: string }>, eventId?: string, title?: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request('/chats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        participants,
        eventId,
        title
      })
    });
  }

  async getChatMessages(chatId: string, page = 1, limit = 25) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/chats/${chatId}/messages?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async markChatAsRead(chatId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/chats/${chatId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getInitialUsers(limit = 25) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/users/search?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async searchUsers(searchTerm: string, limit = 20) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/users/search?search=${encodeURIComponent(searchTerm)}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getAllChatsForAdmin(page = 1, limit = 100) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/chats/admin/all?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Supplier event status update
  async updateSupplierEventStatus(eventId: string, supplierId: string, serviceId: string, status: 'approved' | 'rejected') {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.request(`/events/${eventId}/supplier-status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        supplierId, 
        serviceId, 
        status 
      }),
    });
  }

  // Get user by ID (for supplier details)
  async getUserById(userId: string) {
    return this.request(`/users/${userId}`);
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
    return this.request('/attendees/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  // Get attendees for an event (Producer only)
  async getEventAttendees(eventId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    ticketType?: string;
    checkedIn?: boolean;
  }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.ticketType) queryParams.append('ticketType', params.ticketType);
    if (params?.checkedIn !== undefined) queryParams.append('checkedIn', params.checkedIn.toString());

    const queryString = queryParams.toString();
    const url = `/attendees/event/${eventId}${queryString ? `?${queryString}` : ''}`;

    return this.request(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Verify event password for private events
  async verifyEventPassword(eventId: string, password: string) {
    return this.request(`/events/${eventId}/verify-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

const apiService = new ApiService();
export { apiService };
export default apiService;
export type { 
  Service, 
  ServiceData, 
  PackageData, 
  Event, 
  EnhancedEvent, 
  MyEventsResponse, 
  MyEventsParams, 
  OverallStats,
  SupplierStats,
  FinancialSummary,
  StatusIndicators
};
