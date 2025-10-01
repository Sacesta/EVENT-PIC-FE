import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Store, ArrowLeft } from 'lucide-react';

export default function RoleSelection() {
  const { t } = useTranslation();
  const location = useLocation();
  const isSignUp = location.pathname === '/signup';
  const isSignIn = location.pathname === '/signin';

  const getTitle = () => {
    if (isSignUp) return t('auth.roleSelection.signUpTitle');
    if (isSignIn) return t('auth.roleSelection.signInTitle');
    return t('auth.roleSelection.title');
  };

  const getDescription = () => {
    if (isSignUp) return t('auth.roleSelection.signUpDescription');
    if (isSignIn) return t('auth.roleSelection.signInDescription');
    return t('auth.roleSelection.description');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-semibold text-foreground">
              {getTitle()}
            </CardTitle>
            <p className="text-muted-foreground">
              {getDescription()}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Producer Option */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Building2 className="w-12 h-12 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold">{t('auth.roleSelection.producer.title')}</h3>
                    <p className="text-muted-foreground">{t('auth.roleSelection.producer.description')}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {isSignUp ? (
                    <Link to="/producer-register" className="w-full">
                      <Button className="w-full">
                        {t('auth.roleSelection.producer.continue')}
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/producer-login" className="w-full">
                      <Button className="w-full">
                        {t('auth.roleSelection.producer.continue')}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Supplier Option */}
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Store className="w-12 h-12 text-secondary" />
                  <div>
                    <h3 className="text-xl font-semibold">{t('auth.roleSelection.supplier.title')}</h3>
                    <p className="text-muted-foreground">{t('auth.roleSelection.supplier.description')}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {isSignUp ? (
                    <Link to="/supplier-register" className="w-full">
                      <Button className="w-full bg-secondary hover:bg-secondary/90">
                        {t('auth.roleSelection.supplier.continue')}
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/supplier-login" className="w-full">
                      <Button className="w-full bg-secondary hover:bg-secondary/90">
                        {t('auth.roleSelection.supplier.continue')}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? (
                  <>
                    {t('auth.alreadyHaveAccount')}{' '}
                    <Link to="/signin" className="text-accent hover:text-accent/80 font-medium">
                      {t('auth.signInHere')}
                    </Link>
                  </>
                ) : (
                  <>
                    {t('auth.noAccount')}{' '}
                    <Link to="/signup" className="text-accent hover:text-accent/80 font-medium">
                      {t('auth.registerHere')}
                    </Link>
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
