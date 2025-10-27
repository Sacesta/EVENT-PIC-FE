import React from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isHebrew = i18n.language === 'he';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-primary">
            {t('terms.title')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6" dir={isHebrew ? 'rtl' : 'ltr'}>
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.intro.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.intro.content')}
              </p>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.definitions.title')}</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.definitions.platform')}</li>
                <li>{t('terms.definitions.client')}</li>
                <li>{t('terms.definitions.services')}</li>
                <li>{t('terms.definitions.usageFees')}</li>
                <li>{t('terms.definitions.clientAgreement')}</li>
              </ul>
            </section>

            {/* Nature of Engagement */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.nature.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.nature.content1')}</li>
                <li>{t('terms.nature.content2')}</li>
                <li>{t('terms.nature.content3')}</li>
                <li>{t('terms.nature.content4')}</li>
              </ul>
            </section>

            {/* Supplier Obligations */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.supplierObligations.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.supplierObligations.content1')}</li>
                <li>{t('terms.supplierObligations.content2')}</li>
                <li>{t('terms.supplierObligations.content3')}</li>
                <li>{t('terms.supplierObligations.content4')}</li>
                <li>{t('terms.supplierObligations.content5')}</li>
              </ul>
            </section>

            {/* Company Obligations */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.companyObligations.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.companyObligations.content1')}</li>
                <li>{t('terms.companyObligations.content2')}</li>
                <li>{t('terms.companyObligations.content3')}</li>
                <li>{t('terms.companyObligations.content4')}</li>
              </ul>
            </section>

            {/* Order Process */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.orderProcess.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.orderProcess.content1')}</li>
                <li>{t('terms.orderProcess.content2')}</li>
                <li>{t('terms.orderProcess.content3')}</li>
                <li>{t('terms.orderProcess.content4')}</li>
                <li>{t('terms.orderProcess.content5')}</li>
              </ul>
            </section>

            {/* Compensation */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.compensation.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.compensation.content1')}</li>
                <li>{t('terms.compensation.content2')}</li>
                <li>{t('terms.compensation.content3')}</li>
              </ul>
            </section>

            {/* Taxes */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.taxes.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.taxes.content1')}</li>
                <li>{t('terms.taxes.content2')}</li>
                <li>{t('terms.taxes.content3')}</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.intellectualProperty.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.intellectualProperty.content1')}</li>
                <li>{t('terms.intellectualProperty.content2')}</li>
                <li>{t('terms.intellectualProperty.content3')}</li>
              </ul>
            </section>

            {/* Confidentiality */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.confidentiality.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.confidentiality.content1')}</li>
                <li>{t('terms.confidentiality.content2')}</li>
                <li>{t('terms.confidentiality.content3')}</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.liability.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.liability.content1')}</li>
                <li>{t('terms.liability.content2')}</li>
                <li>{t('terms.liability.content3')}</li>
              </ul>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.indemnification.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.indemnification.content1')}</li>
                <li>{t('terms.indemnification.content2')}</li>
              </ul>
            </section>

            {/* Agreement Term and Termination */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.termination.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.termination.content1')}</li>
                <li>{t('terms.termination.content2')}</li>
                <li>{t('terms.termination.content3')}</li>
                <li>{t('terms.termination.content4')}</li>
                <li>{t('terms.termination.content5')}</li>
              </ul>
            </section>

            {/* General Provisions */}
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('terms.general.title')}</h2>
              <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('terms.general.content1')}</li>
                <li>{t('terms.general.content2')}</li>
                <li>{t('terms.general.content3')}</li>
                <li>{t('terms.general.content4')}</li>
                <li>{t('terms.general.content5')}</li>
                <li>{t('terms.general.content6')}</li>
                <li>{t('terms.general.content7')}</li>
              </ul>
            </section>

            {/* Appendix A - Compensation */}
            <section className="mt-8 pt-6 border-t">
              <h2 className="text-2xl font-bold mb-4">{t('terms.appendixA.title')}</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('terms.appendixA.usageFeeAmount')}</h3>
                  <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>{t('terms.appendixA.content1')}</li>
                    <li>{t('terms.appendixA.content2')}</li>
                    <li>{t('terms.appendixA.content3')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('terms.appendixA.paymentTerms')}</h3>
                  <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>{t('terms.appendixA.content4')}</li>
                    <li>{t('terms.appendixA.content5')}</li>
                    <li>{t('terms.appendixA.content6')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('terms.appendixA.vat')}</h3>
                  <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>{t('terms.appendixA.content7')}</li>
                    <li>{t('terms.appendixA.content8')}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Appendix B - SLA */}
            <section className="mt-8 pt-6 border-t">
              <h2 className="text-2xl font-bold mb-4">{t('terms.appendixB.title')}</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('terms.appendixB.availability')}</h3>
                  <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>{t('terms.appendixB.content1')}</li>
                    <li>{t('terms.appendixB.content2')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('terms.appendixB.responseTime')}</h3>
                  <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>{t('terms.appendixB.content3')}</li>
                    <li>{t('terms.appendixB.content4')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('terms.appendixB.customerService')}</h3>
                  <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>{t('terms.appendixB.content5')}</li>
                    <li>{t('terms.appendixB.content6')}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mt-8 pt-6 border-t">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
