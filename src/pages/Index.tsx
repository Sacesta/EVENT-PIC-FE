import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreateEventButton } from '@/components/CreateEventButton';
import { SupplierSignInLink } from '@/components/SupplierSignInLink';
import { useAuth } from '@/hooks/use-auth'; // We'll create this hook

const Index = () => {
  const { t } = useTranslation();
  const { user, isLoadingUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-background relative">
      <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-40 h-40 border-radius-full ">
            <img 
              src="/image.png" 
              alt="Pic Logo" 
              className="w-full h-full object-contain border-radius-full"
              style={{borderRadius: '80px'}}
            />
          </div>
        </div>

        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-xl lg:text-2xl text-muted-foreground font-medium">
            {t('homepage.title') + ' - ' + t('homepage.tagline')}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <CreateEventButton />
          
          {/* Show sign-in/sign-up only when user is not logged in */}
          {!isLoadingUser && !user && (
            <div className="flex justify-center">
              <SupplierSignInLink />
            </div>
          )}
          
          {/* Show welcome message when user is logged in */}
          {!isLoadingUser && user && (
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-foreground">
                👋 {t('homepage.welcomeBack', { name: user.name || user.email })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('homepage.alreadySignedIn')}
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Index;
