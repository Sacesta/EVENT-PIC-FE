import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: January 15, 2024</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using this event management platform, you accept and agree to be bound by the
                  terms and provision of this agreement. If you do not agree to these terms, please do not use
                  this platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
                <p className="text-muted-foreground mb-3">
                  Permission is granted to temporarily use this platform for personal, non-commercial transitory
                  viewing only. This is the grant of a license, not a transfer of title, and under this license
                  you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or public display</li>
                  <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
                  <li>Remove any copyright or proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or mirror the materials on any other server</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
                <p className="text-muted-foreground mb-3">
                  When you create an account with us, you must provide accurate, complete, and current information.
                  Failure to do so constitutes a breach of the Terms, which may result in immediate termination of
                  your account.
                </p>
                <p className="text-muted-foreground">
                  You are responsible for safeguarding the password that you use to access the Service and for any
                  activities or actions under your password, whether your password is with our Service or a
                  third-party service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. User Responsibilities</h2>
                <p className="text-muted-foreground mb-3">
                  As a user of this platform, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide accurate and truthful information about yourself and your business</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Honor commitments made through the platform</li>
                  <li>Treat other users with respect and professionalism</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not engage in fraudulent or deceptive practices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Service Provider Responsibilities</h2>
                <p className="text-muted-foreground mb-3">
                  Suppliers using this platform agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Accurately represent their services and capabilities</li>
                  <li>Provide services as described in agreements</li>
                  <li>Respond to inquiries in a timely manner</li>
                  <li>Maintain necessary licenses and insurance</li>
                  <li>Deliver quality services meeting industry standards</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Payment Terms</h2>
                <p className="text-muted-foreground mb-3">
                  All fees for using our platform are clearly stated. Payment is required in accordance with the
                  billing terms presented to you at the time of purchase. We reserve the right to change our fees
                  with reasonable notice.
                </p>
                <p className="text-muted-foreground">
                  Refunds are handled on a case-by-case basis in accordance with our refund policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  The Service and its original content, features, and functionality are owned by us and are
                  protected by international copyright, trademark, patent, trade secret, and other intellectual
                  property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  In no event shall we be liable for any damages arising out of the use or inability to use the
                  materials on this platform, even if we or an authorized representative has been notified orally
                  or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any
                  reason whatsoever, including without limitation if you breach the Terms. Upon termination, your
                  right to use the Service will immediately cease.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed and construed in accordance with applicable laws, without regard
                  to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we
                  will provide at least 30 days notice prior to any new terms taking effect. What constitutes a
                  material change will be determined at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">12. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms, please contact us at legal@eventplatform.com.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;
