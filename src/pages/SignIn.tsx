import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogIn } from "lucide-react";
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
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoadingUser, setUser, setIsLoadingUser } = useAuth();

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

      toast({
        title: t('common.success'),
        description: t('auth.login.welcomeBack'),
      });

      // Navigate to appropriate dashboard
      const dashboardUrl = getDashboardUrl(userData);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToHome')}
              </Link>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {t('auth.signIn')} to PIC
            </CardTitle>
            <p className="text-gray-600">
              {t('auth.login.signInToContinue')}
            </p>
          </CardHeader>
          
          <CardContent>
          <form onSubmit={handleSignInSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t('auth.email')} {t('auth.required')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.login.emailPlaceholder')}
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t('auth.password')} {t('auth.required')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.login.passwordPlaceholder')}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button 
                type="button" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                onClick={handleForgotPasswordClick}
              >
                {t('auth.forgotPassword')}
              </button>
            </div>

            {/* Sign In Button */}
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('auth.login.signingIn')}
                </>
              ) : (
                t('auth.login.signIn')
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              {t('auth.noAccount')}{' '}
              <Link 
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
