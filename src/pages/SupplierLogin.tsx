import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogIn, Eye, EyeOff } from "lucide-react";
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

export default function SupplierLogin() {
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
  const { user, isLoadingUser, setUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoadingUser && user) {
      if (user.role === 'supplier') {
        navigate("/supplier-dashboard");
      } else {
        const dashboardUrl = user.role === 'admin' ? "/admin-dashboard" : "/producer-dashboard";
        navigate(dashboardUrl);
      }
    }
  }, [user, isLoadingUser, navigate]);

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
      const responseData = data as { data: { token: string; user: User } };

      if (responseData.data.user.role !== 'supplier' && responseData.data.user.role !== 'admin') {
        toast({
          title: t('common.error'),
          description: "This login page is for suppliers only. Please use the appropriate login page for your role.",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem('token', responseData.data.token);
      setUser(responseData.data.user);

      const dashboardUrl = responseData.data.user.role === 'admin' ? '/admin-dashboard' : '/supplier-dashboard';
      const welcomeMessage = responseData.data.user.role === 'admin'
        ? "You have successfully signed in to your admin account."
        : "You have successfully signed in to your supplier account.";

      toast({
        title: t('auth.login.welcomeBack'),
        description: welcomeMessage,
      });

      navigate(dashboardUrl);

    } catch (error: unknown) {
      let errorMessage = t('auth.errors.loginFailed');
      let errorTitle = t('common.error');

      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errorType) {
            switch (errorData.errorType) {
              case 'EMAIL_NOT_FOUND':
                errorTitle = 'Account Not Found';
                errorMessage = errorData.message || 'No supplier account found with this email.';
                break;
              case 'INVALID_PASSWORD':
                errorTitle = 'Incorrect Password';
                errorMessage = errorData.message || 'The password you entered is incorrect.';
                break;
              case 'ACCOUNT_DEACTIVATED':
                errorTitle = 'Account Deactivated';
                errorMessage = errorData.message || 'Your supplier account has been deactivated.';
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
            <CardTitle className="text-3xl font-semibold text-foreground">
              {t('auth.supplierLogin.title')}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('auth.supplierLogin.subtitle')}
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
                  disabled={isSigningIn}
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
                    disabled={isSigningIn}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSigningIn}
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
                  disabled={isSigningIn}
                >
                  {t('auth.forgotPassword')}
                </button>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="px-6"
                    disabled={isSigningIn}
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
                {t('auth.supplierLogin.noAccount')}{' '}
                <Link
                  to="/supplier-register"
                  className="text-accent hover:text-accent/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                >
                  {t('auth.supplierLogin.registerHere')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

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
