import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Building2, Store, ArrowLeft, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";

const predefinedServices = [
  {
    id: "photography",
    name: "Photography",
    packages: [
      { id: "photo-basic", title: "Basic Photo Package", description: "2-hour session, 50 edited photos", rate: "300" },
      { id: "photo-premium", title: "Premium Photo Package", description: "4-hour session, 100 edited photos, album", rate: "600" }
    ]
  },
  {
    id: "videography",
    name: "Videography",
    packages: [
      { id: "video-basic", title: "Basic Video Package", description: "2-hour filming, basic editing", rate: "500" },
      { id: "video-premium", title: "Premium Video Package", description: "Full day filming, professional editing", rate: "1200" }
    ]
  },
  {
    id: "catering",
    name: "Catering",
    packages: [
      { id: "catering-basic", title: "Basic Catering", description: "Buffet style, 3 courses", rate: "25" },
      { id: "catering-premium", title: "Premium Catering", description: "Plated service, 5 courses, waitstaff", rate: "60" }
    ]
  },
  {
    id: "decorations",
    name: "Decorations",
    packages: [
      { id: "decor-basic", title: "Basic Decoration", description: "Centerpieces and basic setup", rate: "200" },
      { id: "decor-premium", title: "Premium Decoration", description: "Full venue transformation", rate: "800" }
    ]
  },
  {
    id: "music-dj",
    name: "Music & DJ",
    packages: [
      { id: "dj-basic", title: "Basic DJ Package", description: "4-hour service, basic sound system", rate: "400" },
      { id: "dj-premium", title: "Premium DJ Package", description: "8-hour service, premium sound, lighting", rate: "800" }
    ]
  },
  {
    id: "venue",
    name: "Venue",
    packages: [
      { id: "venue-basic", title: "Basic Venue", description: "Hall rental, basic amenities", rate: "1000" },
      { id: "venue-premium", title: "Premium Venue", description: "Full service venue with catering kitchen", rate: "2500" }
    ]
  }
];

interface Package {
  id: string;
  title: string;
  description: string;
  rate: string;
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: string;
  supplierDetails?: {
    companyName: string;
    service: string;
    description: string;
    location: string;
    yearsOfExperience: string;
    packages: Package[];
  };
  producerDetails?: {
    companyName: string;
  };
  [key: string]: unknown;
}

