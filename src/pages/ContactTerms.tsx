import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ContactTerms() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common.back')}
              </Button>
            </div>
            <CardTitle className="text-3xl font-bold text-gradient-primary">
              {t('terms.title')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">{t('terms.acceptance.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('terms.acceptance.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('terms.services.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('terms.services.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('terms.userAccounts.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('terms.userAccounts.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('terms.privacy.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('terms.privacy.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('terms.liability.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('terms.liability.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('terms.termination.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('terms.termination.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('terms.changes.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('terms.changes.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('terms.contact.title')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('terms.contact.content')}
                </p>
              </section>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t('terms.lastUpdated')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
