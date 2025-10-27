import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, UserPlus, Building2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import apiService from "@/services/api";

export default function ProducerRegister() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    description: "",
    phone: "",
    website: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoadingUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoadingUser && user) {
      const dashboardUrl = user.role === 'producer' ? "/producer-dashboard" : 
                          user.role === 'supplier' ? "/supplier-dashboard" : "/admin-dashboard";
      navigate(dashboardUrl);
    }
  }, [user, isLoadingUser, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: t('common.error'),
        description: t('auth.validation.required').replace('This field', 'Name'),
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: t('common.error'),
        description: t('auth.validation.required').replace('This field', 'Email'),
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: t('common.error'),
        description: t('auth.validation.email'),
        variant: "destructive",
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: t('common.error'),
        description: t('auth.validation.required').replace('This field', 'Password'),
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.passwordTooShort'),
        variant: "destructive",
      });
      return;
    }

    if (!formData.confirmPassword.trim()) {
      toast({
        title: t('common.error'),
        description: t('auth.validation.required').replace('This field', 'Confirm Password'),
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

    // Check if terms are agreed
    if (!agreeToTerms) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.agreeToTerms'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'producer',
        producerDetails: {
          companyName: formData.companyName.trim() || formData.name.trim(),
          description: formData.description.trim() || ''
        },
        phone: formData.phone.trim() || '',
      };

      await apiService.register(registrationData);

      toast({
        title: t('auth.success.registrationSuccessful'),
        description: t('auth.success.accountCreated'),
      });

      navigate('/producer-login');
    } catch (error: unknown) {
      let errorMessage = t('auth.errors.registrationFailed');
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.message || error.message;
        } catch {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
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
          <p className="text-muted-foreground">{t('auth.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 ">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="w-12 h-12 text-primary mr-3" />
            </div>
            <CardTitle className="text-3xl font-bold text-gradient-primary">
              {t('auth.producerRegister.title')}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('auth.producerRegister.subtitle')}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">{t('auth.producerRegister.basicInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('auth.fullName')} {t('auth.required')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={t('auth.producerRegister.namePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')} {t('auth.required')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder={t('auth.producerRegister.emailPlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')} {t('auth.required')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder={t('auth.producerRegister.passwordPlaceholder')}
                        className="pr-10"
                        required
                        minLength={6}
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
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')} {t('auth.required')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder={t('auth.producerRegister.confirmPasswordPlaceholder')}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">{t('auth.producerRegister.companyInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{t('auth.companyOptional')}</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder={t('auth.producerRegister.companyPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('auth.phone')}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder={t('auth.producerRegister.phonePlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t('auth.aboutBusiness')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder={t('auth.producerRegister.descriptionPlaceholder')}
                    rows={4}
                  />
                </div>
              </div>

              {/* Terms and Agreement */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="terms-agreement"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="terms-agreement" className="text-sm font-medium cursor-pointer">
                      {t('terms.agreement')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('auth.termsAgreementPrefix')}{' '}
                      <Link 
                        to="/contact-terms"
                        className="text-accent hover:text-accent/80 underline font-medium transition-colors"
                       
                        rel="noopener noreferrer"
                      >
                        {t('terms.readTerms')}
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
                  onClick={() => navigate('/')}
                >
                  {t('auth.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !agreeToTerms}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('auth.producerRegister.creatingAccount')}
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t('auth.producerRegister.createAccount')}
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                {t('auth.producerRegister.alreadyHaveAccount')}{' '}
                <Link 
                  to="/signin"
                  className="text-accent hover:text-accent/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
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
