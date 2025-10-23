import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const Cookies = () => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    advertising: false
  });

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    toast.success('Cookie preferences saved successfully');
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      advertising: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    toast.success('All cookies accepted');
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      advertising: false
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyNecessary));
    toast.success('Cookie preferences updated');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground">Last updated: January 15, 2024</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cookie Preferences</CardTitle>
            <CardDescription>
              Manage your cookie preferences. You can change these settings at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="necessary" className="text-base font-medium">
                  Necessary Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Required for the website to function properly. Cannot be disabled.
                </p>
              </div>
              <Switch
                id="necessary"
                checked={preferences.necessary}
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="functional" className="text-base font-medium">
                  Functional Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable enhanced functionality and personalization.
                </p>
              </div>
              <Switch
                id="functional"
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, functional: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="analytics" className="text-base font-medium">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="advertising" className="text-base font-medium">
                  Advertising Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Used to deliver relevant advertisements to you.
                </p>
              </div>
              <Switch
                id="advertising"
                checked={preferences.advertising}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, advertising: checked }))
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSavePreferences} className="flex-1">
                Save Preferences
              </Button>
              <Button onClick={handleAcceptAll} variant="outline" className="flex-1">
                Accept All
              </Button>
              <Button onClick={handleRejectAll} variant="outline" className="flex-1">
                Reject All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-3">What Are Cookies?</h2>
                  <p className="text-muted-foreground">
                    Cookies are small text files that are placed on your computer or mobile device when you visit
                    a website. They are widely used to make websites work more efficiently and provide information
                    to the owners of the site.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">How We Use Cookies</h2>
                  <p className="text-muted-foreground mb-3">
                    We use cookies for various purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>To enable certain functions of the platform</li>
                    <li>To provide analytics and track usage patterns</li>
                    <li>To store your preferences and settings</li>
                    <li>To enhance security and prevent fraud</li>
                    <li>To deliver relevant content and advertisements</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Types of Cookies We Use</h2>

                  <div className="space-y-4 mt-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">1. Necessary Cookies</h3>
                      <p className="text-muted-foreground">
                        These cookies are essential for the website to function properly. They enable core
                        functionality such as security, network management, and accessibility. You cannot opt
                        out of these cookies.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Examples: Session cookies, authentication cookies, security cookies
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">2. Functional Cookies</h3>
                      <p className="text-muted-foreground">
                        These cookies enable the website to provide enhanced functionality and personalization.
                        They may be set by us or by third-party providers whose services we use.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Examples: Language preferences, theme preferences, user settings
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">3. Analytics Cookies</h3>
                      <p className="text-muted-foreground">
                        These cookies help us understand how visitors interact with our website by collecting
                        and reporting information anonymously. This helps us improve our service.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Examples: Google Analytics, usage statistics, performance monitoring
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">4. Advertising Cookies</h3>
                      <p className="text-muted-foreground">
                        These cookies are used to deliver advertisements that are relevant to you and your
                        interests. They may also be used to limit the number of times you see an advertisement.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Examples: Advertising networks, retargeting cookies, conversion tracking
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Third-Party Cookies</h2>
                  <p className="text-muted-foreground mb-3">
                    We may use third-party services that set cookies on our behalf:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Google Analytics for website analytics</li>
                    <li>Social media platforms for sharing functionality</li>
                    <li>Payment processors for secure transactions</li>
                    <li>Customer support tools for chat functionality</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Managing Cookies</h2>
                  <p className="text-muted-foreground mb-3">
                    You can control cookies through:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Our cookie preference center (above)</li>
                    <li>Your browser settings (most browsers allow you to refuse cookies)</li>
                    <li>Third-party opt-out tools</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    Please note that blocking some types of cookies may impact your experience on our website
                    and the services we are able to offer.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Updates to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Cookie Policy from time to time. We encourage you to review this page
                    periodically for the latest information on our cookie practices.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about our use of cookies, please contact us at
                    privacy@eventplatform.com.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cookies;
