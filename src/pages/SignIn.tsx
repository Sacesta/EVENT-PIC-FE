import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogIn, Eye, EyeOff, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { useAuth } from '@/hooks/use-auth';
import apiService from "@/services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  supplierDetails?: {
    companyName: string;
    categories: string[];
  };
  producerDetails?: {
    companyName: string;
  };
}

interface LoginResponse {
  data?: {
    token: string;
    user: User;
  };
  token?: string;
  user?: User;
  success?: boolean;
  message?: string;
}

export default function SignIn() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoadingUser, setUser, setIsLoadingUser } = useAuth();
  const [searchParams] = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoadingUser && user) {
      // Redirect to appropriate dashboard based on user role
      const dashboardUrl = getDashboardUrl(user);
      navigate(dashboardUrl);
    }
  }, [user, isLoadingUser, navigate]);

  const getDashboardUrl = (user: User) => {
    switch (user.role) {
      case 'admin':
        return "/admin-dashboard";
      case 'supplier':
        return "/supplier-dashboard";
      case 'producer':
      default:
        return "/producer-dashboard";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.fillRequiredFields'),
        variant: "destructive",
      });
      return;
    }

    setIsSigningIn(true);

    try {
      const data = await apiService.login(credentials);

      console.log('🔍 Raw API response:', data);

      // Handle different possible response structures with proper type assertions
      let token: string;
      let userData: User;

      const responseData = data as LoginResponse; // Type assertion to access properties

      if (responseData.data && responseData.data.token && responseData.data.user) {
        // Structure: { data: { token, user } }
        token = responseData.data.token;
        userData = responseData.data.user;
      } else if (responseData.token && responseData.user) {
        // Structure: { token, user }
        token = responseData.token;
        userData = responseData.user;
      } else if (responseData.data && responseData.data.token) {
        // Structure: { data: { token } } - user might be separate
        token = responseData.data.token;
        userData = responseData.data.user || responseData.user;
      } else {
        throw new Error('Invalid response structure: missing token or user data');
      }

      console.log('🔍 Extracted Token:', token);
      console.log('🔍 Extracted User:', userData);

      if (!token) {
        throw new Error('No token received from server');
      }

      if (!userData) {
        throw new Error('No user data received from server');
      }

      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('🔍 Token stored in localStorage:', localStorage.getItem('token'));
      
      // Update the global user state
      setUser(userData);

      // Check if there's a return URL from event creation flow
      const returnUrl = searchParams.get('returnUrl');
      const savedEventData = sessionStorage.getItem('createEventData');

      if (returnUrl && savedEventData && userData.role === 'producer') {
        try {
          const eventData = JSON.parse(savedEventData);
          if (eventData.pendingSubmission) {
            // Show success message for login
            toast({
              title: t('auth.login.welcomeBack'),
              description: "Welcome back! Redirecting to complete your event creation...",
            });

            // Navigate back to the event creation step
            navigate(decodeURIComponent(returnUrl));
            return;
          }
        } catch (error) {
          console.error('Error parsing saved event data:', error);
        }
      }

      // Default navigation logic with role-specific messages
      const dashboardUrl = getDashboardUrl(userData);
      const welcomeMessage = userData.role === 'admin'
        ? "You have successfully signed in to your admin account."
        : userData.role === 'supplier'
        ? "You have successfully signed in to your supplier account."
        : "You have successfully signed in to your producer account.";

      toast({
        title: t('auth.login.welcomeBack'),
        description: welcomeMessage,
      });

      navigate(dashboardUrl);

    } catch (error: unknown) {
      let errorMessage = t('auth.errors.loginFailed');
      let errorTitle = t('common.error');

      // Handle specific error types from backend
      if (error instanceof Error) {
        try {
          // Try to parse error response if it's a fetch error
          const errorData = JSON.parse(error.message);
          if (errorData.errorType) {
            switch (errorData.errorType) {
              case 'EMAIL_NOT_FOUND':
                errorTitle = 'Account Not Found';
                errorMessage = errorData.message || 'No account found with this email.';
                break;
              case 'INVALID_PASSWORD':
                errorTitle = 'Incorrect Password';
                errorMessage = errorData.message || 'The password you entered is incorrect.';
                break;
              case 'ACCOUNT_DEACTIVATED':
                errorTitle = 'Account Deactivated';
                errorMessage = errorData.message || 'Your account has been deactivated.';
                break;
              case 'SERVER_ERROR':
                errorTitle = 'Server Error';
                errorMessage = errorData.message || 'Server error. Please try again later.';
                break;
              default:
                errorMessage = errorData.message || error.message;
            }
          } else {
            errorMessage = errorData.message || error.message;
          }
        } catch {
          // If parsing fails, use the error message as is
          errorMessage = error.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPasswordOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setIsForgotPasswordOpen(false);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-semibold text-foreground">
              {t('auth.signIn')}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('auth.login.signInToContinue')}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
              <div className="space-y-4 pt-4">
                <button
                  type="button"
                  className="text-sm text-secondary hover:text-secondary/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded"
                  onClick={handleForgotPasswordClick}
                >
                  {t('auth.forgotPassword')}
                </button>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="px-6"
                  >
                    {t('auth.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md transition-all duration-300"
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('auth.login.signingIn')}
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        {t('auth.login.signIn')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                {t('auth.noAccount')}{' '}
                <Link
                  to="/signup"
                  className="text-accent hover:text-accent/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                >
                  {t('auth.registerHere')}
                </Link>
              </p>

            </div>
          </CardContent>
        </Card>

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={handleForgotPasswordClose}
          onBackToLogin={handleForgotPasswordClose}
          initialEmail={credentials.email}
        />
      </div>
    </div>
  );
}