export default function SignUp() {
  const { t } = useTranslation();
  const [userType, setUserType] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    description: "",
    location: "",
    yearsOfExperience: ""
  });
  const [availablePackages, setAvailablePackages] = useState<Package[]>([]);
  const [customPackages, setCustomPackages] = useState<Package[]>([]);
  const [newPackage, setNewPackage] = useState({ title: "", description: "", rate: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = predefinedServices.find(s => s.id === serviceId);
    if (service) {
      setAvailablePackages(service.packages);
    } else {
      setAvailablePackages([]);
    }
  };

  const handleAddCustomPackage = () => {
    if (newPackage.title && newPackage.description && newPackage.rate) {
      // Validate rate is positive
      const rate = parseFloat(newPackage.rate);
      if (rate <= 0) {
        toast({
          title: t('common.error'),
          description: t('auth.errors.positiveRate'),
          variant: "destructive",
        });
        return;
      }

      const packageToAdd: Package = {
        id: `custom-${Date.now()}`,
        title: newPackage.title,
        description: newPackage.description,
        rate: newPackage.rate
      };
      setCustomPackages(prev => [...prev, packageToAdd]);
      setNewPackage({ title: "", description: "", rate: "" });
      
      toast({
        title: t('auth.success.packageAdded'),
        description: t('auth.success.packageAddedSuccess'),
      });
    }
  };

  const handleRemoveCustomPackage = (id: string) => {
    setCustomPackages(prev => prev.filter(pkg => pkg.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.selectUserType'),
        variant: "destructive",
      });
      return;
    }

    if (userType === "supplier" && !selectedService) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.selectService'),
        variant: "destructive",
      });
      return;
    }

    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    // Validate all required fields
    if (!formData.fullName || !formData.email || !formData.password) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.fillRequiredFields'),
        variant: "destructive",
      });
      return;
    }

    const registrationData: RegistrationData = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: userType,
    };

    if (userType === 'supplier') {
      // Combine available packages and custom packages
      const allPackages = [...availablePackages, ...customPackages];
      
      registrationData.supplierDetails = {
        companyName: formData.company,
        service: selectedService,
        description: formData.description,
        location: formData.location,
        yearsOfExperience: formData.yearsOfExperience,
        packages: allPackages,
      };
    } else if (userType === 'producer') {
      registrationData.producerDetails = {
        companyName: formData.company,
      };
    }

    setIsSubmitting(true);

    try {
      await apiService.register(registrationData);

      toast({
        title: t('auth.success.registrationSubmitted'),
        description: t('auth.success.servicesApproved'),
        duration: 5000,
      });

      // Navigate to signin after showing success message
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('auth.errors.registrationFailed');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 ">
      <div className="w-full max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold text-gray-900">
              {t('auth.signUp.title')}
            </CardTitle>
            <p className="text-gray-600">
              {t('auth.signUp.subtitle')}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* User Type Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-900">
                  {t('auth.signUp.userType')}
                </Label>
                <RadioGroup value={userType} onValueChange={setUserType} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="producer" id="producer" className="peer sr-only" />
                    <Label
                      htmlFor="producer"
                      className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-6 hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-all"
                    >
                      <Building2 className="mb-3 h-8 w-8 text-gray-600" />
                      <span className="font-semibold text-gray-900">{t('auth.signUp.producer.title')}</span>
                      <span className="text-sm text-gray-500 text-center mt-1">
                        {t('auth.signUp.producer.description')}
                      </span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="supplier" id="supplier" className="peer sr-only" />
                    <Label
                      htmlFor="supplier"
                      className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-6 hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-all"
                    >
                      <Store className="mb-3 h-8 w-8 text-gray-600" />
                      <span className="font-semibold text-gray-900">{t('auth.signUp.supplier.title')}</span>
                      <span className="text-sm text-gray-500 text-center mt-1">
                        {t('auth.signUp.supplier.description')}
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {userType && (
                <>
                  {/* Basic Details Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">{t('auth.signUp.basicDetails')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                          {t('auth.name')} {t('auth.required')}
                        </Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          placeholder={t('auth.signUp.namePlaceholder')}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          {t('auth.email')} {t('auth.required')}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder={t('auth.signUp.emailPlaceholder')}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        {t('auth.password')} {t('auth.required')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder={t('auth.signUp.passwordPlaceholder')}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        {t('auth.confirmPassword')} {t('auth.required')}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Service Details for Suppliers */}
                  {userType === "supplier" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900">{t('auth.signUp.serviceDetails')}</h3>
                      
                      {/* Service Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">{t('auth.signUp.service')} {t('auth.required')}</Label>
                        <Select value={selectedService} onValueChange={handleServiceChange}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder={t('auth.signUp.selectService')} />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Service Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                          {t('auth.signUp.serviceDescription')}
                        </Label>
                        <div className="relative">
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder={t('auth.signUp.serviceDescriptionPlaceholder')}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-none"
                            maxLength={500}
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                            {formData.description.length} / 500
                          </div>
                        </div>
                      </div>

                   

                      {/* Custom Packages */}
                      {customPackages.length > 0 && (
                        <div className="space-y-4">
                          <Label className="text-sm font-medium text-gray-700">{t('auth.signUp.yourPackages')}</Label>
                          <div className="space-y-3">
                            {customPackages.map((pkg) => (
                              <div key={pkg.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                                    <p className="text-lg font-bold text-green-600 mt-2">${pkg.rate}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomPackage(pkg.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Custom Package */}
                      {selectedService && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">{t('auth.signUp.addCustomPackage')}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">{t('auth.signUp.packageTitle')} {t('auth.required')}</Label>
                              <Input
                                value={newPackage.title}
                                onChange={(e) => setNewPackage(prev => ({ ...prev, title: e.target.value }))}
                                placeholder={t('auth.signUp.packageTitlePlaceholder')}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">{t('auth.signUp.packageRate')} {t('auth.required')}</Label>
                              <Input
                                type="number"
                                min="1"
                                value={newPackage.rate}
                                onChange={(e) => setNewPackage(prev => ({ ...prev, rate: e.target.value }))}
                                placeholder={t('auth.signUp.packageRatePlaceholder')}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 mt-4">
                            <Label className="text-sm font-medium text-gray-700">{t('auth.signUp.packageDescription')} {t('auth.required')}</Label>
                            <Textarea
                              value={newPackage.description}
                              onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                              placeholder={t('auth.signUp.packageDescriptionPlaceholder')}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px] resize-none"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleAddCustomPackage}
                            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!newPackage.title || !newPackage.description || !newPackage.rate}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('auth.signUp.addPackage')}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other Details */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">{t('auth.signUp.otherDetails')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                          {t('auth.location')}
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          placeholder={t('auth.signUp.locationPlaceholder')}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {userType === "supplier" && (
                        <div className="space-y-2">
                          <Label htmlFor="yearsOfExperience" className="text-sm font-medium text-gray-700">
                            {t('auth.yearsOfExperience')}
                          </Label>
                          <Input
                            id="yearsOfExperience"
                            type="number"
                            min="0"
                            value={formData.yearsOfExperience}
                            onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                            placeholder={t('auth.signUp.experiencePlaceholder')}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {(userType === "supplier" || userType === "producer") && (
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                            {t('auth.company')} {t('auth.optional')}
                          </Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleInputChange("company", e.target.value)}
                            placeholder={t('auth.signUp.companyPlaceholder')}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {t('auth.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      disabled={!userType || (userType === "supplier" && !selectedService) || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t('auth.registering')}
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          {t('auth.register')}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link 
                  to="/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  {t('auth.signInHere')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
