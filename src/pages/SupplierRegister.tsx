import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  Upload,
  User,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import apiService from "@/services/api";

interface ServiceCategoryInfo {
  name: { en: string; he: string };
  description: { en: string; he: string };
}

const placeholderAvatars = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
];

export default function SupplierRegister() {
  const { t , i18n} = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'he';

  console.log("curr lang ---->",currentLanguage);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    phone: 0,
    website: "",
    location: {
      city: "",
      country: "",
    },
    yearsOfExperience: 0,
    profileImage: null as string | null,
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<
    Record<string, ServiceCategoryInfo>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoadingUser } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          profileImage: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceholderSelect = (avatarUrl: string) => {
    setFormData((prev) => ({ ...prev, profileImage: avatarUrl }));
    setShowAvatarPicker(false);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoadingUser && user) {
      const dashboardUrl =
        user.role === "supplier"
          ? "/supplier-dashboard"
          : "/producer-dashboard";
      navigate(dashboardUrl);
    }
  }, [user, isLoadingUser, navigate]);

  // Load service categories
  useEffect(() => {
    const loadServiceCategories = async () => {
      try {
        const response = await apiService.getServiceCategories();
        setAvailableCategories(
          response.data as Record<string, ServiceCategoryInfo>
        );
      } catch (error) {
        console.error("Failed to load service categories:", error);
        toast({
          title: t("common.error"),
          description: "Failed to load service categories",
          variant: "destructive",
        });
      }
    };

    loadServiceCategories();
  }, [toast]);

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const toggleServiceCategory = (categoryKey: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(categoryKey)) {
        return prev.filter((key) => key !== categoryKey);
      } else {
        return [...prev, categoryKey];
      }
    });
  };

  const removeServiceCategory = (categoryKey: string) => {
    setSelectedServices((prev) => prev.filter((key) => key !== categoryKey));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      toast({
        title: t("common.error"),
        description: t("auth.errors.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        title: t("common.error"),
        description: "Please select at least one service category",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert selected services to the format expected by the API
      const services = selectedServices.map((category) => ({
        category,
      }));

      const supplierData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        description: formData.description,
        services: services,
        location: formData.location,
        yearsOfExperience: formData.yearsOfExperience,
        phone: formData.phone ? String(formData.phone) : undefined,
        website: formData.website,
        portfolio: [],
      };

      await apiService.registerSupplier(supplierData);

      toast({
        title: t("auth.success.registrationSubmitted"),
        description: t("auth.success.supplierRegistrationSubmitted"),
      });

      navigate("/supplier-login");
    } catch (error: unknown) {
      let userFriendlyMessage = t("auth.errors.registrationFailed");

      // Handle different types of errors
      if (error instanceof Error) {
        // Check for specific error patterns and provide user-friendly messages
        const errorMsg = error.message.toLowerCase();

        console.log("Error message:", errorMsg);

        if (errorMsg.includes("email") && errorMsg.includes("already")) {
          userFriendlyMessage = t(
            "auth.errors.emailAlreadyExists",
            "This email is already registered. Please use a different email or try signing in."
          );
        } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
          userFriendlyMessage = t(
            "auth.errors.networkError",
            "Network connection failed. Please check your internet connection and try again."
          );
        } else if (errorMsg.includes("website")) {
          userFriendlyMessage = t(
            "auth.errors.websiteError",
            "Please enter a valid website URL."
          );
        } else if (
          errorMsg.includes("validation") ||
          errorMsg.includes("invalid")
        ) {
          userFriendlyMessage = t(
            "auth.errors.validationError",
            "Please check your information and make sure all required fields are filled correctly."
          );
        } else if (errorMsg.includes("server") || errorMsg.includes("500")) {
          userFriendlyMessage = t(
            "auth.errors.serverError",
            "Server is temporarily unavailable. Please try again in a few minutes."
          );
        } else if (errorMsg.includes("timeout")) {
          userFriendlyMessage = t(
            "auth.errors.timeoutError",
            "Request timed out. Please try again."
          );
        } else if (errorMsg.includes("password")) {
          userFriendlyMessage = t(
            "auth.errors.passwordError",
            "Password does not meet requirements. Please ensure it is at least 8 characters long."
          );
        } else if (
          error.message &&
          error.message.length > 0 &&
          error.message.length < 200
        ) {
          // Only use the original message if it's reasonable length and not an object string
          userFriendlyMessage = error.message;
        }
      } else if (typeof error === "object" && error !== null) {
        // Handle API error responses
        const apiError = error as any;
        if (apiError.response?.data?.message) {
          userFriendlyMessage = apiError.response.data.message;
        } else if (apiError.message) {
          userFriendlyMessage = apiError.message;
        }
      }

      toast({
        title: t("common.error"),
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("auth.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 ">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold text-gradient-primary">
              {t("auth.supplierRegister.title")}
            </CardTitle>
            <p className="text-muted-foreground">
              {t("auth.supplierRegister.subtitle")}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">
                  {t("auth.supplierRegister.basicInformation")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {t("auth.fullName")} {t("auth.required")}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder={t("auth.supplierRegister.namePlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t("auth.email")} {t("auth.required")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder={t("auth.supplierRegister.emailPlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {t("auth.password")} {t("auth.required")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder={t(
                          "auth.supplierRegister.passwordPlaceholder"
                        )}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t("auth.confirmPassword")} {t("auth.required")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        placeholder={t(
                          "auth.supplierRegister.confirmPasswordPlaceholder"
                        )}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("auth.phone")}</Label>
                    <Input
                      id="phone"
                      value={
                        formData.phone === 0
                          ? ""
                          : formData.phone
                      }
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder={t("auth.supplierRegister.phonePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">{t("auth.website")}</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder={t(
                        "auth.supplierRegister.websitePlaceholder"
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t("auth.businessDescription")}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder={t(
                      "auth.supplierRegister.descriptionPlaceholder"
                    )}
                    rows={3}
                  />
                </div>

                {/* Profile Image Section */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    {t("auth.supplierRegister.profilePicture")}{" "}
                    {t("auth.optional")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("auth.supplierRegister.profileImageOptional")}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex justify-center sm:justify-start">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={formData.profileImage || undefined}
                          alt="Profile"
                        />
                        <AvatarFallback className="text-lg">
                          {getInitials(formData.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("profile-upload")?.click()
                          }
                          className="w-full sm:w-auto justify-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {t("auth.supplierRegister.uploadImage")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                          className="w-full sm:w-auto justify-center"
                        >
                          <User className="w-4 h-4 mr-2" />
                          {t("auth.supplierRegister.chooseAvatar")}
                        </Button>
                      </div>
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Avatar Picker */}
                  {showAvatarPicker && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border rounded-lg bg-muted/30 max-h-48 overflow-y-auto">
                      {placeholderAvatars.map((avatar, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handlePlaceholderSelect(avatar)}
                          className="relative group"
                        >
                          <Avatar className="w-16 h-16 sm:w-16 sm:h-16 transition-transform group-hover:scale-105 mx-auto">
                            <AvatarImage src={avatar} />
                          </Avatar>
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Experience */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">
                  {t("auth.supplierRegister.locationAndExperience")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      {t("auth.city")} {t("auth.required")}
                    </Label>
                    <Input
                      id="city"
                      value={formData.location.city}
                      onChange={(e) =>
                        handleInputChange("location.city", e.target.value)
                      }
                      placeholder={t("auth.supplierRegister.cityPlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t("auth.country")}</Label>
                    <Input
                      id="country"
                      value={formData.location.country}
                      onChange={(e) =>
                        handleInputChange("location.country", e.target.value)
                      }
                      placeholder={t(
                        "auth.supplierRegister.countryPlaceholder"
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="experience">
                      {t("auth.yearsOfExperience")} {t("auth.optional")}
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={
                        formData.yearsOfExperience === 0
                          ? ""
                          : formData.yearsOfExperience
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          handleInputChange("yearsOfExperience", 0);
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            handleInputChange("yearsOfExperience", numValue);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          handleInputChange("yearsOfExperience", 0);
                        }
                      }}
                      placeholder={t(
                        "auth.supplierRegister.experiencePlaceholder"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Service Categories */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {t("auth.supplierRegister.serviceCategoriesTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("auth.supplierRegister.serviceCategoriesDescription")}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto sm:flex-shrink-0">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-64 justify-between"
                        >
                          {selectedServices.length > 0
                            ? `${selectedServices.length} ${t("auth.supplierRegister.servicesSelected")}`
                            : t("auth.supplierRegister.selectServiceCategories")}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 sm:w-64 p-0" align="end" side="bottom">
                        <div className="max-h-60 overflow-y-auto">
                          {Object.entries(availableCategories).map(
                            ([key, category]) => (
                              <div
                                key={key}
                                className="flex items-center space-x-2 p-3 hover:bg-muted/50 cursor-pointer"
                                onClick={() => toggleServiceCategory(key)}
                              >
                                <Checkbox
                                  checked={selectedServices.includes(key)}
                                  onChange={() => {}} // Controlled by parent click
                                  className="pointer-events-none"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {currentLanguage === "en" ? category.name.en : category.name.he}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {currentLanguage === "en" ? category.description.en : category.description.he}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {selectedServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedServices.map((serviceKey) => (
                      <Card key={serviceKey} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">
                                {availableCategories[serviceKey]?.name[currentLanguage] || serviceKey}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {availableCategories[serviceKey]?.description[currentLanguage]}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeServiceCategory(serviceKey)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      {t("auth.supplierRegister.noServiceCategoriesSelected")}
                    </p>
                  </Card>
                )}
              </div>

              {/* Terms and Agreement */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="terms-agreement"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) =>
                      setAgreeToTerms(checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="terms-agreement"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t("terms.agreement")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("auth.termsAgreementPrefix")}{" "}
                      <Link
                        to="/contact-terms"
                        className="text-accent hover:text-accent/80 underline font-medium transition-colors"
                        rel="noopener noreferrer"
                      >
                        {t("terms.readTerms")}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  {t("auth.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    isSubmitting || selectedServices.length === 0 || !agreeToTerms
                  }
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("auth.supplierRegister.submittingRegistration")}
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t("auth.supplierRegister.submitRegistration")}
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                {t("auth.supplierRegister.alreadyHaveAccount")}{" "}
                <Link
                  to="/supplier-login"
                  className="text-accent hover:text-accent/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                >
                  {t("auth.signInHere")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
